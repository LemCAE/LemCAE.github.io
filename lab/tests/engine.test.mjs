import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { prepareTest, restoreProgress, scoreTest, validateManifest } from '../engine.mjs';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const manifest = await readJson('../catalog.json');
const structures = await readJson('./structures.json');
const reading = await readJson('./fixtures/reading.json');
const structureTest = prepareTest(structures);
const readingTest = prepareTest(reading);

// Each route follows the behavior described in that type's report.
const routes = {
  simple: 'cbdbbacacdcbbbbb',
  cantilever: 'dbabbacdaabbdbdb',
  continuous: 'badadaacbbddbaaa',
  frame: 'cccdccdcccbacbcc',
  truss: 'bacdcbacdbddcaaa',
  cable: 'bdbaadbbdbccacaa',
  arch: 'adbcaabdbbccdddd',
  column: 'ccabccdbccabbccc'
};

test('the catalog loads the mechanics test and all its illustrations', async () => {
  assert.deepEqual(validateManifest(manifest), [structures.id]);
  assert.equal(structures.questions.length, 16);
  assert.ok(structures.questions.every(({ options }) => options.length === 4));
  const art = [structures.cover, ...structures.types.map(({ image }) => image)];
  await Promise.all(art.map(({ src }) => access(new URL(`../${src}`, import.meta.url))));
  assert.throws(() => validateManifest({ tests: ['structures', 'structures'] }), /tests/);
  assert.throws(() => validateManifest({ tests: ['../structures'] }), /tests/);
});

test('uniformly sampled structures answers reach all eight types without a dominant result', () => {
  const sampleSize = 20000;
  const counts = new Map(structures.types.map(({ id }) => [id, 0]));
  // Seeded sampling keeps this coverage check reproducible.
  let seed = 0x5eed1234;
  for (let sample = 0; sample < sampleSize; sample += 1) {
    const answers = structures.questions.map(({ options }) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return options[Math.floor(seed / 2 ** 32 * options.length)].id;
    });
    const { type } = scoreTest(structureTest, answers);
    counts.set(type.id, counts.get(type.id) + 1);
  }
  for (const [typeId, count] of counts) {
    const share = count / sampleSize;
    assert.ok(share >= 0.05 && share <= 0.22, `${typeId}: ${share}`);
  }
});

test('all eight structures have representative routes with reproducible results', () => {
  assert.deepEqual(Object.keys(routes), structures.types.map(({ id }) => id));
  for (const [typeId, route] of Object.entries(routes)) {
    const result = scoreTest(structureTest, [...route]);
    assert.equal(result.type.id, typeId);
    assert.deepEqual(scoreTest(structureTest, [...route]), result);
    for (const dimension of result.dimensions) {
      assert.ok(dimension.normalized >= 0 && dimension.normalized <= 10000);
      assert.ok(dimension.level >= 1 && dimension.level <= 5);
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
