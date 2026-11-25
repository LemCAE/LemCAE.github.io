(() => {
  const listGrid = document.getElementById('notes-grid');
  const filterBar = document.getElementById('note-filter-pills');
  const articleBody = document.getElementById('article-body');
  const articleTitle = document.getElementById('article-title');
  const articleDate = document.getElementById('article-date');
  const articleCat = document.getElementById('article-category');
  const articleSummary = document.getElementById('article-summary');
  const tocList = document.getElementById('toc-list');
  const tocCard = document.getElementById('toc-card');

  let allNotes = [];
  let activeCat = '全部';

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeUrl(url) {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|#)/i.test(trimmed)) {
      return trimmed;
    }
    return '#';
  }

  function formatInline(text) {
    const codeTokens = [];
    const withTokens = text.replace(/`([^`]+)`/g, (_, code) => {
      const idx = codeTokens.length;
      codeTokens.push(`<code>${escapeHtml(code)}</code>`);
      return `\u0000CODE${idx}\u0000`;
    });

    let safe = escapeHtml(withTokens);
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const clean = sanitizeUrl(url);
      const isExternal = /^https?:\/\//i.test(clean);
      const extra = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(clean)}"${extra}>${label}</a>`;
    });
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    safe = safe.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => codeTokens[Number(i)]);
    return safe;
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim().replace(/\\\|/g, '|'));
  }

  function isTableSeparator(line) {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
  }

  function renderMarkdown(mdText) {
    const lines = mdText.replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    const toc = [];
    let i = 0;
    let headingIdx = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i += 1;
        continue;
      }

      // Fenced code block
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'text';
        const codeLines = [];
        i += 1;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i += 1;
        }
        i += 1;
        html.push(
          `<div class="md-codewrap"><div class="md-codehead"><span>${escapeHtml(lang)}</span><button type="button" class="md-copy">复制</button></div><pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre></div>`
        );
        continue;
      }

      // Safe <details> / <summary> passthrough
      if (trimmed === '<details>') {
        html.push('<details class="md-details">');
        i += 1;
        continue;
      }
      if (trimmed === '</details>') {
        html.push('</details>');
        i += 1;
        continue;
      }
      const summaryMatch = trimmed.match(/^<summary>(.*)<\/summary>$/);
      if (summaryMatch) {
        html.push(`<summary>${formatInline(summaryMatch[1])}</summary>`);
        i += 1;
        continue;
      }

      // Horizontal rule
      if (/^(---|\*\*\*)$/.test(trimmed)) {
        html.push('<hr>');
        i += 1;
        continue;
      }

      // Headings
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(Math.max(headingMatch[1].length, 2), 4);
        const text = headingMatch[2].trim();
        headingIdx += 1;
        const id = `sec-${headingIdx}`;
        if (level <= 3) {
          toc.push({ id, level, text });
        }
        html.push(`<h${level} id="${id}">${formatInline(text)}</h${level}>`);
        i += 1;
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i += 1;
        }
        const innerParas = quoteLines
          .join('\n')
          .split(/\n{2,}/)
          .map((p) => `<p>${formatInline(p.replace(/\n/g, ' '))}</p>`)
          .join('');
        html.push(`<blockquote>${innerParas}</blockquote>`);
        continue;
      }

      // Markdown table
      if (trimmed.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        const headers = splitTableRow(lines[i]);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim() !== '') {
          rows.push(splitTableRow(lines[i]));
          i += 1;
        }
        const thead = `<thead><tr>${headers.map((h) => `<th>${formatInline(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${formatInline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody>`;
        html.push(`<div class="md-table-wrap"><table>${thead}${tbody}</table></div>`);
        continue;
      }

      // Lists (supports simple nested 2-space bullets by flattening or keeping clean ul)
      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const ordered = /^\d+\.\s+/.test(trimmed);
        const tag = ordered ? 'ol' : 'ul';
        const items = [];
        while (i < lines.length) {
          const cur = lines[i].trim();
          const match = ordered ? cur.match(/^\d+\.\s+(.+)$/) : cur.match(/^[-*]\s+(.+)$/);
          if (!match) break;
          items.push(`<li>${formatInline(match[1])}</li>`);
          i += 1;
        }
        html.push(`<${tag}>${items.join('')}</${tag}>`);
        continue;
      }

      // Paragraph
      const paraLines = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (
          !cur ||
          cur.startsWith('```') ||
          cur.startsWith('>') ||
          cur === '<details>' ||
          cur === '</details>' ||
          /^<summary>.*<\/summary>$/.test(cur) ||
          /^(#{1,4})\s+/.test(cur) ||
          /^[-*]\s+/.test(cur) ||
          /^\d+\.\s+/.test(cur) ||
          (cur.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
        ) {
          break;
        }
        paraLines.push(cur);
        i += 1;
      }
      html.push(`<p>${formatInline(paraLines.join(' '))}</p>`);
    }

    return { html: html.join('\n'), toc };
  }

  function renderNoteCards() {
    if (!listGrid) return;
    listGrid.querySelectorAll('[data-dynamic-note="true"]').forEach((el) => el.remove());

    const filtered = activeCat === '全部'
      ? allNotes
      : allNotes.filter((n) => n.category === activeCat);

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.dataset.dynamicNote = 'true';
      empty.textContent = '这个分类下还没有笔记。';
      listGrid.appendChild(empty);
      return;
    }

    for (const note of filtered) {
      const card = document.createElement('a');
      card.href = `./view.html?id=${encodeURIComponent(note.id)}`;
      card.className = 'card card-interactive note-card span-2';
      card.dataset.dynamicNote = 'true';

      const top = document.createElement('div');
      top.className = 'project-top';

      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.textContent = note.category || '笔记';

      const date = document.createElement('span');
      date.className = 'project-year';
      date.textContent = note.date || '';
      top.append(badge, date);

      const body = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = note.title;
      const summary = document.createElement('p');
      summary.textContent = note.summary || '';
      body.append(title, summary);

      const bottom = document.createElement('div');
      bottom.className = 'project-bottom';
      const hint = document.createElement('span');
      hint.className = 'mini-pill';
      hint.textContent = '阅读全文';
      const arrow = document.createElement('span');
      arrow.className = 'arrow-badge';
      arrow.textContent = '→';
      bottom.append(hint, arrow);

      card.append(top, body, bottom);
      listGrid.appendChild(card);
    }

    if (activeCat === '全部') {
      const slot = document.createElement('div');
      slot.className = 'card placeholder-card span-2';
      slot.dataset.dynamicNote = 'true';
      const label = document.createElement('span');
      label.className = 'tag-badge';
      label.textContent = 'NEXT';
      const strong = document.createElement('strong');
      strong.textContent = '继续写新笔记';
      const p = document.createElement('p');
      p.append('把 Markdown 放进 ');
      const c1 = document.createElement('code');
      c1.textContent = 'notes/posts/';
      p.append(c1, ' 并在 ');
      const c2 = document.createElement('code');
      c2.textContent = 'data/projects.json';
      p.append(c2, ' 登记即可。');
      slot.append(label, strong, p);
      listGrid.appendChild(slot);
    }
  }

  function renderFilterPills() {
    if (!filterBar) return;
    filterBar.innerHTML = '';
    const cats = ['全部', ...new Set(allNotes.map((n) => n.category).filter(Boolean))];
    for (const cat of cats) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-pill';
      btn.textContent = cat;
      btn.setAttribute('aria-pressed', String(cat === activeCat));
      btn.addEventListener('click', () => {
        activeCat = cat;
        renderFilterPills();
        renderNoteCards();
      });
      filterBar.appendChild(btn);
    }
  }

  async function initNotesList() {
    try {
      const res = await fetch('/data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allNotes = Array.isArray(data.notes) ? data.notes : [];
      renderFilterPills();
      renderNoteCards();
    } catch (err) {
      if (listGrid) {
        const errBox = document.createElement('div');
        errBox.className = 'empty-state';
        errBox.textContent = '无法读取笔记清单。';
        listGrid.appendChild(errBox);
      }
      console.error(err);
    }
  }

  async function initNoteReader() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    try {
      const res = await fetch('/data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const notes = Array.isArray(data.notes) ? data.notes : [];
      const note = notes.find((n) => n.id === id) || notes[0];

      if (!note) {
        articleTitle.textContent = '未找到笔记';
        articleBody.textContent = '请检查链接是否正确。';
        return;
      }

      document.title = `${note.title} · LemCAE 笔记`;
      articleTitle.textContent = note.title;
      articleDate.textContent = note.date || '';
      articleCat.textContent = note.category || '笔记';
      if (articleSummary) {
        articleSummary.textContent = note.summary || '';
      }

      const mdRes = await fetch(note.file, { cache: 'no-cache' });
      if (!mdRes.ok) throw new Error(`HTTP ${mdRes.status}`);
      const mdText = await mdRes.text();
      const { html, toc } = renderMarkdown(mdText);

      articleBody.innerHTML = html;

      articleBody.querySelectorAll('.md-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const code = btn.closest('.md-codewrap')?.querySelector('code')?.textContent || '';
          try {
            await navigator.clipboard.writeText(code);
            btn.textContent = '已复制';
            setTimeout(() => { btn.textContent = '复制'; }, 1500);
          } catch {
            btn.textContent = '复制失败';
          }
        });
      });

      if (tocList && tocCard) {
        tocList.innerHTML = '';
        if (toc.length === 0) {
          tocCard.style.display = 'none';
        } else {
          for (const item of toc) {
            const a = document.createElement('a');
            a.href = `#${item.id}`;
            a.className = `toc-link level-${item.level}`;
            a.textContent = item.text;
            tocList.appendChild(a);
          }
        }
      }
    } catch (err) {
      articleTitle.textContent = '加载失败';
      articleBody.textContent = '读取笔记内容时出错，请确认通过 HTTP 服务访问。';
      console.error(err);
    }
  }

  if (listGrid) {
    initNotesList();
  }
  if (articleBody) {
    initNoteReader();
  }
})();
