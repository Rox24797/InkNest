'use strict';
/* InkNest Notes — handwriting-first study notebook.  v1.0.0 */
(() => {

/* ====================================================================
   Helpers
   ==================================================================== */
const VERSION = '1.0.0';
const PW = 1000, PH = 1414;               // logical page size (A4 ratio)
const FONT = '"Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const safeName = s => ((s || 'notebook').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'notebook');

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const ICONS = {
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  hl: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  select: '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
  shape: '<rect x="3" y="3" width="10" height="10" rx="1.5"/><circle cx="16.5" cy="16.5" r="4.5"/>',
  text: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  laser: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-2.93 1.41-1.41m11.32-11.32 1.41-1.41M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  kline: '<path d="M5 19 19 5"/>',
  karrow: '<path d="M5 19 19 5"/><path d="M9 5h10v10"/>',
  krect: '<rect x="4" y="5" width="16" height="14" rx="1"/>',
  kellipse: '<ellipse cx="12" cy="12" rx="9" ry="7"/>',
};
const icon = (n, sz = 20) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;
function hydrate(root = document) {
  $$('[data-i]', root).forEach(n => { n.innerHTML = icon(n.dataset.i, +n.dataset.s || 20); n.removeAttribute('data-i'); });
}

/* ====================================================================
   Persistence  (IndexedDB, with localStorage prefs)
   ==================================================================== */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('inknest.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('inknest.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
};
const DB = {
  db: null, mem: new Map(), broken: false,
  open() {
    return new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('no indexedDB'));
      const r = indexedDB.open('inknest-notes', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('notebooks', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  all() {
    if (!this.db) return Promise.resolve([...this.mem.values()]);
    return new Promise((res, rej) => {
      const q = this.db.transaction('notebooks').objectStore('notebooks').getAll();
      q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error);
    });
  },
  put(nb) {
    if (!this.db) { this.mem.set(nb.id, nb); return Promise.resolve(); }
    return new Promise((res, rej) => {
      const tx = this.db.transaction('notebooks', 'readwrite');
      tx.objectStore('notebooks').put(nb);
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
    });
  },
  del(id) {
    if (!this.db) { this.mem.delete(id); return Promise.resolve(); }
    return new Promise((res, rej) => {
      const tx = this.db.transaction('notebooks', 'readwrite');
      tx.objectStore('notebooks').delete(id);
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
    });
  },
};

/* ====================================================================
   Data model
   ==================================================================== */
const COVERS = [['#6366f1', '#8b5cf6'], ['#0ea5e9', '#6366f1'], ['#10b981', '#0ea5e9'], ['#f59e0b', '#ef4444'],
  ['#ec4899', '#8b5cf6'], ['#14b8a6', '#22c55e'], ['#64748b', '#334155'], ['#f97316', '#eab308']];
const PAPERS = { white: '#ffffff', cream: '#fbf5e6', mint: '#eef8f1', sky: '#edf3fc', dark: '#1d2130' };
const TEMPLATES = ['blank', 'lined', 'grid', 'dots', 'cornell'];
const INK = ['#111827', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#ffffff'];
const HL = ['#fde047', '#86efac', '#f9a8d4', '#7dd3fc', '#fdba74', '#c4b5fd'];

const newPage = (template = 'lined', paper = 'white') => ({ id: uid(), template, paper, star: false, objects: [] });
const newNotebook = (title, cover = 0, template = 'lined', paper = 'white') =>
  ({ id: uid(), title, cover, created: Date.now(), updated: Date.now(), pages: [newPage(template, paper)], v: 1 });

function makeWelcome() {
  const nb = newNotebook('Welcome to InkNest', 0, 'blank', 'white');
  const o = nb.pages[0].objects;
  o.push({ t: 's', tool: 'hl', color: '#fde047', w: 22, pts: [[84, 136, .5], [330, 133, .5], [620, 138, .5]] });
  o.push({ t: 'tx', x: 80, y: 100, size: 46, color: '#4f46e5', text: 'Welcome to InkNest Notes' });
  const lines = [
    'Pen (P) and Highlighter (H) — choose colour and thickness in the bar above.',
    'Eraser (E) removes whole strokes. Made a mistake? Press Ctrl+Z.',
    'Select (V): drag to move, use the corner handle to resize, Del to delete.',
    'Shapes (S) draw lines, arrows, rectangles and ellipses (hold Shift to snap).',
    'Text (T): click anywhere on the page and type. Double-click text to edit.',
    'Images: use the image button, drag & drop a file, or paste with Ctrl+V.',
    'Laser (L) is a fading red pointer — handy when presenting.',
    '"Stylus only" ignores finger touch so your palm never marks the page.',
    'Pages on the left: drag to reorder, right-click to duplicate, star or delete.',
    'Study timer (top right) runs focus sessions. Export to PDF with the download button.',
  ];
  lines.forEach((t, i) => o.push({ t: 'tx', x: 80, y: 220 + i * 60, size: 20, color: '#1f2937', text: '•  ' + t }));
  o.push({ t: 'sh', kind: 'arrow', color: '#ef4444', w: 4, x1: 700, y1: 120, x2: 910, y2: 70 });
  o.push({ t: 'tx', x: 700, y: 128, size: 22, color: '#ef4444', text: 'Happy studying!' });
  return nb;
}

function cloneNotebook(nb, retitle) {
  const c = JSON.parse(JSON.stringify(nb));
  c.id = uid(); c.created = c.updated = Date.now();
  if (retitle) c.title = retitle;
  c.pages.forEach(p => { p.id = uid(); });
  return c;
}

/* ====================================================================
   Drawing engine
   ==================================================================== */
const imgCache = new Map();
function getImg(src) {
  let im = imgCache.get(src);
  if (!im) {
    im = new Image();
    im.onload = () => { if (S.nb) { draw(); thumbsSoon(); } };
    im.src = src;
    imgCache.set(src, im);
  }
  return im;
}
function loadImg(src) {
  return new Promise(res => {
    const im = getImg(src);
    if (im.complete && im.naturalWidth) return res(im);
    im.addEventListener('load', () => res(im));
    im.addEventListener('error', () => res(im));
  });
}

const mctx = document.createElement('canvas').getContext('2d');
function textMetrics(o) {
  mctx.font = `${o.size}px ${FONT}`;
  const lines = String(o.text).split('\n');
  let w = 0;
  for (const l of lines) w = Math.max(w, mctx.measureText(l).width);
  return { w: Math.max(w, 6), h: lines.length * o.size * 1.3, lines };
}

function drawBackground(ctx, page, k = 1) {
  const dark = page.paper === 'dark';
  ctx.fillStyle = PAPERS[page.paper] || '#fff';
  ctx.fillRect(0, 0, PW, PH);
  const line = dark ? 'rgba(255,255,255,.13)' : 'rgba(70,90,140,.20)';
  const strong = dark ? 'rgba(255,255,255,.30)' : 'rgba(70,90,140,.45)';
  ctx.lineWidth = k; ctx.strokeStyle = line; ctx.fillStyle = line;
  const t = page.template;
  if (t === 'lined') {
    ctx.beginPath();
    for (let y = 130; y < PH - 50; y += 38) { ctx.moveTo(0, y + .5); ctx.lineTo(PW, y + .5); }
    ctx.stroke();
    ctx.strokeStyle = dark ? 'rgba(255,120,120,.38)' : 'rgba(230,90,90,.42)';
    ctx.beginPath(); ctx.moveTo(96.5, 0); ctx.lineTo(96.5, PH); ctx.stroke();
  } else if (t === 'grid') {
    ctx.beginPath();
    for (let x = 32; x < PW; x += 32) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, PH); }
    for (let y = 32; y < PH; y += 32) { ctx.moveTo(0, y + .5); ctx.lineTo(PW, y + .5); }
    ctx.stroke();
  } else if (t === 'dots') {
    ctx.fillStyle = strong;
    const s = 2 * k;
    for (let y = 40; y < PH; y += 32) for (let x = 40; x < PW; x += 32) ctx.fillRect(x - s / 2, y - s / 2, s, s);
  } else if (t === 'cornell') {
    ctx.beginPath();
    for (let y = 168; y < PH - 290; y += 38) { ctx.moveTo(300, y + .5); ctx.lineTo(PW, y + .5); }
    ctx.stroke();
    ctx.strokeStyle = strong; ctx.lineWidth = 1.6 * k;
    ctx.beginPath();
    ctx.moveTo(0, 130); ctx.lineTo(PW, 130);
    ctx.moveTo(300, 130); ctx.lineTo(300, PH - 290);
    ctx.moveTo(0, PH - 290); ctx.lineTo(PW, PH - 290);
    ctx.stroke();
    if (k < 3) {
      ctx.fillStyle = strong; ctx.font = `600 13px ${FONT}`; ctx.textBaseline = 'alphabetic';
      ctx.fillText('CUES', 24, 154); ctx.fillText('NOTES', 324, 154); ctx.fillText('SUMMARY', 24, PH - 262);
      ctx.fillText('TOPIC / DATE', 24, 80);
    }
  }
}

function smoothPath(ctx, pts) {
  if (pts.length === 1) {
    ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); return;
  }
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const l = pts[pts.length - 1];
  ctx.lineTo(l[0], l[1]); ctx.stroke();
}
function drawPenVar(ctx, o) {
  const p = o.pts;
  ctx.strokeStyle = o.color;
  let px = p[0][0], py = p[0][1];
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    ctx.lineWidth = o.w * (0.4 + 1.2 * ((a[2] + b[2]) / 2));
    ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(a[0], a[1], mx, my); ctx.stroke();
    px = mx; py = my;
  }
  const l = p[p.length - 1];
  ctx.lineWidth = o.w * (0.4 + 1.2 * l[2]);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(l[0], l[1]); ctx.stroke();
}

function drawObj(ctx, o, dark) {
  switch (o.t) {
    case 's': {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = o.color; ctx.fillStyle = o.color; ctx.lineWidth = o.w;
      if (o.tool === 'hl') {
        ctx.globalAlpha = 0.4;
        ctx.globalCompositeOperation = dark ? 'source-over' : 'multiply';
        smoothPath(ctx, o.pts);
      } else if (o.vp && o.pts.length > 1) drawPenVar(ctx, o);
      else smoothPath(ctx, o.pts);
      ctx.restore(); break;
    }
    case 'sh': {
      ctx.save();
      ctx.strokeStyle = o.color; ctx.fillStyle = o.color; ctx.lineWidth = o.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const { x1, y1, x2, y2 } = o;
      if (o.kind === 'rect') ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      else if (o.kind === 'ellipse') {
        ctx.beginPath(); ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        if (o.kind === 'arrow') {
          const a = Math.atan2(y2 - y1, x2 - x1), L = Math.max(14, o.w * 5), sp = 0.5;
          ctx.beginPath();
          ctx.moveTo(x2 - L * Math.cos(a - sp), y2 - L * Math.sin(a - sp)); ctx.lineTo(x2, y2);
          ctx.lineTo(x2 - L * Math.cos(a + sp), y2 - L * Math.sin(a + sp)); ctx.stroke();
        }
      }
      ctx.restore(); break;
    }
    case 'tx': {
      const m = textMetrics(o);
      ctx.save(); ctx.fillStyle = o.color; ctx.font = `${o.size}px ${FONT}`; ctx.textBaseline = 'top';
      m.lines.forEach((l, i) => ctx.fillText(l, o.x, o.y + i * o.size * 1.3 + o.size * 0.15));
      ctx.restore(); break;
    }
    case 'im': {
      const im = getImg(o.src);
      if (im.complete && im.naturalWidth) ctx.drawImage(im, o.x, o.y, o.w, o.h);
      else { ctx.save(); ctx.fillStyle = 'rgba(120,120,160,.18)'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.restore(); }
      break;
    }
  }
}

function bbox(o) {
  switch (o.t) {
    case 's': {
      let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
      for (const p of o.pts) { if (p[0] < a) a = p[0]; if (p[0] > c) c = p[0]; if (p[1] < b) b = p[1]; if (p[1] > d) d = p[1]; }
      const h = o.w * (o.vp ? .8 : .5);
      return [a - h, b - h, c + h, d + h];
    }
    case 'sh': {
      const h = o.w / 2 + (o.kind === 'arrow' ? 6 : 0);
      return [Math.min(o.x1, o.x2) - h, Math.min(o.y1, o.y2) - h, Math.max(o.x1, o.x2) + h, Math.max(o.y1, o.y2) + h];
    }
    case 'tx': { const m = textMetrics(o); return [o.x, o.y, o.x + m.w, o.y + m.h]; }
    default: return [o.x, o.y, o.x + o.w, o.y + o.h];
  }
}
function boundsOf(list) {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (const o of list) { const r = bbox(o); a = Math.min(a, r[0]); b = Math.min(b, r[1]); c = Math.max(c, r[2]); d = Math.max(d, r[3]); }
  return [a, b, c, d];
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function hitObj(o, x, y, r) {
  switch (o.t) {
    case 's': {
      const tol = r + o.w / 2 + 1, p = o.pts;
      if (p.length === 1) return Math.hypot(x - p[0][0], y - p[0][1]) <= tol;
      const b = bbox(o);
      if (x < b[0] - r || x > b[2] + r || y < b[1] - r || y > b[3] + r) return false;
      for (let i = 1; i < p.length; i++) if (segDist(x, y, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]) <= tol) return true;
      return false;
    }
    case 'sh': {
      const tol = r + o.w / 2 + 2, { x1, y1, x2, y2 } = o;
      if (o.kind === 'rect') {
        const l = Math.min(x1, x2), t = Math.min(y1, y2), rr = Math.max(x1, x2), bb = Math.max(y1, y2);
        return segDist(x, y, l, t, rr, t) <= tol || segDist(x, y, rr, t, rr, bb) <= tol ||
               segDist(x, y, rr, bb, l, bb) <= tol || segDist(x, y, l, bb, l, t) <= tol;
      }
      if (o.kind === 'ellipse') {
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
        if (rx < 1 || ry < 1) return segDist(x, y, x1, y1, x2, y2) <= tol;
        return Math.abs(Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry) <= tol;
      }
      return segDist(x, y, x1, y1, x2, y2) <= tol;
    }
    default: { const b = bbox(o); return x >= b[0] - r && x <= b[2] + r && y >= b[1] - r && y <= b[3] + r; }
  }
}
function moved(o, dx, dy) {
  const n = { ...o };
  if (o.t === 's') n.pts = o.pts.map(p => [p[0] + dx, p[1] + dy, p[2]]);
  else if (o.t === 'sh') { n.x1 += dx; n.x2 += dx; n.y1 += dy; n.y2 += dy; }
  else { n.x += dx; n.y += dy; }
  return n;
}
function scaled(o, s, ox, oy) {
  const n = { ...o }, fx = v => ox + (v - ox) * s, fy = v => oy + (v - oy) * s;
  if (o.t === 's') { n.pts = o.pts.map(p => [fx(p[0]), fy(p[1]), p[2]]); n.w = o.w * s; }
  else if (o.t === 'sh') { n.x1 = fx(o.x1); n.x2 = fx(o.x2); n.y1 = fy(o.y1); n.y2 = fy(o.y2); n.w = o.w * s; }
  else if (o.t === 'tx') { n.x = fx(o.x); n.y = fy(o.y); n.size = o.size * s; }
  else { n.x = fx(o.x); n.y = fy(o.y); n.w = o.w * s; n.h = o.h * s; }
  return n;
}

/* ====================================================================
   App state
   ==================================================================== */
const S = {
  view: 'library', notebooks: [], nb: null, pi: 0,
  tool: 'pen', shape: 'line',
  colors: { pen: '#111827', hl: '#fde047', shape: '#111827', text: '#111827' },
  sizes: { pen: 3, hl: 18, eraser: 24, shape: 3, text: 26 },
  zoom: 1, fit: true, k: 1, penOnly: false, space: false,
  sel: [], live: null, previewSel: null, hide: null, tmp: null, marq: null, trail: [],
  undo: [], redo: [], drag: null, editing: null, clip: null, pasteN: 0,
  dirty: false, snap: null,
};
const page = () => S.nb.pages[S.pi];
const cv = $('#cv'), ov = $('#ov');

/* ====================================================================
   UI utilities: toast, modal, menu, popover
   ==================================================================== */
function toast(msg, ms = 2200) {
  const t = el('div', { class: 'toast' }, msg);
  $('#toasts').append(t);
  setTimeout(() => t.remove(), ms);
}

function modal({ title, body, ok = 'OK', cancel = 'Cancel', danger = false, width = 420 }) {
  return new Promise(resolve => {
    const ovl = el('div', { class: 'modal-ov' });
    const box = el('div', { class: 'modal', style: `max-width:${width}px` });
    const done = v => { ovl.remove(); document.removeEventListener('keydown', key, true); resolve(v); };
    const okb = el('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => done(body.getValue ? body.getValue() : true) }, ok);
    const foot = el('div', { class: 'modal-foot' }, cancel ? el('button', { class: 'btn ghost', onclick: () => done(null) }, cancel) : null, okb);
    box.append(el('h3', {}, title), body, foot);
    ovl.append(box);
    ovl.addEventListener('pointerdown', e => { if (e.target === ovl) done(null); });
    function key(e) {
      if (e.key === 'Escape') { e.stopPropagation(); done(null); }
      else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') { e.preventDefault(); okb.click(); }
    }
    document.addEventListener('keydown', key, true);
    document.body.append(ovl);
    const f = $('input,textarea', body);
    if (f) { f.focus(); if (f.select) f.select(); } else okb.focus();
  });
}
function askText(title, label, value = '', ok = 'Save') {
  const inp = el('input', { class: 'inp', value, maxlength: 80, spellcheck: 'false' });
  const body = el('div', {}, el('label', {}, label), inp);
  body.getValue = () => inp.value.trim() || null;
  return modal({ title, body, ok });
}
function confirmBox(title, msg, ok = 'Delete', danger = true) {
  return modal({ title, body: el('p', {}, msg), ok, danger });
}

let menuEl = null, popEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
function closePop() { if (popEl) { popEl.remove(); popEl = null; popEl_cleanup && popEl_cleanup(); popEl_cleanup = null; } }
let popEl_cleanup = null;
function placeFloating(node, x, y) {
  document.body.append(node);
  const r = node.getBoundingClientRect();
  node.style.left = clamp(x, 8, innerWidth - r.width - 8) + 'px';
  node.style.top = clamp(y, 8, innerHeight - r.height - 8) + 'px';
}
function showMenu(x, y, items) {
  closeMenu(); closePop();
  const m = el('div', { class: 'menu' });
  items.forEach(it => {
    if (it === '-') return m.append(el('div', { class: 'menu-sep' }));
    m.append(el('button', { class: 'menu-item' + (it.danger ? ' danger' : ''), onclick: () => { closeMenu(); it.fn(); } }, it.label));
  });
  placeFloating(m, x, y);
  menuEl = m;
}
function popover(anchor, node, cleanup) {
  closeMenu(); closePop();
  const p = el('div', { class: 'pop' }, node);
  const r = anchor.getBoundingClientRect();
  placeFloating(p, r.right - 300, r.bottom + 8);
  popEl = p; popEl.anchor = anchor; popEl_cleanup = cleanup || null;
}
document.addEventListener('pointerdown', e => {
  if (menuEl && !menuEl.contains(e.target)) closeMenu();
  if (popEl && !popEl.contains(e.target) && !(popEl.anchor && popEl.anchor.contains(e.target))) closePop();
}, true);

function download(blob, name) {
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
}

/* ====================================================================
   Saving
   ==================================================================== */
function markDirty() {
  if (!S.nb) return;
  S.nb.updated = Date.now(); S.dirty = true;
  $('#saveState').textContent = 'Saving…';
  clearTimeout(S.saveT);
  S.saveT = setTimeout(flush, 800);
}
async function flush() {
  clearTimeout(S.saveT);
  if (!S.dirty || !S.nb) return;
  S.dirty = false;
  try { await DB.put(S.nb); $('#saveState').textContent = 'All changes saved'; }
  catch (e) { $('#saveState').textContent = 'Save failed!'; toast('Could not save — storage error'); }
}
window.addEventListener('beforeunload', () => { flush(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

/* ====================================================================
   Library
   ==================================================================== */
function renderStats() {
  const pages = S.notebooks.reduce((a, n) => a + n.pages.length, 0);
  const f = focusToday();
  $('#stats').replaceChildren(
    ...[['' + S.notebooks.length, 'Notebooks'], ['' + pages, 'Pages'], [f.min + ' min', 'Focused today']]
      .map(([b, s]) => el('div', { class: 'stat' }, el('b', {}, b), el('span', {}, s)))
  );
}
function fmtDate(t) {
  const d = new Date(t), now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}
function renderLibrary() {
  renderStats();
  const q = $('#search').value.trim().toLowerCase();
  const list = S.notebooks
    .filter(nb => !q || nb.title.toLowerCase().includes(q) ||
      nb.pages.some(p => p.objects.some(o => o.t === 'tx' && o.text.toLowerCase().includes(q))))
    .sort((a, b) => b.updated - a.updated);
  const grid = $('#grid');
  grid.replaceChildren();
  if (!q) {
    grid.append(el('div', { class: 'nbcard newtile', onclick: newNotebookDialog },
      el('div', { class: 'cover' }, el('span', { html: icon('plus', 34) }), el('span', {}, 'New notebook'))));
  }
  list.forEach(nb => {
    const [c1, c2] = COVERS[nb.cover % COVERS.length];
    const card = el('div', { class: 'nbcard', onclick: () => openNotebook(nb.id) },
      el('div', { class: 'cover', style: `background:linear-gradient(145deg,${c1},${c2})` },
        el('img', { src: 'logo.svg', alt: '' }), el('h3', {}, nb.title)),
      el('div', { class: 'meta' },
        el('span', {}, `${nb.pages.length} page${nb.pages.length === 1 ? '' : 's'} · ${fmtDate(nb.updated)}`),
        el('button', {
          class: 'more', title: 'More', html: icon('more', 18),
          onclick: e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); nbMenu(nb, r.left, r.bottom + 4); },
        })));
    card.addEventListener('contextmenu', e => { e.preventDefault(); nbMenu(nb, e.clientX, e.clientY); });
    grid.append(card);
  });
  if (q && !list.length) grid.append(el('div', { class: 'empty' }, `No notebooks match “${$('#search').value.trim()}”.`));
}
function nbMenu(nb, x, y) {
  showMenu(x, y, [
    { label: 'Open', fn: () => openNotebook(nb.id) },
    { label: 'Rename…', fn: () => renameNb(nb) },
    { label: 'Duplicate', fn: () => duplicateNb(nb) },
    '-',
    { label: 'Export as PDF', fn: () => exportPDF(nb) },
    { label: 'Export notebook file (.inknest)', fn: () => exportNbFile(nb) },
    '-',
    { label: 'Delete…', danger: true, fn: () => deleteNb(nb) },
  ]);
}
async function renameNb(nb) {
  const t = await askText('Rename notebook', 'Title', nb.title);
  if (!t) return;
  nb.title = t; nb.updated = Date.now(); await DB.put(nb); renderLibrary();
}
async function duplicateNb(nb) {
  const c = cloneNotebook(nb, nb.title + ' (copy)');
  S.notebooks.push(c); await DB.put(c); renderLibrary(); toast('Notebook duplicated');
}
async function deleteNb(nb) {
  const ok = await confirmBox('Delete notebook?', `“${nb.title}” and all ${nb.pages.length} of its pages will be permanently deleted. This can’t be undone.`);
  if (!ok) return;
  S.notebooks = S.notebooks.filter(n => n !== nb); await DB.del(nb.id); renderLibrary(); toast('Notebook deleted');
}
function exportNbFile(nb) {
  const data = JSON.stringify({ app: 'InkNest Notes', version: VERSION, notebook: nb });
  download(new Blob([data], { type: 'application/json' }), safeName(nb.title) + '.inknest');
}
async function importFiles(files) {
  let n = 0;
  for (const f of files) {
    try {
      const j = JSON.parse(await f.text());
      const src = j.notebook || j;
      if (!src || !Array.isArray(src.pages) || !src.pages.length) throw new Error('bad');
      const c = cloneNotebook(src, src.title || 'Imported notebook');
      c.cover = src.cover | 0;
      S.notebooks.push(c); await DB.put(c); n++;
    } catch { toast(`Couldn’t import “${f.name}” — not a valid notebook file`, 3500); }
  }
  if (n) { renderLibrary(); toast(`Imported ${n} notebook${n > 1 ? 's' : ''}`); }
}

function templateButton(t, paper, on, fn) {
  const c = el('canvas', { width: 88, height: 124 });
  paintThumb(c, { template: t, paper, objects: [] }, 8);
  return el('button', { class: 'tpl' + (on ? ' on' : ''), title: t, onclick: fn }, c, el('span', {}, t[0].toUpperCase() + t.slice(1)));
}
async function newNotebookDialog() {
  let cover = Math.floor(Math.random() * COVERS.length), tpl = 'lined', paper = 'white';
  const inp = el('input', { class: 'inp', placeholder: 'e.g. Biology — Semester 1', maxlength: 80, spellcheck: 'false' });
  const covers = el('div', { class: 'swatches' }), tpls = el('div', { class: 'opt-row' }), papers = el('div', { class: 'opt-row' });
  const rebuild = () => {
    covers.replaceChildren(...COVERS.map((c, i) => el('button', {
      class: 'cv-sw' + (i === cover ? ' on' : ''), style: `background:linear-gradient(145deg,${c[0]},${c[1]})`,
      onclick: () => { cover = i; rebuild(); },
    })));
    tpls.replaceChildren(...TEMPLATES.map(t => templateButton(t, paper, t === tpl, () => { tpl = t; rebuild(); })));
    papers.replaceChildren(...Object.keys(PAPERS).map(p => el('button', {
      class: 'paper' + (p === paper ? ' on' : ''), title: p, style: `background:${PAPERS[p]}`,
      onclick: () => { paper = p; rebuild(); },
    })));
  };
  rebuild();
  const body = el('div', { class: 'form' },
    el('label', {}, 'Title'), inp, el('label', {}, 'Cover'), covers,
    el('label', {}, 'Page template'), tpls, el('label', {}, 'Paper'), papers);
  body.getValue = () => ({ title: inp.value.trim() || 'Untitled notebook' });
  const v = await modal({ title: 'New notebook', body, ok: 'Create', width: 500 });
  if (!v) return;
  const nb = newNotebook(v.title, cover, tpl, paper);
  S.notebooks.push(nb); await DB.put(nb); openNotebook(nb.id);
}

/* ====================================================================
   Views
   ==================================================================== */
function setView(v) {
  S.view = v;
  $('#library').hidden = v !== 'library';
  $('#editor').hidden = v !== 'editor';
  $('#nbTitleWrap').hidden = v !== 'editor';
  $('#saveState').hidden = v !== 'editor';
  closeMenu(); closePop();
}
function openNotebook(id) {
  const nb = S.notebooks.find(n => n.id === id);
  if (!nb) return;
  S.nb = nb; S.pi = 0; S.undo = []; S.redo = []; S.sel = []; S.live = null; S.tmp = null; S.fit = true;
  $('#nbTitle').value = nb.title;
  $('#saveState').textContent = '';
  setView('editor');
  setTool(S.tool === 'hand' ? 'pen' : S.tool);
  layoutCanvas(); renderThumbs(); goPage(0); updateUndoBtns();
}
async function closeNotebook() {
  commitText();
  await flush();
  S.nb = null; setView('library'); renderLibrary();
}

/* ====================================================================
   Toolbar
   ==================================================================== */
const TOOLS = [
  ['select', 'V', 'Select & move'], ['pen', 'P', 'Pen'], ['hl', 'H', 'Highlighter'], ['eraser', 'E', 'Eraser'],
  ['shape', 'S', 'Shapes'], ['text', 'T', 'Text'], ['laser', 'L', 'Laser pointer'], ['hand', '', 'Hand — drag to scroll'],
];
const HINTS = {
  select: 'Click to select · drag to move · corner handle to resize · Del to delete · right-click for more',
  pen: 'Draw with mouse, stylus or touch · Space + drag to scroll',
  hl: 'Highlighter sits under your text like a real marker',
  eraser: 'Erases whole strokes, shapes, text and images you touch',
  shape: 'Drag to draw · hold Shift for perfect squares, circles and 45° lines',
  text: 'Click on the page to type · Ctrl+Enter or click away to finish',
  laser: 'Hold and move — a red pointer that fades away (not saved)',
  hand: 'Drag to scroll the page',
};
function buildToolbar() {
  const g = $('#toolGroup');
  TOOLS.forEach(([id, key, label]) => {
    g.append(el('button', { class: 'tool', 'data-tool': id, title: label + (key ? ` (${key})` : ''), html: icon(id === 'select' ? 'select' : id, 21), onclick: () => setTool(id) }));
  });
  g.append(el('div', { class: 'sep' }));
  g.append(el('button', { class: 'tool', title: 'Insert image (or drag & drop / paste)', html: icon('image', 21), onclick: () => $('#fileImg').click() }));
}
function setTool(t) {
  commitText();
  if (t !== 'select') setSel([], true);
  S.tool = t;
  $$('.tool[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  applyCursor();
  $('#stHint').textContent = HINTS[t] || '';
  if (t !== 'eraser') $('#ring').style.display = 'none';
  renderOpts(); drawOverlay();
}
function applyCursor() {
  const t = S.tool;
  cv.style.cursor = (S.space || t === 'hand') ? 'grab' : t === 'text' ? 'text' : t === 'select' ? 'default' : t === 'eraser' ? 'none' : 'crosshair';
}
function colorKey() { return S.tool === 'hl' ? 'hl' : S.tool === 'shape' ? 'shape' : S.tool === 'text' ? 'text' : 'pen'; }
function sizeKey() { return ({ pen: 'pen', hl: 'hl', eraser: 'eraser', shape: 'shape', text: 'text' })[S.tool] || null; }
const SIZE_RANGE = { pen: [1, 20], hl: [6, 50], eraser: [8, 90], shape: [1, 16], text: [12, 80] };

function renderOpts() {
  const g = $('#optsGroup'); g.replaceChildren();
  const t = S.tool;
  if (t === 'shape') {
    ['line', 'arrow', 'rect', 'ellipse'].forEach(k => g.append(el('button', {
      class: 'kind' + (S.shape === k ? ' on' : ''), title: k, html: icon('k' + k, 19),
      onclick: () => { S.shape = k; renderOpts(); },
    })));
    g.append(el('div', { class: 'sep' }));
  }
  const showColor = ['pen', 'hl', 'shape', 'text'].includes(t) || (t === 'select' && S.sel.length);
  if (t === 'select' && S.sel.length) g.append(el('span', { class: 'lbl' }, 'Recolor'));
  if (showColor) {
    const key = t === 'select' ? null : colorKey();
    const cur = key ? S.colors[key] : null;
    const pal = t === 'hl' ? HL : INK;
    pal.forEach(c => g.append(el('button', {
      class: 'swatch' + (cur && cur.toLowerCase() === c ? ' on' : ''), style: `background:${c}`, title: c,
      onclick: () => pickColor(c),
    })));
    const ci = el('input', { type: 'color', value: cur || '#111827' });
    ci.addEventListener('input', () => pickColor(ci.value));
    g.append(el('span', { class: 'swatch custom', title: 'Custom colour' }, ci));
  }
  const sk = sizeKey();
  if (sk) {
    const [mn, mx] = SIZE_RANGE[sk];
    const val = el('b', {}, '' + S.sizes[sk]);
    const prev = el('span', { class: 'dot-prev' });
    const dot = el('i'); prev.append(dot);
    const upd = () => {
      const d = clamp(sk === 'text' ? 8 + S.sizes[sk] / 4 : S.sizes[sk], 3, 24);
      dot.style.width = dot.style.height = d + 'px';
      prev.style.color = sk === 'eraser' ? 'var(--muted)' : (S.colors[colorKey()] || '#111');
      val.textContent = S.sizes[sk];
    };
    const r = el('input', { type: 'range', min: mn, max: mx, value: S.sizes[sk] });
    r.addEventListener('input', () => { S.sizes[sk] = +r.value; upd(); saveTools(); });
    upd();
    g.append(el('div', { class: 'size' }, prev, r, val));
  }
}
function pickColor(c) {
  if (S.tool === 'select') { recolor(c); return; }
  S.colors[colorKey()] = c; saveTools(); renderOpts();
}
function saveTools() { LS.set('tools', { colors: S.colors, sizes: S.sizes, shape: S.shape }); }
function loadTools() {
  const t = LS.get('tools', null);
  if (t) { Object.assign(S.colors, t.colors || {}); Object.assign(S.sizes, t.sizes || {}); if (t.shape) S.shape = t.shape; }
  S.penOnly = LS.get('penOnly', false);
  $('#penOnly').classList.toggle('on', S.penOnly);
}

/* ====================================================================
   Selection & history
   ==================================================================== */
function setSel(arr, quiet) {
  S.sel = arr;
  if (!quiet) { if (S.tool === 'select') renderOpts(); drawOverlay(); }
}
function setObjects(arr) {
  const pg = page();
  S.undo.push({ id: pg.id, objs: pg.objects });
  if (S.undo.length > 250) S.undo.shift();
  S.redo.length = 0;
  pg.objects = arr;
  markDirty(); draw(); drawOverlay(); updateUndoBtns(); refreshThumb(pg);
}
function updateUndoBtns() {
  $('#undoBtn').disabled = !S.undo.length;
  $('#redoBtn').disabled = !S.redo.length;
}
function undo() {
  commitText();
  const h = S.undo.pop(); if (!h) return;
  const i = S.nb.pages.findIndex(p => p.id === h.id);
  if (i < 0) return undo();
  const pg = S.nb.pages[i];
  S.redo.push({ id: h.id, objs: pg.objects }); pg.objects = h.objs; afterHistory(i, pg);
}
function redo() {
  commitText();
  const h = S.redo.pop(); if (!h) return;
  const i = S.nb.pages.findIndex(p => p.id === h.id);
  if (i < 0) return redo();
  const pg = S.nb.pages[i];
  S.undo.push({ id: h.id, objs: pg.objects }); pg.objects = h.objs; afterHistory(i, pg);
}
function afterHistory(i, pg) {
  markDirty(); updateUndoBtns(); refreshThumb(pg);
  if (i !== S.pi) goPage(i); else { setSel([]); draw(); }
}
function delSel() {
  if (!S.sel.length) return;
  const gone = new Set(S.sel);
  setObjects(page().objects.filter(o => !gone.has(o))); setSel([]);
}
function recolor(c) {
  if (!S.sel.length) return;
  const m = new Map(); S.sel.forEach(o => { if (o.t !== 'im') m.set(o, { ...o, color: c }); });
  if (!m.size) return;
  setObjects(page().objects.map(o => m.get(o) || o));
  setSel(S.sel.map(o => m.get(o) || o));
}
function copySel() { if (S.sel.length) { S.clip = S.sel.slice(); S.pasteN = 0; toast('Copied'); } }
function pasteClip() {
  if (!S.clip || !S.clip.length) return;
  const off = (++S.pasteN) * 26;
  const add = S.clip.map(o => moved(o, off, off));
  setObjects([...page().objects, ...add]);
  setTool('select'); setSel(add);
}
function dupSel() { if (!S.sel.length) return; copySel(); pasteClip(); }
function reorder(front) {
  if (!S.sel.length) return;
  const s = new Set(S.sel), rest = page().objects.filter(o => !s.has(o)), mine = page().objects.filter(o => s.has(o));
  setObjects(front ? [...rest, ...mine] : [...mine, ...rest]);
}

/* ====================================================================
   Canvas layout & rendering
   ==================================================================== */
function layoutCanvas() {
  if (!S.nb) return;
  const sc = $('#scroll');
  if (S.fit) S.zoom = clamp((sc.clientWidth - 60) / PW, .3, 3);
  const dpr = window.devicePixelRatio || 1;
  const k = Math.min(S.zoom * dpr, 7500 / PH);
  const cssW = Math.round(PW * S.zoom), cssH = Math.round(PH * S.zoom);
  cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
  cv.width = ov.width = Math.round(PW * k); cv.height = ov.height = Math.round(PH * k);
  S.k = k;
  $('#zoomLbl').textContent = Math.round(S.zoom * 100) + '%';
  $('#stZoom').textContent = 'Zoom ' + Math.round(S.zoom * 100) + '%';
  draw(); drawOverlay();
}
function setZoom(z, fit = false) {
  commitText();
  const sc = $('#scroll');
  const cx = (sc.scrollLeft + sc.clientWidth / 2) / Math.max(1, sc.scrollWidth);
  const cy = (sc.scrollTop + sc.clientHeight / 2) / Math.max(1, sc.scrollHeight);
  S.fit = fit; if (!fit) S.zoom = clamp(z, .3, 3);
  layoutCanvas();
  sc.scrollLeft = cx * sc.scrollWidth - sc.clientWidth / 2;
  sc.scrollTop = cy * sc.scrollHeight - sc.clientHeight / 2;
}
const zoomBy = f => setZoom(S.zoom * f);
const fitWidth = () => setZoom(1, true);

function draw() {
  if (!S.nb) return;
  const ctx = cv.getContext('2d'), pg = page(), dark = pg.paper === 'dark';
  ctx.setTransform(S.k, 0, 0, S.k, 0, 0);
  drawBackground(ctx, pg);
  for (const o of (S.live || pg.objects)) if (o !== S.hide) drawObj(ctx, o, dark);
  if (S.tmp) drawObj(ctx, S.tmp, dark);
}
function snapshot() {
  const c = document.createElement('canvas');
  c.width = cv.width; c.height = cv.height;
  c.getContext('2d').drawImage(cv, 0, 0);
  S.snap = c;
}
function drawLive() {
  const ctx = cv.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(S.snap, 0, 0);
  ctx.setTransform(S.k, 0, 0, S.k, 0, 0);
  drawObj(ctx, S.tmp, page().paper === 'dark');
}
function selBox() {
  const sel = S.previewSel || S.sel;
  if (!sel.length) return null;
  const b = boundsOf(sel), p = 6 / S.zoom;
  return [b[0] - p, b[1] - p, b[2] + p, b[3] + p];
}
function drawOverlay() {
  if (!S.nb) return;
  const o = ov.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, ov.width, ov.height);
  o.setTransform(S.k, 0, 0, S.k, 0, 0);
  const z = S.zoom, acc = '#5b5bf0';
  const b = selBox();
  if (b) {
    o.strokeStyle = acc; o.lineWidth = 1.5 / z; o.setLineDash([6 / z, 4 / z]);
    o.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); o.setLineDash([]);
    const h = 11 / z;
    o.fillStyle = '#fff'; o.lineWidth = 2 / z;
    o.fillRect(b[2] - h / 2, b[3] - h / 2, h, h); o.strokeRect(b[2] - h / 2, b[3] - h / 2, h, h);
  }
  if (S.marq) {
    const m = S.marq, x = Math.min(m.x, m.x2), y = Math.min(m.y, m.y2), w = Math.abs(m.x2 - m.x), h = Math.abs(m.y2 - m.y);
    o.fillStyle = 'rgba(91,91,240,.12)'; o.fillRect(x, y, w, h);
    o.strokeStyle = acc; o.lineWidth = 1 / z; o.strokeRect(x, y, w, h);
  }
  const now = performance.now();
  S.trail = S.trail.filter(p => now - p.t < 900);
  if (S.trail.length) {
    o.lineCap = 'round'; o.lineJoin = 'round';
    for (let i = 1; i < S.trail.length; i++) {
      const a = S.trail[i - 1], c = S.trail[i], age = (now - c.t) / 900;
      o.strokeStyle = `rgba(255,40,70,${(1 - age) * .85})`;
      o.lineWidth = (8 * (1 - age * .6)) / z;
      o.beginPath(); o.moveTo(a.x, a.y); o.lineTo(c.x, c.y); o.stroke();
    }
    const h = S.trail[S.trail.length - 1];
    if (now - h.t < 300) {
      o.save(); o.shadowColor = 'rgba(255,40,70,.9)'; o.shadowBlur = 18; o.fillStyle = 'rgba(255,60,80,.95)';
      o.beginPath(); o.arc(h.x, h.y, 7 / z, 0, Math.PI * 2); o.fill(); o.restore();
    }
    laserLoop();
  }
}
let laserRaf = 0;
function laserLoop() {
  if (laserRaf) return;
  laserRaf = requestAnimationFrame(() => { laserRaf = 0; drawOverlay(); });
}

/* ====================================================================
   Pointer interaction
   ==================================================================== */
function toPage(e) {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * PW, (e.clientY - r.top) / r.height * PH];
}
function topHit(x, y) {
  const objs = page().objects, r = 6 / S.zoom;
  for (let i = objs.length - 1; i >= 0; i--) if (hitObj(objs[i], x, y, r)) return objs[i];
  return null;
}
function ringAt(e) {
  const ring = $('#ring');
  if (S.tool !== 'eraser' || e.pointerType === 'touch') { ring.style.display = 'none'; return; }
  const d = S.sizes.eraser * S.zoom;
  ring.style.display = 'block'; ring.style.width = ring.style.height = d + 'px';
  ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
}
cv.addEventListener('pointerleave', () => { if (!S.drag) $('#ring').style.display = 'none'; });
cv.addEventListener('pointerenter', ringAt);
cv.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (S.tool !== 'select') return;
  const [x, y] = toPage(e);
  if (!S.sel.length) { const h = topHit(x, y); if (h) setSel([h]); }
  if (!S.sel.length) return;
  showMenu(e.clientX, e.clientY, [
    { label: 'Duplicate  (Ctrl+D)', fn: dupSel }, { label: 'Copy  (Ctrl+C)', fn: copySel },
    { label: 'Bring to front', fn: () => reorder(true) }, { label: 'Send to back', fn: () => reorder(false) },
    '-', { label: 'Delete  (Del)', danger: true, fn: delSel },
  ]);
});

cv.addEventListener('pointerdown', e => {
  if (S.drag) return;
  if (S.editing) commitText();
  const sc = $('#scroll');
  const pan = () => { S.drag = { mode: 'pan', id: e.pointerId, x: e.clientX, y: e.clientY, sl: sc.scrollLeft, st: sc.scrollTop }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; };
  if (e.pointerType === 'touch' && S.penOnly) return pan();
  if (e.button === 1 || S.space || S.tool === 'hand') { e.preventDefault(); return pan(); }
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  let tool = S.tool;
  if (e.pointerType === 'pen' && (e.buttons & 32)) tool = 'eraser';       // stylus eraser end
  const [x, y] = toPage(e), pg = page();
  cv.setPointerCapture(e.pointerId);
  const base = { id: e.pointerId, pointerType: e.pointerType };

  if (tool === 'pen' || tool === 'hl') {
    setSel([], true); draw(); drawOverlay(); snapshot();
    const key = tool === 'hl' ? 'hl' : 'pen';
    const p = e.pointerType === 'pen' ? (e.pressure || .5) : .5;
    S.tmp = { t: 's', tool, color: S.colors[key], w: S.sizes[tool], pts: [[x, y, p]], vp: tool === 'pen' && e.pointerType === 'pen' };
    S.drag = { ...base, mode: 'draw' }; drawLive();
  } else if (tool === 'shape') {
    setSel([], true); draw(); drawOverlay(); snapshot();
    S.tmp = { t: 'sh', kind: S.shape, color: S.colors.shape, w: S.sizes.shape, x1: x, y1: y, x2: x, y2: y };
    S.drag = { ...base, mode: 'shape' };
  } else if (tool === 'eraser') {
    S.eraseBase = null; S.live = null;
    S.drag = { ...base, mode: 'erase', lx: x, ly: y }; eraseAt(x, y); ringAt(e);
  } else if (tool === 'text') {
    S.drag = { ...base, mode: 'text', x, y };
  } else if (tool === 'laser') {
    S.trail.push({ x, y, t: performance.now() }); S.drag = { ...base, mode: 'laser' }; drawOverlay();
  } else if (tool === 'select') {
    const sel = S.sel, b = selBox();
    if (b) {
      const hs = 14 / S.zoom;
      if (Math.abs(x - b[2]) < hs && Math.abs(y - b[3]) < hs) {
        const bb = boundsOf(sel);
        S.drag = { ...base, mode: 'resize', orig: sel.slice(), ox: bb[0], oy: bb[1], w0: Math.max(1, bb[2] - bb[0]), x, y, moved: false };
        return;
      }
    }
    const hit = topHit(x, y);
    if (hit && !(b && sel.includes(hit))) {
      setSel(e.shiftKey ? (sel.includes(hit) ? sel.filter(o => o !== hit) : [...sel, hit]) : [hit]);
      S.drag = { ...base, mode: 'move', orig: S.sel.slice(), x, y, moved: false };
    } else if (b && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) {
      S.drag = { ...base, mode: 'move', orig: sel.slice(), x, y, moved: false };
    } else {
      if (!e.shiftKey) setSel([]);
      S.marq = { x, y, x2: x, y2: y }; S.drag = { ...base, mode: 'marquee' };
    }
  }
});

function eraseAt(x, y, fromX, fromY) {
  const r = S.sizes.eraser / 2;
  // sample along the path since the last event so fast swipes can't skip over strokes
  const pts = [];
  if (fromX != null) {
    const dist = Math.hypot(x - fromX, y - fromY), n = Math.max(1, Math.ceil(dist / Math.max(2, r * 0.6)));
    for (let i = 1; i <= n; i++) pts.push([fromX + (x - fromX) * i / n, fromY + (y - fromY) * i / n]);
  } else pts.push([x, y]);
  let cur = S.live || page().objects;
  const start = cur.length;
  for (const [px, py] of pts) cur = cur.filter(o => !hitObj(o, px, py, r));
  if (cur.length !== start) { S.live = cur; draw(); }
}

cv.addEventListener('pointermove', e => {
  const d = S.drag;
  if (!d) { ringAt(e); return; }
  if (e.pointerId !== d.id) return;
  if (d.mode === 'pan') {
    const sc = $('#scroll');
    sc.scrollLeft = d.sl - (e.clientX - d.x); sc.scrollTop = d.st - (e.clientY - d.y); return;
  }
  const [x, y] = toPage(e);
  switch (d.mode) {
    case 'draw': {
      const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
      const pts = S.tmp.pts;
      for (const ce of (evs.length ? evs : [e])) {
        const [cx, cy] = toPage(ce), l = pts[pts.length - 1];
        if (Math.hypot(cx - l[0], cy - l[1]) < 0.8) continue;
        pts.push([cx, cy, ce.pointerType === 'pen' ? (ce.pressure || .5) : .5]);
      }
      drawLive(); break;
    }
    case 'shape': {
      const t = S.tmp; let x2 = x, y2 = y;
      if (e.shiftKey) {
        const dx = x - t.x1, dy = y - t.y1;
        if (t.kind === 'rect' || t.kind === 'ellipse') { const m = Math.max(Math.abs(dx), Math.abs(dy)); x2 = t.x1 + Math.sign(dx || 1) * m; y2 = t.y1 + Math.sign(dy || 1) * m; }
        else { const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), L = Math.hypot(dx, dy); x2 = t.x1 + L * Math.cos(a); y2 = t.y1 + L * Math.sin(a); }
      }
      t.x2 = x2; t.y2 = y2; drawLive(); break;
    }
    case 'erase': eraseAt(x, y, d.lx, d.ly); d.lx = x; d.ly = y; ringAt(e); break;
    case 'laser': S.trail.push({ x, y, t: performance.now() }); drawOverlay(); break;
    case 'move': {
      const dx = x - d.x, dy = y - d.y;
      if (!d.moved && Math.hypot(dx, dy) * S.zoom < 3) return;
      d.moved = true;
      const m = new Map(d.orig.map(o => [o, moved(o, dx, dy)]));
      S.live = page().objects.map(o => m.get(o) || o);
      S.previewSel = d.orig.map(o => m.get(o));
      draw(); drawOverlay(); break;
    }
    case 'resize': {
      const s = clamp((x - d.ox) / d.w0, .05, 12);
      if (!d.moved && Math.abs(s - 1) < .01) return;
      d.moved = true;
      const m = new Map(d.orig.map(o => [o, scaled(o, s, d.ox, d.oy)]));
      S.live = page().objects.map(o => m.get(o) || o);
      S.previewSel = d.orig.map(o => m.get(o));
      draw(); drawOverlay(); break;
    }
    case 'marquee': S.marq.x2 = x; S.marq.y2 = y; drawOverlay(); break;
  }
});

function endDrag(e) {
  const d = S.drag;
  if (!d || e.pointerId !== d.id) return;
  S.drag = null;
  try { cv.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  const pg = page();
  switch (d.mode) {
    case 'pan': applyCursor(); break;
    case 'draw': {
      const o = S.tmp; S.tmp = null; S.snap = null;
      o.pts = o.pts.map(p => [+p[0].toFixed(1), +p[1].toFixed(1), +p[2].toFixed(2)]);
      setObjects([...pg.objects, o]); break;
    }
    case 'shape': {
      const o = S.tmp; S.tmp = null; S.snap = null;
      if (Math.hypot(o.x2 - o.x1, o.y2 - o.y1) < 4) { draw(); break; }
      setObjects([...pg.objects, o]); break;
    }
    case 'erase': {
      const keep = S.live; S.live = null;
      if (keep) setObjects(keep); else draw();
      break;
    }
    case 'text': {
      const { x, y } = d;
      const hit = [...pg.objects].reverse().find(o => o.t === 'tx' && hitObj(o, x, y, 4));
      setTimeout(() => startTextEdit(hit ? hit.x : x, hit ? hit.y : y, hit || null), 0);
      break;
    }
    case 'move': case 'resize': {
      if (d.moved && S.live) { const live = S.live, ps = S.previewSel; S.live = null; S.previewSel = null; setObjects(live); setSel(ps); }
      else { S.live = null; S.previewSel = null; }
      break;
    }
    case 'marquee': {
      const m = S.marq; S.marq = null;
      const x1 = Math.min(m.x, m.x2), x2 = Math.max(m.x, m.x2), y1 = Math.min(m.y, m.y2), y2 = Math.max(m.y, m.y2);
      if (x2 - x1 > 3 || y2 - y1 > 3) {
        const found = pg.objects.filter(o => { const b = bbox(o); return b[2] >= x1 && b[0] <= x2 && b[3] >= y1 && b[1] <= y2; });
        setSel([...new Set([...S.sel, ...found])]);
      } else drawOverlay();
      break;
    }
    case 'laser': drawOverlay(); break;
  }
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

cv.addEventListener('dblclick', e => {
  if (S.tool !== 'select') return;
  const [x, y] = toPage(e), h = topHit(x, y);
  if (h && h.t === 'tx') startTextEdit(h.x, h.y, h);
});

$('#scroll').addEventListener('wheel', e => {
  if (!(e.ctrlKey || e.metaKey) || S.view !== 'editor') return;
  e.preventDefault(); zoomBy(Math.exp(-e.deltaY * 0.0016));
}, { passive: false });

/* ---------- text editing ---------- */
function startTextEdit(x, y, existing) {
  commitText();
  const size = existing ? existing.size : S.sizes.text, color = existing ? existing.color : S.colors.text;
  const ta = el('textarea', { class: 'text-edit', spellcheck: 'false', rows: '1', wrap: 'off' });
  ta.value = existing ? existing.text : '';
  Object.assign(ta.style, { left: x * S.zoom + 'px', top: y * S.zoom + 'px', fontSize: size * S.zoom + 'px', color });
  $('#pageWrap').append(ta);
  S.editing = { ta, existing, x, y, size, color, pid: page().id };
  S.hide = existing || null; draw();
  const fit = () => {
    ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px';
    mctx.font = `${size * S.zoom}px ${FONT}`;
    let w = 30; for (const l of ta.value.split('\n')) w = Math.max(w, mctx.measureText(l || ' ').width);
    ta.style.width = (w + size * S.zoom) + 'px';
  };
  ta.addEventListener('input', fit);
  ta.addEventListener('blur', () => commitText());
  ta.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); ta.blur(); }
  });
  fit(); ta.focus();
}
function commitText() {
  const E = S.editing; if (!E) return;
  S.editing = null; S.hide = null;
  const txt = E.ta.value.replace(/\s+$/, '');
  E.ta.remove();
  const pg = S.nb && S.nb.pages.find(p => p.id === E.pid);
  if (!pg || pg !== page()) return;
  if (E.existing) {
    if (!txt) setObjects(pg.objects.filter(o => o !== E.existing));
    else if (txt !== E.existing.text) {
      const n = { ...E.existing, text: txt };
      setObjects(pg.objects.map(o => o === E.existing ? n : o));
      if (S.tool === 'select') setSel([n]);
    } else draw();
  } else if (txt) {
    setObjects([...pg.objects, { t: 'tx', x: E.x, y: E.y, size: E.size, color: E.color, text: txt }]);
  } else draw();
}

/* ---------- images ---------- */
function readDataURL(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
async function insertImageFile(file) {
  if (!file || !file.type.startsWith('image/') || !S.nb) return;
  try {
    commitText();
    let src = await readDataURL(file);
    const im = await loadImg(src);
    let w = im.naturalWidth, h = im.naturalHeight;
    if (!w || !h) throw new Error('bad image');
    if (Math.max(w, h) > 1600 || file.size > 900000) {
      const k = Math.min(1, 1600 / Math.max(w, h)), c = el('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      src = c.toDataURL(file.type === 'image/png' && file.size < 900000 ? 'image/png' : 'image/jpeg', .88);
      w = c.width; h = c.height;
    }
    const s = Math.min(1, 560 / w, 700 / h), dw = w * s, dh = h * s;
    const sc = $('#scroll'), top = (sc.scrollTop - $('#pageWrap').offsetTop) / S.zoom;
    const o = { t: 'im', src, x: (PW - dw) / 2, y: clamp(top + 70, 40, Math.max(40, PH - dh - 40)), w: dw, h: dh };
    setObjects([...page().objects, o]);
    setTool('select'); setSel([o]);
  } catch { toast('Couldn’t insert that image'); }
}
$('#fileImg').addEventListener('change', e => { [...e.target.files].forEach(insertImageFile); e.target.value = ''; });
$('#scroll').addEventListener('dragover', e => { if (S.view === 'editor') e.preventDefault(); });
$('#scroll').addEventListener('drop', e => {
  if (S.view !== 'editor') return;
  const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/'));
  if (files.length) { e.preventDefault(); files.forEach(insertImageFile); }
});
document.addEventListener('paste', e => {
  if (S.view !== 'editor') return;
  const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
  if (files.length) { e.preventDefault(); files.forEach(insertImageFile); return; }
  if (S.clip && S.clip.length) { e.preventDefault(); pasteClip(); }
});

/* ====================================================================
   Pages & thumbnails
   ==================================================================== */
function paintThumb(c, pg, k = 3) {
  const ctx = c.getContext('2d');
  ctx.setTransform(c.width / PW, 0, 0, c.width / PW, 0, 0);
  drawBackground(ctx, pg, k);
  const dark = pg.paper === 'dark';
  for (const o of pg.objects) drawObj(ctx, o, dark);
}
function renderThumbs() {
  const box = $('#thumbs'); box.replaceChildren();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  S.nb.pages.forEach((pg, i) => {
    const c = el('canvas', { width: Math.round(150 * dpr), height: Math.round(150 * dpr * PH / PW), 'data-pid': pg.id });
    paintThumb(c, pg);
    const t = el('div', { class: 'thumb' + (i === S.pi ? ' on' : ''), draggable: 'true' }, c,
      el('span', { class: 'num' }, '' + (i + 1)), el('span', { class: 'tstar' + (pg.star ? ' on' : ''), html: icon('star', 16) }));
    t.addEventListener('click', () => goPage(i));
    t.addEventListener('contextmenu', e => { e.preventDefault(); pageMenu(i, e.clientX, e.clientY); });
    t.addEventListener('dragstart', e => { S.dragThumb = i; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'page'); } catch { /* ignore */ } });
    t.addEventListener('dragover', e => { if (S.dragThumb != null) { e.preventDefault(); t.classList.add('dragover'); } });
    t.addEventListener('dragleave', () => t.classList.remove('dragover'));
    t.addEventListener('drop', e => { e.preventDefault(); t.classList.remove('dragover'); const f = S.dragThumb; S.dragThumb = null; if (f != null && f !== i) movePage(f, i); });
    t.addEventListener('dragend', () => { S.dragThumb = null; });
    box.append(t);
  });
}
let thumbT = null;
function thumbsSoon() { clearTimeout(thumbT); thumbT = setTimeout(() => { if (S.nb) renderThumbs(); }, 300); }
function refreshThumb(pg) {
  clearTimeout(refreshThumb.t);
  refreshThumb.t = setTimeout(() => {
    const c = $(`canvas[data-pid="${pg.id}"]`); if (c) paintThumb(c, pg);
  }, 250);
}
function goPage(i) {
  commitText();
  S.pi = clamp(i, 0, S.nb.pages.length - 1);
  setSel([], true); S.live = null; S.tmp = null; S.previewSel = null;
  draw(); drawOverlay();
  $$('.thumb').forEach((t, n) => t.classList.toggle('on', n === S.pi));
  const cur = $$('.thumb')[S.pi]; if (cur) cur.scrollIntoView({ block: 'nearest' });
  $('#stPage').textContent = `Page ${S.pi + 1} of ${S.nb.pages.length}`;
  $('#scroll').scrollTop = 0;
  if (S.tool === 'select') renderOpts();
}
function addPage(after = S.pi) {
  const cur = S.nb.pages[after], p = newPage(cur.template, cur.paper);
  S.nb.pages.splice(after + 1, 0, p); markDirty(); renderThumbs(); goPage(after + 1);
}
function dupPage(i) {
  const src = S.nb.pages[i], p = { ...src, id: uid(), objects: src.objects.slice(), star: false };
  S.nb.pages.splice(i + 1, 0, p); markDirty(); renderThumbs(); goPage(i + 1); toast('Page duplicated');
}
async function delPage(i) {
  if (S.nb.pages.length === 1) {
    const pg = S.nb.pages[0];
    if (pg.objects.length && await confirmBox('Clear page?', 'This is the only page, so it will be cleared instead of deleted.', 'Clear page')) { goPage(0); setObjects([]); }
    return;
  }
  if (S.nb.pages[i].objects.length && !(await confirmBox('Delete page?', `Page ${i + 1} and everything on it will be deleted.`))) return;
  S.nb.pages.splice(i, 1); markDirty(); renderThumbs(); goPage(Math.min(i, S.nb.pages.length - 1));
}
function movePage(from, to) {
  const [p] = S.nb.pages.splice(from, 1); S.nb.pages.splice(to, 0, p);
  markDirty(); renderThumbs(); goPage(S.nb.pages.indexOf(p));
}
function pageMenu(i, x, y) {
  const pg = S.nb.pages[i], n = S.nb.pages.length;
  showMenu(x, y, [
    { label: 'Add page after', fn: () => addPage(i) },
    { label: 'Duplicate page', fn: () => dupPage(i) },
    { label: pg.star ? 'Remove star' : 'Star this page', fn: () => { pg.star = !pg.star; markDirty(); renderThumbs(); } },
    i > 0 ? { label: 'Move up', fn: () => movePage(i, i - 1) } : null,
    i < n - 1 ? { label: 'Move down', fn: () => movePage(i, i + 1) } : null,
    '-', { label: 'Delete page…', danger: true, fn: () => delPage(i) },
  ].filter(Boolean));
}

function pageSettings(anchor) {
  const pg = page(), box = el('div', {});
  const apply = (all) => {
    markDirty(); draw();
    if (all) S.nb.pages.forEach(p => { p.template = pg.template; p.paper = pg.paper; });
    renderThumbs(); pageSettings(anchor);
  };
  box.append(el('div', { class: 'pop-title' }, 'Template'));
  box.append(el('div', { class: 'tpl-grid' }, ...TEMPLATES.map(t => templateButton(t, pg.paper, pg.template === t, () => { pg.template = t; apply(false); }))));
  box.append(el('div', { class: 'pop-title' }, 'Paper'));
  box.append(el('div', { class: 'opt-row', style: 'margin-bottom:14px' }, ...Object.keys(PAPERS).map(p =>
    el('button', { class: 'paper' + (pg.paper === p ? ' on' : ''), title: p, style: `background:${PAPERS[p]}`, onclick: () => { pg.paper = p; apply(false); } }))));
  box.append(el('button', { class: 'btn ghost', onclick: () => { apply(true); toast('Applied to all pages'); } }, 'Apply to all pages'));
  popover(anchor, box);
}

/* ====================================================================
   Export  (PNG / PDF / notebook file)
   ==================================================================== */
async function pageCanvas(pg, scale) {
  await Promise.all(pg.objects.filter(o => o.t === 'im').map(o => loadImg(o.src)));
  const c = el('canvas'); c.width = Math.round(PW * scale); c.height = Math.round(PH * scale);
  const x = c.getContext('2d'); x.scale(scale, scale);
  drawBackground(x, pg);
  const dark = pg.paper === 'dark';
  for (const o of pg.objects) drawObj(x, o, dark);
  return c;
}
async function exportPNG() {
  commitText();
  const c = await pageCanvas(page(), 2);
  c.toBlob(b => download(b, `${safeName(S.nb.title)}-page-${S.pi + 1}.png`), 'image/png');
}
async function buildPDF(nb) {
  const enc = new TextEncoder(), chunks = [], offsets = []; let len = 0;
  const push = d => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; };
  const begin = n => { offsets[n] = len; push(`${n} 0 obj\n`); };
  push('%PDF-1.4\n%âãÏÓ\n');
  const N = nb.pages.length, W = 595.28, H = 841.89;
  begin(1); push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  begin(2); push(`<< /Type /Pages /Count ${N} /Kids [${nb.pages.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')}] >>\nendobj\n`);
  for (let i = 0; i < N; i++) {
    const c = await pageCanvas(nb.pages[i], 1.7);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .92));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pageObj = 3 + 3 * i, content = 4 + 3 * i, image = 5 + 3 * i;
    begin(pageObj); push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${content} 0 R >>\nendobj\n`);
    const cs = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    begin(content); push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream\nendobj\n`);
    begin(image); push(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
    push(bytes); push('\nendstream\nendobj\n');
  }
  const total = 3 + 3 * N, xref = len;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let n = 1; n < total; n++) push(String(offsets[n]).padStart(10, '0') + ' 00000 n \n');
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}
async function exportPDF(nb = S.nb) {
  if (S.nb === nb) commitText();
  toast(`Building PDF (${nb.pages.length} page${nb.pages.length > 1 ? 's' : ''})…`, 1800);
  try { download(await buildPDF(nb), safeName(nb.title) + '.pdf'); }
  catch (e) { toast('PDF export failed'); }
}
function exportMenu(anchor) {
  const r = anchor.getBoundingClientRect();
  showMenu(r.right - 220, r.bottom + 6, [
    { label: 'Export notebook as PDF', fn: () => exportPDF() },
    { label: 'Export this page as PNG', fn: exportPNG },
    '-', { label: 'Export notebook file (.inknest)', fn: () => { flush(); exportNbFile(S.nb); } },
  ]);
}

/* ====================================================================
   Study timer (Pomodoro)
   ==================================================================== */
const TM = { mode: 'focus', mins: { focus: 25, short: 5, long: 15 }, left: 1500, running: false, end: 0, iv: null };
const fmtT = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
function focusToday() {
  const key = new Date().toLocaleDateString('en-CA'), d = LS.get('focus', null);
  return d && d.date === key ? d : { date: key, sessions: 0, min: 0 };
}
function tmSet(mode) { clearInterval(TM.iv); TM.mode = mode; TM.running = false; TM.left = TM.mins[mode] * 60; tmUI(); }
function tmToggle() {
  if (TM.running) { TM.running = false; clearInterval(TM.iv); TM.left = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000)); }
  else { if (TM.left <= 0) TM.left = TM.mins[TM.mode] * 60; TM.running = true; TM.end = Date.now() + TM.left * 1000; TM.iv = setInterval(tmTick, 250); }
  tmUI();
}
function tmTick() {
  const l = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000));
  if (l !== TM.left) { TM.left = l; tmUI(); }
  if (l <= 0) tmDone();
}
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, .28, .56].forEach(t => {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.0001, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, a.currentTime + t + .03);
      g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t + .22);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + .25);
    });
  } catch { /* ignore */ }
}
function tmDone() {
  clearInterval(TM.iv); TM.running = false; beep();
  if (TM.mode === 'focus') {
    const f = focusToday(); f.sessions++; f.min += TM.mins.focus; LS.set('focus', f);
    toast('Focus session complete — time for a break!', 4000); tmSet('short');
  } else { toast('Break over — ready for another round?', 4000); tmSet('focus'); }
  if (S.view === 'library') renderStats();
}
function tmUI() {
  $('#timerText').textContent = fmtT(TM.left);
  $('#timerBtn').classList.toggle('running', TM.running);
  document.title = TM.running ? `${fmtT(TM.left)} · InkNest Notes` : 'InkNest Notes';
  if (popEl && $('#tmBig', popEl)) {
    $('#tmBig', popEl).textContent = fmtT(TM.left);
    $('#tmGo', popEl).textContent = TM.running ? 'Pause' : 'Start';
    $$('.tm-modes button', popEl).forEach(b => b.classList.toggle('on', b.dataset.m === TM.mode));
  }
}
function timerPop() {
  const box = el('div', {});
  box.append(el('div', { class: 'tm-modes' }, ...[['focus', 'Focus'], ['short', 'Short break'], ['long', 'Long break']].map(([m, l]) =>
    el('button', { 'data-m': m, class: TM.mode === m ? 'on' : '', onclick: () => tmSet(m) }, l))));
  box.append(el('div', { class: 'tm-big', id: 'tmBig' }, fmtT(TM.left)));
  box.append(el('div', { class: 'tm-row' },
    el('button', { class: 'btn ghost', title: '-5 min', onclick: () => { TM.mins[TM.mode] = Math.max(5, TM.mins[TM.mode] - 5); if (!TM.running) tmSet(TM.mode); } }, '−5'),
    el('button', { class: 'btn primary', id: 'tmGo', onclick: tmToggle }, TM.running ? 'Pause' : 'Start'),
    el('button', { class: 'btn ghost', title: '+5 min', onclick: () => { TM.mins[TM.mode] = Math.min(90, TM.mins[TM.mode] + 5); if (!TM.running) tmSet(TM.mode); } }, '+5'),
    el('button', { class: 'btn ghost', onclick: () => tmSet(TM.mode) }, 'Reset')));
  const f = focusToday();
  box.append(el('div', { class: 'tm-note' }, `Today: ${f.sessions} session${f.sessions === 1 ? '' : 's'} · ${f.min} min focused`));
  popover($('#timerBtn'), box);
}

/* ====================================================================
   Theme, About
   ==================================================================== */
function applyTheme(t) {
  document.documentElement.dataset.theme = t; LS.set('theme', t);
  $('#themeBtn').innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
}
function aboutDialog() {
  const keys = [['P / H / E', 'Pen · Highlighter · Eraser'], ['V / S / T / L', 'Select · Shapes · Text · Laser'], ['Space + drag', 'Scroll the page'],
    ['Ctrl + Z / Y', 'Undo · Redo'], ['Ctrl + C / V / D', 'Copy · Paste · Duplicate'], ['Del', 'Delete selection'],
    ['Ctrl + wheel', 'Zoom'], ['Ctrl + 0', 'Fit page to width'], ['PgUp / PgDn', 'Previous · next page'], ['Ctrl + S', 'Save now']];
  const body = el('div', { class: 'about' },
    el('img', { src: 'logo.svg', alt: '' }), el('h3', {}, 'InkNest Notes'),
    el('p', {}, `Version ${VERSION} — a handwriting-first notebook for studying.`),
    el('p', {}, 'Your notebooks are stored privately on this computer. Use Export to back them up.'),
    el('div', { class: 'keys' }, ...keys.flatMap(([k, d]) => [el('kbd', {}, k), el('span', {}, d)])));
  modal({ title: '', body, ok: 'Close', cancel: null, width: 440 });
}

/* ====================================================================
   Events & keyboard
   ==================================================================== */
function bindEvents() {
  $('#brand').addEventListener('click', () => { if (S.view === 'editor') closeNotebook(); });
  $('#newNb').addEventListener('click', newNotebookDialog);
  $('#importBtn').addEventListener('click', () => $('#fileImport').click());
  $('#fileImport').addEventListener('change', e => { importFiles([...e.target.files]); e.target.value = ''; });
  $('#search').addEventListener('input', renderLibrary);
  $('#themeBtn').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#aboutBtn').addEventListener('click', aboutDialog);
  $('#timerBtn').addEventListener('click', () => { if (popEl && $('#tmBig', popEl)) closePop(); else timerPop(); });
  $('#nbTitle').addEventListener('input', e => { if (S.nb) { S.nb.title = e.target.value.trim() || 'Untitled notebook'; markDirty(); } });
  $('#nbTitle').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);
  $('#zoomIn').addEventListener('click', () => zoomBy(1.15));
  $('#zoomOut').addEventListener('click', () => zoomBy(1 / 1.15));
  $('#zoomLbl').addEventListener('click', fitWidth);
  $('#penOnly').addEventListener('click', e => { S.penOnly = !S.penOnly; LS.set('penOnly', S.penOnly); e.currentTarget.classList.toggle('on', S.penOnly); toast(S.penOnly ? 'Stylus only: finger touch now scrolls' : 'Finger drawing enabled'); });
  $('#pageSet').addEventListener('click', e => { if (popEl) closePop(); else pageSettings(e.currentTarget); });
  $('#exportBtn').addEventListener('click', e => exportMenu(e.currentTarget));
  $('#addPage').addEventListener('click', () => addPage());
  new ResizeObserver(() => { if (S.nb && S.view === 'editor' && S.fit) layoutCanvas(); }).observe($('#scroll'));

  window.addEventListener('keyup', e => { if (e.key === ' ' && S.space) { S.space = false; applyCursor(); } });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (S.view !== 'editor' || !S.nb) return;
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod) {
      const m = {
        z: () => (e.shiftKey ? redo() : undo()), y: redo, s: () => flush().then(() => toast('Saved')),
        a: () => { setTool('select'); setSel(page().objects.slice()); }, d: dupSel, c: () => { copySel(); return 'native'; },
        x: () => { copySel(); delSel(); }, '=': () => zoomBy(1.15), '+': () => zoomBy(1.15), '-': () => zoomBy(1 / 1.15), '0': fitWidth,
      }[k];
      if (m) { if (m() !== 'native') e.preventDefault(); }
      return;
    }
    if (k === 'delete' || k === 'backspace') { if (S.sel.length) { e.preventDefault(); delSel(); } return; }
    if (k === 'escape') { setSel([]); return; }
    if (k === ' ') { e.preventDefault(); if (!S.space) { S.space = true; applyCursor(); } return; }
    if (k === 'pagedown') { e.preventDefault(); goPage(S.pi + 1); return; }
    if (k === 'pageup') { e.preventDefault(); goPage(S.pi - 1); return; }
    if (k.startsWith('arrow') && S.sel.length) {
      e.preventDefault();
      const st = e.shiftKey ? 10 : 1, dx = k === 'arrowleft' ? -st : k === 'arrowright' ? st : 0, dy = k === 'arrowup' ? -st : k === 'arrowdown' ? st : 0;
      const m = new Map(S.sel.map(o => [o, moved(o, dx, dy)]));
      setObjects(page().objects.map(o => m.get(o) || o)); setSel(S.sel.map(o => m.get(o)));
      return;
    }
    const map = { p: 'pen', h: 'hl', e: 'eraser', v: 'select', s: 'shape', t: 'text', l: 'laser' };
    if (map[k]) setTool(map[k]);
  });
}

/* ====================================================================
   Boot
   ==================================================================== */
async function boot() {
  hydrate();
  applyTheme(LS.get('theme', 'light'));
  try { await DB.open(); } catch (e) { DB.broken = true; toast('Storage unavailable — notebooks will not be saved!', 5000); }
  try { S.notebooks = await DB.all(); } catch { S.notebooks = []; }
  if (!S.notebooks.length && !LS.get('welcomed', false)) {
    const w = makeWelcome(); S.notebooks.push(w); await DB.put(w); LS.set('welcomed', true);
  }
  loadTools(); buildToolbar(); bindEvents();
  setView('library'); renderLibrary(); tmUI();
  window.__inknest = { S, TM, buildPDF };      // handy for debugging / tests
}
boot();

})();
