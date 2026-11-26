import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { prepareTest, restoreProgress, scoreTest, validateManifest } from '../engine.mjs';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const manifest = await readJson('../catalog.json');
const structures = await readJson('./structures.json');
const yellow = await readJson('./yellow.json');
const reading = await readJson('./fixtures/reading.json');
const structureTest = prepareTest(structures);
const yellowTest = prepareTest(yellow);
const readingTest = prepareTest(reading);

// Each route follows the behavior described in that type's report.
const routes = {
  simple: 'dbdbbdbbacaaddda',
  cantilever: 'cbadbabbaaadcaaa',
  continuous: 'bccabbdbddccdcdd',
  frame: 'abbabbcababbaabb',
  truss: 'bcbaabbddabcdcbd',
  cable: 'cdddcdcaadcaabdc',
  arch: 'cdccccaccbcabbab',
  column: 'dadadddabddaddbc'
};

const yellowRoutes = {
  nailong: 'babadcccbdddaabb',
  naifrog: 'cbabccbaacbaabac',
  naidann: 'dbdaadaabdcccbcc',
  niulai: 'ccacddbaacbaacdd',
  kangaroo: 'adacaaadadddaabd'
};

test('the catalog loads all published tests and their illustrations', async () => {
  assert.deepEqual(validateManifest(manifest), [structures.id, yellow.id]);
  for (const config of [structures, yellow]) {
    assert.equal(config.questions.length, 16);
    assert.ok(config.questions.every(({ options }) => options.length === 4));
    const art = [config.cover, ...config.types.map(({ image }) => image)];
    await Promise.all(art.map(({ src }) => access(new URL(`../${src}`, import.meta.url))));
  }
  assert.throws(() => validateManifest({ tests: ['structures', 'structures'] }), /tests/);
  assert.throws(() => validateManifest({ tests: ['../structures'] }), /tests/);
});

test('uniformly sampled answers reach all types without a dominant result', () => {
  const sampleSize = 20000;
  for (const [config, compiled, minShare, maxShare] of [
    [structures, structureTest, 0.05, 0.22],
    [yellow, yellowTest, 0.12, 0.30]
  ]) {
    const counts = new Map(config.types.map(({ id }) => [id, 0]));
    // Seeded sampling keeps this coverage check reproducible.
    let seed = 0x5eed1234;
    for (let sample = 0; sample < sampleSize; sample += 1) {
      const answers = config.questions.map(({ options }) => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return options[Math.floor(seed / 2 ** 32 * options.length)].id;
      });
      const { type } = scoreTest(compiled, answers);
      counts.set(type.id, counts.get(type.id) + 1);
    }
    for (const [typeId, count] of counts) {
      const share = count / sampleSize;
      assert.ok(share >= minShare && share <= maxShare, `${config.id}.${typeId}: ${share}`);
    }
  }
});

test('all published types have representative routes with reproducible results', () => {
  for (const [config, compiled, expectedRoutes] of [
    [structures, structureTest, routes],
    [yellow, yellowTest, yellowRoutes]
  ]) {
    assert.deepEqual(Object.keys(expectedRoutes), config.types.map(({ id }) => id));
    for (const [typeId, route] of Object.entries(expectedRoutes)) {
      const result = scoreTest(compiled, [...route]);
      assert.equal(result.type.id, typeId);
      assert.ok(Number.isInteger(result.matchPercent) && result.matchPercent >= 0 && result.matchPercent <= 100);
      assert.ok(result.runnerUp && result.runnerUp.type.id !== typeId);
      assert.ok(result.runnerUp.matchPercent <= result.matchPercent);
      assert.deepEqual(scoreTest(compiled, [...route]), result);
      for (const dimension of result.dimensions) {
        assert.ok(dimension.normalized >= 0 && dimension.normalized <= 10000);
        assert.ok(dimension.level >= 1 && dimension.level <= 5);
      }
    }
  }
});

test('a non-mechanics configuration works and replacing an answer recomputes the match', () => {
  const answers = ['window', 'send'];
  const first = scoreTest(readingTest, answers);
  assert.equal(first.type.id, 'window');
  assert.deepEqual(first.dimensions.map(({ normalized, level }) => [normalized, level]),
    [[8000, 5], [10000, 5], [5000, 3]]);
  answers[0] = 'cafe';
  const edited = scoreTest(readingTest, answers);
  assert.equal(edited.type.id, 'cafe');
  assert.deepEqual(edited.dimensions.map(({ normalized, level }) => [normalized, level]),
    [[0, 1], [0, 1], [10000, 5]]);
  assert.throws(() => scoreTest(readingTest, ['window']), /完成所有题目/);
  assert.throws(() => scoreTest(readingTest, ['window', 'invalid']), /选项无效/);
});

test('equal matching distances use configuration order', () => {
  const tied = structuredClone(reading);
  tied.types[1].target = tied.types[0].target;
  assert.equal(scoreTest(prepareTest(tied), ['window', 'keep']).type.id, 'window');
  tied.types.reverse();
  assert.equal(scoreTest(prepareTest(tied), ['window', 'keep']).type.id, 'cafe');
});

test('missing or incompatible configuration is rejected at load time', () => {
  assert.throws(() => prepareTest(reading, 'another-id'), /id/);
  const bad = structuredClone(reading);
  delete bad.types[0].target.quiet;
  assert.throws(() => prepareTest(bad), /target/);
  bad.types[0].target.quiet = 100;
  bad.questions[0].options[0].weights.light = 0;
  assert.throws(() => prepareTest(bad), /dimensions.light/);
  bad.questions[0].options[0].weights.light = 2;
  bad.types[0].partner = { typeId: 'missing', reason: 'foo' };
  assert.throws(() => prepareTest(bad), /partner/);
  delete bad.types[0].partner;
  bad.cover.src = 'https://example.com/cover.svg';
  assert.throws(() => prepareTest(bad), /cover/);
});

test('progress retains edited answers and question position across reloads', () => {
  const saved = { version: reading.version, answers: ['window', 'send'], index: 0, complete: false };
  assert.deepEqual(restoreProgress(reading, saved),
    { answers: ['window', 'send'], index: 0, complete: false });
  assert.deepEqual(restoreProgress(reading, { ...saved, index: 1, complete: true }),
    { answers: ['window', 'send'], index: 1, complete: true });
  assert.deepEqual(restoreProgress(reading, { ...saved, answers: ['window', 'invalid'], index: 99, complete: true }),
    { answers: ['window'], index: 1, complete: false });
  assert.deepEqual(restoreProgress(reading, { ...saved, version: 'old' }),
    { answers: [], index: 0, complete: false });
  assert.deepEqual(restoreProgress(reading, null), { answers: [], index: 0, complete: false });
});

test('the rewritten structures test starts fresh for both kinds of version 1 progress', () => {
  for (const saved of [
    { answers: ['a', 'b'], index: 2, complete: false },
    { answers: Array(18).fill('a'), index: 17, complete: true }
  ]) {
    assert.deepEqual(restoreProgress(structures, { ...saved, version: '1.0.0' }),
      { answers: [], index: 0, complete: false });
  }
});
