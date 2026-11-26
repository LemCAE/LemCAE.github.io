import { prepareTest, restoreProgress, scoreTest, validateManifest } from './engine.mjs';
import { createReportPng } from './share.mjs';

const root = document.querySelector('#lab');
const html = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
const themeKey = 'lemcae-theme';
const title = '非正常人类研究中心';
const note = '本测试纯属娱乐，无心理学或科学诊断意义。';
const levels = ['偏低', '略低', '居中', '略高', '偏高'];
let shareObjectUrl;

function el(tag, className, ...children) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.append(...children);
  return element;
}

function anchor(label, href, className = 'lab-button secondary') {
  const link = el('a', className, label);
  link.href = href;
  return link;
}

function button(label, onClick, className = 'lab-button') {
  const control = el('button', className, label);
  control.type = 'button';
  if (onClick) control.addEventListener('click', onClick);
  return control;
}

function illustration(asset, className = 'lab-art', decorative = false) {
  const img = el('img', className);
  img.src = asset.src;
  img.alt = decorative ? '' : asset.alt;
  img.decoding = 'async';
  return img;
}

function mount(view, moveFocus = true) {
  if (shareObjectUrl) {
    URL.revokeObjectURL(shareObjectUrl);
    shareObjectUrl = undefined;
  }
  root.replaceChildren(view);
  root.setAttribute('aria-busy', 'false');
  if (moveFocus) {
    const heading = view.querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function setTheme(theme) {
  html.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? '浅色模式' : '深色模式';
  themeButton.setAttribute('aria-pressed', String(theme === 'light'));
}

setTheme(html.dataset.theme);
themeButton.addEventListener('click', () => {
  setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem(themeKey, html.dataset.theme); } catch {}
});

function applyAccent(element, theme) {
  element.dataset.testTheme = '';
  element.style.setProperty('--test-dark', theme.dark);
  element.style.setProperty('--test-light', theme.light);
  return element;
}

function testHref(id) {
  return `?test=${encodeURIComponent(id)}`;
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status} (${path})`);
  return response.json();
}

async function loadTest(id) {
  return prepareTest(await fetchJson(`./tests/${id}.json`), id);
}

function facts(config) {
  return el('p', 'lab-facts', `${config.questions.length} 题 · 约 ${config.minutes} 分钟`);
}

function renderLobby(tests, failures) {
  const intro = el('header', 'card lab-masthead',
    el('p', 'lab-kicker', 'LemCAE / 网页实验田'),
    el('h1', '', title),
    el('p', 'lab-subtitle', '以严谨的工程技术，研究毫无意义的问题。'));
  const cards = el('div', 'lab-catalog');
  for (const { config } of tests) {
    const link = applyAccent(anchor('', testHref(config.id), 'card card-interactive lab-test-card'), config.theme);
    link.replaceChildren(illustration(config.cover, 'lab-art catalog-art', true),
      el('div', 'lab-test-copy',
        facts(config), el('h3', '', config.title), el('p', 'lab-muted', config.description),
        el('span', 'lab-card-link', '查看实验')));
    cards.append(link);
  }
  const catalog = el('section', 'lab-catalog-section', el('h2', '', '已开放的测试'), cards);
  if (failures > 0) catalog.append(el('p', 'lab-message', `有 ${failures} 项测试加载失败，请稍后刷新页面。`));
  if (!tests.length && !failures) catalog.append(el('p', 'lab-message', '目前没有已发布的测试。'));
  mount(el('div', 'lab-stack', intro, catalog), false);
}

function renderError(message) {
  mount(el('section', 'card lab-error',
    el('h1', '', '暂时无法打开测试'),
    el('p', 'lab-muted', message),
    el('div', 'lab-actions', anchor('返回测试大厅', './'))));
}

function renderTest(test) {
  const { config } = test;
  const storageKey = `lemcae-quiz:${config.id}`;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  let state = restoreProgress(config, saved);
  let storageAvailable = true;

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...state, version: config.version }));
    } catch {
      storageAvailable = false;
    }
  }

  function show(view, moveFocus) {
    mount(applyAccent(view, config.theme), moveFocus);
  }

  function intro(moveFocus = true) {
    const label = state.complete ? '查看上次报告' : (state.answers.length ? '继续答题' : '开始测试');
    const copy = el('div', 'intro-copy',
      el('p', 'lab-kicker', '实验说明'),
      el('h1', '', config.title),
      facts(config),
      ...config.intro.map((paragraph) => el('p', 'lab-muted', paragraph)),
      el('div', 'lab-actions', button(label, () => state.complete ? report() : question())),
      el('p', 'lab-disclaimer', note));
    show(el('section', 'card lab-intro', copy,
      illustration(config.cover, 'lab-art intro-art')), moveFocus);
  }

  function question() {
    const item = config.questions[state.index];
    const position = state.index + 1;
    const total = config.questions.length;
    const progress = el('progress', 'quiz-progress');
    progress.max = total;
    progress.value = state.answers.length;
    progress.setAttribute('aria-label', '已作答题数');
    const answered = el('span', '', `已答 ${state.answers.length} 题`);
    const progressRow = el('div', 'quiz-progress-row',
      el('span', '', `第 ${position} / ${total} 题`), answered);
    const heading = el('h1', 'quiz-prompt', item.prompt);
    heading.id = 'question-prompt';
    const choices = el('fieldset', 'quiz-options');
    choices.setAttribute('aria-labelledby', heading.id);
    const next = button(position === total ? '查看报告' : '下一题');
    next.type = 'submit';
    next.disabled = !state.answers[state.index];

    const saveMessage = el('p', 'quiz-save', storageAvailable
      ? '进度保存在此设备。' : '浏览器无法保存进度，关闭页面会丢失记录。');
    saveMessage.setAttribute('role', 'status');

    let advanceTimer;
    let arrowNav = false;
    let handledInChange = false;
    function advance() {
      clearTimeout(advanceTimer);
      if (!state.answers[state.index]) return;
      if (position === total) {
        state.complete = true;
        persist();
        report();
        return;
      }
      state.index += 1;
      persist();
      question();
    }
    function scheduleAdvance() {
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(advance, 180);
    }

    choices.addEventListener('pointerdown', () => {
      arrowNav = false;
      handledInChange = false;
    });
    choices.addEventListener('keydown', (event) => {
      arrowNav = event.key.startsWith('Arrow');
    });

    item.options.forEach((option, index) => {
      const input = el('input', 'quiz-radio');
      input.type = 'radio';
      input.name = 'answer';
      input.value = option.id;
      input.checked = state.answers[state.index] === option.id;
      input.addEventListener('change', () => {
        handledInChange = !arrowNav;
        state.answers[state.index] = option.id;
        state.complete = false;
        persist();
        next.disabled = false;
        progress.value = state.answers.length;
        answered.textContent = `已答 ${state.answers.length} 题`;
        if (!storageAvailable) saveMessage.textContent = '浏览器无法保存进度，关闭页面会丢失记录。';
        if (!arrowNav && position < total) scheduleAdvance();
      });
      input.addEventListener('click', (event) => {
        if (!handledInChange && event.detail > 0 && input.checked && position < total) scheduleAdvance();
        handledInChange = false;
      });
      const key = el('span', 'quiz-key', String.fromCharCode(65 + index));
      key.setAttribute('aria-hidden', 'true');
      choices.append(el('label', 'quiz-option', input,
        el('span', 'quiz-choice', key, el('span', '', option.text))));
    });

    const previous = button(state.index === 0 ? '返回介绍' : '上一题', () => {
      clearTimeout(advanceTimer);
      state.complete = false;
      if (state.index === 0) {
        persist();
        intro();
        return;
      }
      state.index -= 1;
      persist();
      question();
    }, 'lab-button secondary');
    const form = el('form', 'quiz-form', choices, el('div', 'quiz-nav', previous, next), saveMessage);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      advance();
    });

    show(el('section', 'card quiz-card',
      el('div', 'quiz-meter', progressRow, progress), heading, form));
  }

  function report() {
    const { type, matchPercent, runnerUp, dimensions } = scoreTest(test, state.answers);
    const labels = config.report?.labels ?? {};
    const traits = el('ul', 'report-traits', ...type.traits.map((trait) => el('li', '', trait)));
    traits.setAttribute('aria-label', labels.traits ?? '主要特征');
    const certificate = el('article', 'card certificate',
      el('div', 'certificate-band',
        el('span', '', labels.certificate ?? '人格鉴定报告'), el('span', '', `V${config.version}`)),
      el('div', 'certificate-main',
        el('header', 'certificate-copy',
          el('div', 'certificate-meta',
            el('p', 'lab-kicker', type.code),
            el('span', 'match-badge', `匹配度 ${matchPercent}%`)),
          el('h1', '', type.name),
          el('p', 'report-summary', type.summary), traits),
        illustration(type.image, 'lab-art certificate-art')));
    if (type.quote) certificate.append(el('blockquote', 'report-quote', `「${type.quote}」`));
    if (runnerUp) {
      certificate.append(el('div', 'report-secondary',
        el('span', 'lab-kicker', `隐藏副结构 · 第二顺位（匹配度 ${runnerUp.matchPercent}%）`),
        el('p', 'report-secondary-body',
          el('strong', '', runnerUp.type.name),
          ` — ${runnerUp.type.summary}`)));
    }

    const profile = el('section', 'card report-profile',
      el('h2', '', labels.profile ?? '人格解析'), el('p', 'lab-muted', type.description));
    const custom = el('div', 'report-fields');
    for (const field of config.report?.sections ?? []) {
      if (!type.sections || !Object.hasOwn(type.sections, field.id)) continue;
      const content = type.sections[field.id];
      const body = Array.isArray(content)
        ? el('ul', 'lab-muted', ...content.map((line) => el('li', '', line)))
        : el('p', 'lab-muted', content);
      custom.append(el('section', 'report-field', el('h3', '', field.label), body));
    }
    if (type.partner) {
      const partner = config.types.find((item) => item.id === type.partner.typeId);
      custom.append(el('section', 'report-field',
        el('h3', '', labels.partner ?? '最佳搭档'), el('p', 'partner-name', partner.name),
        el('p', 'lab-muted', type.partner.reason)));
    }
    if (custom.childElementCount) profile.append(custom);

    const url = new URL(testHref(config.id), 'https://lemcae.github.io/lab/').href;
    const share = sharePanel(config, type, url);
    const actions = el('div', 'lab-actions lab-report-actions',
      button('返回修改答案', () => {
        state.complete = false;
        persist();
        question();
      }, 'lab-button secondary'),
      button('重新测试', () => {
        state = { answers: [], index: 0, complete: false };
        persist();
        intro();
      }, 'lab-button secondary'),
      anchor('测试大厅', './'));

    show(el('div', 'report-stack', certificate, dimensionReport(dimensions, labels.dimensions),
      profile, share, actions, el('p', 'lab-disclaimer', note)));
  }

  intro(false);
}

function dimensionReport(dimensions, label = '维度分析') {
  const rows = el('ol', 'dimension-list');
  dimensions.forEach((dimension, index) => {
    const level = levels[dimension.level - 1];
    const bar = el('div', 'dimension-bar');
    bar.setAttribute('aria-hidden', 'true');
    for (let step = 1; step <= 5; step += 1) {
      bar.append(el('span', step <= dimension.level ? 'filled' : ''));
    }
    rows.append(el('li', 'dimension-row',
      el('div', 'dimension-heading', el('span', 'axis-key', String(index + 1)),
        el('strong', '', dimension.label), el('span', 'dimension-level', level)),
      bar, el('p', 'dimension-range', `${dimension.low} ↔ ${dimension.high}`)));
  });
  return el('section', 'card dimension-report', el('h2', '', label),
    el('div', 'dimension-grid', radar(dimensions), rows),
    el('details', 'score-method',
      el('summary', '', '得分与匹配说明'),
      el('p', '', '每个维度累加选项权重，再按该维度在整份问卷中可取得的最低和最高分归一化。图表将分数分成五档。系统以各维度的配置权重计算答卷与人格目标的平方距离，取最接近的类型。同距时按配置顺序选择。')));
}

function radar(dimensions) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 300 280');
  svg.setAttribute('class', 'radar');
  svg.setAttribute('aria-hidden', 'true');

  function add(tag, attributes, label) {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (label !== undefined) element.textContent = label;
    svg.append(element);
  }

  function point(index, radius) {
    const angle = (index / dimensions.length) * Math.PI * 2 - Math.PI / 2;
    return [150 + radius * Math.cos(angle), 140 + radius * Math.sin(angle)];
  }

  function polygon(radii, className) {
    add('polygon', {
      points: radii.map((radius, index) => point(index, radius).join(',')).join(' '),
      class: className
    });
  }

  for (let ring = 1; ring <= 5; ring += 1) {
    polygon(dimensions.map(() => ring * 21), 'radar-ring');
  }
  dimensions.forEach((_, index) => {
    const [x2, y2] = point(index, 105);
    add('line', { x1: 150, y1: 140, x2, y2, class: 'radar-ring' });
  });
  polygon(dimensions.map((dimension) => dimension.level * 21), 'radar-shape');
  dimensions.forEach((dimension, index) => {
    const [cx, cy] = point(index, dimension.level * 21);
    add('circle', { cx, cy, r: 4, class: 'radar-point' });
    const [x, y] = point(index, 124);
    add('text', { x, y, dy: '.35em', 'text-anchor': 'middle', class: 'radar-label' }, index + 1);
  });
  return el('div', 'radar-plate', svg);
}

async function init() {
  try {
    const published = validateManifest(await fetchJson('./catalog.json'));
    const id = new URLSearchParams(location.search).get('test');
    if (id !== null) {
      if (!published.includes(id)) {
        renderError('此测试未发布或链接有误。');
        return;
      }
      const test = await loadTest(id);
      document.title = `${test.config.title} · ${title}`;
      renderTest(test);
      return;
    }

    const results = await Promise.allSettled(published.map(loadTest));
    const tests = [];
    for (const result of results) {
      if (result.status === 'fulfilled') tests.push(result.value);
      else console.error(result.reason);
    }
    renderLobby(tests, results.length - tests.length);
  } catch (error) {
    console.error(error);
    renderError('测试档案缺失或格式有误。请稍后刷新页面，或返回大厅选择其他测试。');
  }
}

init();

function sharePanel(config, type, url) {
  const status = el('p', 'share-status');
  status.setAttribute('role', 'status');
  const controls = el('div', 'lab-actions');
  const panel = el('section', 'card share-card',
    el('div', '', el('h2', '', '分享报告'), el('p', 'lab-muted', '生成带有插图与人格特征的竖版 PNG。')),
    controls, status);
  const filename = `${config.id}-${type.id}.png`;
  const generate = button('生成分享图', async () => {
    generate.disabled = true;
    status.textContent = '正在生成图片…';
    try {
      const blob = await createReportPng({ config, type, url, title });
      if (!panel.isConnected) return;
      shareObjectUrl = URL.createObjectURL(blob);
      const download = anchor('下载 PNG', shareObjectUrl, 'lab-button');
      download.download = filename;
      controls.replaceChildren(download);

      if (typeof File === 'function' && navigator.share && navigator.canShare) {
        const files = [new File([blob], filename, { type: 'image/png' })];
        if (navigator.canShare({ files })) {
          controls.append(button('系统分享', async () => {
            try {
              await navigator.share({ files });
            } catch (error) {
              if (error.name !== 'AbortError') status.textContent = '系统分享未完成。你可以下载 PNG。';
            }
          }, 'lab-button secondary'));
        }
      }
      const preview = el('img', '');
      preview.src = shareObjectUrl;
      preview.alt = `${type.name}的人格报告分享图`;
      preview.width = 900;
      preview.height = 1200;
      const details = el('details', 'share-preview',
        el('summary', '', '预览图片'),
        preview, el('p', 'lab-muted', '手机也可长按图片保存。'));
      panel.append(details);
      status.textContent = '图片已生成。';
      download.focus({ preventScroll: true });
    } catch (error) {
      console.error(error);
      if (!panel.isConnected) return;
      status.textContent = '暂时无法生成图片，请重试。';
      generate.disabled = false;
    }
  });
  controls.append(generate);
  return panel;
}
