(() => {
  const THEME_KEY = 'lemcae-theme';
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const filterBar = document.getElementById('filter-pills');
  const grid = document.getElementById('bento-grid');
  const notesMount = document.getElementById('note-list');
  const projectCountEl = document.getElementById('project-count');
  const noteCountEl = document.getElementById('note-count');
  const clockTimeEl = document.getElementById('clock-time');
  const clockDateEl = document.getElementById('clock-date');
  const randomBtn = document.getElementById('random-jump');

  let allProjects = [];
  let activeTag = '全部';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? '浅色模式' : '深色模式';
    }
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    }
  }

  function initTheme() {
    const current = html.getAttribute('data-theme') || 'dark';
    applyTheme(current);
    themeBtn?.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  function updateClock() {
    if (!clockTimeEl || !clockDateEl) return;
    const now = new Date();
    clockTimeEl.textContent = now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    clockDateEl.textContent = now.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  }

  function createArrowIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7 17L17 7M7 7h10v10');
    svg.appendChild(path);
    return svg;
  }

  function createProjectCard(project) {
    const card = document.createElement('a');
    card.href = project.url;
    card.className = `card card-interactive project-card${project.featured ? ' span-2' : ''}`;
    card.dataset.accent = project.accent || 'emerald';
    card.dataset.dynamicProject = 'true';

    const top = document.createElement('div');
    top.className = 'project-top';

    const badge = document.createElement('span');
    badge.className = 'tag-badge';
    badge.textContent = project.tag || '实验';

    const year = document.createElement('span');
    year.className = 'project-year';
    year.textContent = project.year || '';

    top.append(badge, year);

    const body = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title;

    const sub = document.createElement('p');
    sub.className = 'project-sub';
    sub.textContent = project.subtitle || '';

    const desc = document.createElement('p');
    desc.className = 'project-desc';
    desc.textContent = project.description || '';

    body.append(title, sub, desc);

    const bottom = document.createElement('div');
    bottom.className = 'project-bottom';

    const highlights = document.createElement('div');
    highlights.className = 'project-highlights';
    for (const item of project.highlights || []) {
      const pill = document.createElement('span');
      pill.className = 'mini-pill';
      pill.textContent = item;
      highlights.appendChild(pill);
    }

    const arrow = document.createElement('span');
    arrow.className = 'arrow-badge';
    arrow.appendChild(createArrowIcon());

    bottom.append(highlights, arrow);
    card.append(top, body, bottom);
    return card;
  }

  function createPlaceholderCard(spanClass = 'span-2') {
    const slot = document.createElement('div');
    slot.className = `card placeholder-card${spanClass ? ` ${spanClass}` : ''}`;
    slot.dataset.dynamicProject = 'true';

    const label = document.createElement('span');
    label.className = 'tag-badge';
    label.textContent = 'NEXT';

    const title = document.createElement('strong');
    title.textContent = '下一个好玩的小网页';

    const desc = document.createElement('p');
    desc.append('新建独立文件夹后，在 ');
    const code = document.createElement('code');
    code.textContent = 'data/projects.json';
    desc.append(code, ' 添加一条记录即可自动出现。');

    slot.append(label, title, desc);
    return slot;
  }

  function renderProjects() {
    if (!grid) return;
    grid.querySelectorAll('[data-dynamic-project="true"]').forEach((el) => el.remove());

    const anchor = document.getElementById('notes-card');
    const filtered = activeTag === '全部'
      ? allProjects
      : allProjects.filter((item) => item.tag === activeTag);

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.dataset.dynamicProject = 'true';
      empty.textContent = '这个分类下还没有小网页。';
      grid.insertBefore(empty, anchor);
      return;
    }

    for (const project of filtered) {
      grid.insertBefore(createProjectCard(project), anchor);
    }

    if (activeTag === '全部') {
      const usedCols = filtered.reduce((sum, item) => sum + (item.featured ? 2 : 1), 0);
      const rem = (4 - (usedCols % 4)) % 4;
      const spanClass = rem === 0 ? 'span-4' : (rem >= 2 ? 'span-2' : '');
      grid.insertBefore(createPlaceholderCard(spanClass), anchor);
    }
  }

  function renderFilterPills() {
    if (!filterBar) return;
    filterBar.innerHTML = '';
    const tags = ['全部', ...new Set(allProjects.map((p) => p.tag).filter(Boolean))];
    for (const tag of tags) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-pill';
      btn.textContent = tag;
      btn.setAttribute('aria-pressed', String(tag === activeTag));
      btn.addEventListener('click', () => {
        activeTag = tag;
        renderFilterPills();
        renderProjects();
      });
      filterBar.appendChild(btn);
    }
  }

  function renderNotes(notes) {
    if (!notesMount) return;
    notesMount.innerHTML = '';
    for (const note of notes) {
      const link = document.createElement('a');
      link.href = note.url;
      link.className = 'note-item';

      const title = document.createElement('span');
      title.className = 'note-title';
      title.textContent = note.title;

      const meta = document.createElement('span');
      meta.className = 'note-meta';
      meta.textContent = `${note.category || '笔记'} · ${note.date}`;

      link.append(title, meta);
      notesMount.appendChild(link);
    }
  }

  async function loadManifest() {
    try {
      const res = await fetch('./data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allProjects = Array.isArray(data.projects) ? data.projects : [];
      const notes = Array.isArray(data.notes) ? data.notes : [];

      if (projectCountEl) projectCountEl.textContent = String(allProjects.length);
      if (noteCountEl) noteCountEl.textContent = String(notes.length);

      renderFilterPills();
      renderProjects();
      renderNotes(notes);
    } catch (err) {
      if (grid) {
        const anchor = document.getElementById('notes-card');
        const fallback = document.createElement('div');
        fallback.className = 'empty-state';
        fallback.dataset.dynamicProject = 'true';
        fallback.textContent = '无法读取 data/projects.json（如在本地双击 HTML 打开，请通过本地 HTTP 服务访问）。';
        grid.insertBefore(fallback, anchor);
      }
      console.error('Failed to load projects.json:', err);
    }
  }

  randomBtn?.addEventListener('click', () => {
    if (allProjects.length === 0) return;
    const pick = allProjects[Math.floor(Math.random() * allProjects.length)];
    window.location.href = pick.url;
  });

  initTheme();
  if (clockTimeEl && clockDateEl) {
    updateClock();
    setInterval(updateClock, 1000);
  }
  if (grid || notesMount) {
    loadManifest();
  }
})();
