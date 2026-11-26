const WIDTH = 900;
const HEIGHT = 1200;
const SANS = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
const MONO = 'ui-monospace, monospace';

function parseHex(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixHex(hexA, hexB, weightA) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const mixed = a.map((channel, index) => Math.round(channel * weightA + b[index] * (1 - weightA)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function cardPalette(accent) {
  return {
    paper: mixHex(accent, '#ffffff', 0.08),
    viewport: mixHex(accent, '#ffffff', 0.12),
    border: mixHex(accent, '#e8ecea', 0.28),
    ink: mixHex(accent, '#141716', 0.16),
    muted: mixHex(accent, '#363b39', 0.34),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('无法读取报告插图。'));
    image.src = src;
  });
}

function drawText(ctx, text, x, y, { size, weight = 500, color, mono = false }) {
  ctx.font = `${weight} ${size}px ${mono ? MONO : SANS}`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function wrappedLines(ctx, text, width) {
  const lines = [];
  let line = '';
  for (const character of text) {
    const next = line + character;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line.trimEnd());
      line = character.trimStart();
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(ctx, text, x, y, width, maxLines, style) {
  let size = style.size;
  const weight = style.weight ?? 500;
  let lines;
  for (; size >= style.minSize; size -= 2) {
    ctx.font = `${weight} ${size}px ${style.mono ? MONO : SANS}`;
    lines = wrappedLines(ctx, text, width);
    if (lines.length <= maxLines) break;
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    const last = Array.from(lines.at(-1));
    while (last.length && ctx.measureText(last.join('') + '…').width > width) last.pop();
    lines[maxLines - 1] = last.join('') + '…';
  }
  size = Math.max(size, style.minSize);
  const step = Math.round(size * 1.3);
  lines.forEach((line, index) => drawText(ctx, line, x, y + index * step, { ...style, size }));
  return y + lines.length * step;
}

export async function createReportPng({ config, type, url, title }) {
  const image = await loadImage(type.image.src);
  if (document.fonts) await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('浏览器无法绘制分享图。');

  const palette = cardPalette(config.theme.light);
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 836, 1136);
  ctx.fillStyle = config.theme.light;
  ctx.fillRect(32, 32, 836, 8);

  drawText(ctx, title, 70, 99, { size: 28, weight: 700, color: palette.ink });
  drawText(ctx, 'LemCAE / PERSONALITY LAB', 70, 138, { size: 19, color: palette.muted, mono: true });
  ctx.strokeStyle = palette.border;
  ctx.beginPath();
  ctx.moveTo(70, 166);
  ctx.lineTo(830, 166);
  ctx.stroke();

  drawWrapped(ctx, type.code, 70, 210, 760, 1, { size: 26, minSize: 20, color: palette.muted, mono: true });
  const summaryY = drawWrapped(ctx, type.name, 70, 293, 760, 2,
    { size: 72, minSize: 40, weight: 800, color: palette.ink });
  drawWrapped(ctx, type.summary, 70, Math.min(summaryY + 7, 423), 760, 2,
    { size: 30, minSize: 24, color: palette.muted });

  const viewport = { x: 70, y: 495, width: 760, height: 431 };
  ctx.fillStyle = palette.viewport;
  ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  const scale = Math.min(viewport.width / image.naturalWidth, viewport.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.drawImage(image, viewport.x + (viewport.width - width) / 2,
    viewport.y + (viewport.height - height) / 2, width, height);
  ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height);

  drawWrapped(ctx, type.traits.slice(0, 3).join('  /  '), 70, 980, 760, 2,
    { size: 32, minSize: 24, weight: 700, color: palette.ink });
  ctx.beginPath();
  ctx.moveTo(70, 1062);
  ctx.lineTo(830, 1062);
  ctx.stroke();

  drawText(ctx, '仅供娱乐', 70, 1101, { size: 22, color: palette.muted });
  drawWrapped(ctx, url, 70, 1139, 760, 1,
    { size: 23, minSize: 15, color: palette.ink, mono: true });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('浏览器无法编码 PNG。'));
    }, 'image/png');
  });
}
