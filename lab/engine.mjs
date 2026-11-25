const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR = /^#[a-f0-9]{6}$/i;
const ASSET = /^(?:[a-z0-9_-]+\/)*[a-z0-9_.-]+\.(?:svg|png|webp|jpe?g)$/i;
const SCALE = 10000;

function requireField(condition, path) {
  if (!condition) throw new Error(`配置字段无效：${path}`);
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function integer(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function id(value) {
  return typeof value === 'string' && ID.test(value);
}

function uniqueIds(items, path, min, max = Infinity) {
  requireField(Array.isArray(items) && items.length >= min && items.length <= max, path);
  const ids = items.map((item) => item?.id);
  requireField(ids.every(id) && new Set(ids).size === ids.length, `${path}.id`);
  return new Set(ids);
}

function optionWeight(option, key) {
  return Object.hasOwn(option.weights, key) ? option.weights[key] : 0;
}

function image(value, path) {
  requireField(record(value) && typeof value.src === 'string' &&
    ASSET.test(value.src) && !value.src.split('/').includes('..') && text(value.alt), path);
}

function optionalLabels(value, allowed, path) {
  if (value === undefined) return;
  requireField(record(value) && Object.entries(value).every(([key, label]) =>
    allowed.includes(key) && text(label)), path);
}

export function validateManifest(manifest) {
  requireField(record(manifest) && Array.isArray(manifest.tests), 'tests');
  requireField(manifest.tests.every(id) && new Set(manifest.tests).size === manifest.tests.length, 'tests');
  return manifest.tests;
}

export function prepareTest(config, expectedId = config?.id) {
  requireField(record(config) && id(config.id) && config.id === expectedId, 'id');
  for (const field of ['title', 'description', 'version']) {
    requireField(text(config[field]), field);
  }
  requireField(Array.isArray(config.intro) && config.intro.length && config.intro.every(text), 'intro');
  requireField(integer(config.minutes, 1, 120), 'minutes');
  image(config.cover, 'cover');
  requireField(record(config.theme) && ['dark', 'light'].every((key) =>
    typeof config.theme[key] === 'string' && COLOR.test(config.theme[key])), 'theme');

  const dimensionIds = uniqueIds(config.dimensions, 'dimensions', 3, 8);
  for (const dimension of config.dimensions) {
    const path = `dimensions.${dimension.id}`;
    requireField(text(dimension.label) && text(dimension.low) && text(dimension.high), path);
    requireField(dimension.weight === undefined || integer(dimension.weight, 1, 10), `${path}.weight`);
  }

  uniqueIds(config.questions, 'questions', 1, 100);
  for (const question of config.questions) {
    const path = `questions.${question.id}`;
    requireField(text(question.prompt), `${path}.prompt`);
    uniqueIds(question.options, `${path}.options`, 2, 8);
    for (const option of question.options) {
      requireField(text(option.text) && record(option.weights) &&
        Object.entries(option.weights).every(([key, value]) =>
          dimensionIds.has(key) && integer(value, -10, 10)), `${path}.options.${option.id}`);
    }
  }

  const ranges = config.dimensions.map(({ id: key }) => {
    let min = 0;
    let max = 0;
    for (const question of config.questions) {
      const weights = question.options.map((option) => optionWeight(option, key));
      min += Math.min(...weights);
      max += Math.max(...weights);
    }
    requireField(max > min, `dimensions.${key}（题目权重需产生不同得分）`);
    return { min, max };
  });

  requireField(config.matching?.method === 'weighted-distance', 'matching.method');
  requireField(config.report === undefined || record(config.report), 'report');
  const report = config.report ?? {};
  optionalLabels(report.labels, ['certificate', 'profile', 'dimensions', 'traits', 'partner'], 'report.labels');
  const sections = report.sections === undefined ? [] : report.sections;
  const sectionIds = uniqueIds(sections, 'report.sections', 0, 12);
  requireField(sections.every((section) => text(section.label)), 'report.sections.label');

  const typeIds = uniqueIds(config.types, 'types', 2, 40);
  requireField(new Set(config.types.map((type) => type.code)).size === typeIds.size, 'types.code');
  for (const type of config.types) {
    const path = `types.${type.id}`;
    for (const field of ['name', 'code', 'summary', 'description']) {
      requireField(text(type[field]), `${path}.${field}`);
    }
    image(type.image, `${path}.image`);
    requireField(Array.isArray(type.traits) && type.traits.length &&
      type.traits.every(text), `${path}.traits`);
    requireField(record(type.target) && Object.keys(type.target).length === dimensionIds.size &&
      Object.entries(type.target).every(([key, value]) =>
        dimensionIds.has(key) && integer(value, 0, 100)), `${path}.target`);
    requireField(type.quote === undefined || text(type.quote), `${path}.quote`);
    if (type.partner !== undefined) {
      requireField(record(type.partner) && typeIds.has(type.partner.typeId) &&
        type.partner.typeId !== type.id && text(type.partner.reason), `${path}.partner`);
    }
    if (type.sections !== undefined) {
      requireField(record(type.sections) && Object.entries(type.sections).every(([key, value]) =>
        sectionIds.has(key) && (text(value) || (Array.isArray(value) && value.length && value.every(text)))),
      `${path}.sections`);
    }
  }

  return { config, ranges };
}

export function scoreTest(test, answers) {
  const { config, ranges } = test;
  if (!Array.isArray(answers) || answers.length !== config.questions.length) {
    throw new Error('请先完成所有题目。');
  }
  const selected = config.questions.map((question, index) => {
    const option = question.options.find((item) => item.id === answers[index]);
    if (!option) throw new Error(`未作答或选项无效：${question.id}`);
    return option;
  });

  const dimensions = config.dimensions.map((dimension, index) => {
    const raw = selected.reduce((sum, option) => sum + optionWeight(option, dimension.id), 0);
    const { min, max } = ranges[index];
    const normalized = Math.round(SCALE * (raw - min) / (max - min));
    return { ...dimension, normalized, level: Math.min(5, Math.floor(normalized / (SCALE / 5)) + 1) };
  });

  let type = null;
  let nearestDistance = Infinity;
  for (const candidate of config.types) {
    const distance = dimensions.reduce((sum, dimension) => {
      const difference = dimension.normalized - candidate.target[dimension.id] * (SCALE / 100);
      return sum + (dimension.weight ?? 1) * difference ** 2;
    }, 0);
    // Strict comparison keeps the earlier configured type when distances tie.
    if (distance < nearestDistance) {
      nearestDistance = distance;
      type = candidate;
    }
  }
  return { type, dimensions };
}

export function restoreProgress(config, saved) {
  const fresh = { answers: [], index: 0, complete: false };
  if (saved?.version !== config.version || !Array.isArray(saved.answers)) return fresh;

  const answers = [];
  for (const [index, question] of config.questions.entries()) {
    if (!question.options.some((option) => option.id === saved.answers[index])) break;
    answers.push(saved.answers[index]);
  }
  const lastIndex = Math.min(answers.length, config.questions.length - 1);
  const index = integer(saved.index, 0, lastIndex) ? saved.index : lastIndex;
  return { answers, index, complete: saved.complete === true && answers.length === config.questions.length };
}
