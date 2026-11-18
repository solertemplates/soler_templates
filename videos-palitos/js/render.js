// Motor de dibujo: cada fotograma es una función pura del tiempo t (sirve para vista previa y exportación).
export const W = 1080, H = 1920, GY = 1390;
const TAU = Math.PI * 2;
const ROLES = ['A', 'B', 'C', 'D'];
const CHAR_COLORS = { A: '#e63946', B: '#1f6fd6', C: '#2a9d8f', D: '#f08c00' };
const LOOKS = {
  cenar: { B: 'hair' }, detalles: { B: 'hair' }, celular: { B: 'hair' }, sueter: { B: 'hair', C: 'kid' },
  abuela: { B: 'granny' }, mama: { B: 'hair' }, jugar: { C: 'kid' }, opinan: { C: 'hair' }, grupo: {}, foto: { B: 'hair' },
};
export const FONT = "'Fredoka', 'Baloo 2', 'Arial Rounded MT Bold', 'Arial Black', system-ui, sans-serif";

const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const backOut = t => { t = clamp(t, 0, 1); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ---------- Paleta (color / blanco y negro) ----------
let BW = false;
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const cache = new Map();
function C(hex) {
  if (!BW) return hex;
  const k = hex; if (cache.has(k)) return cache.get(k);
  const [r, g, b] = hexToRgb(hex); let l = 0.299 * r + 0.587 * g + 0.114 * b;
  l = 150 + (l / 255) * 105; // papel claro
  const v = Math.round(clamp(l, 0, 255)); const out = `rgb(${v},${v},${v})`; cache.set(k, out); return out;
}
const INK = () => (BW ? '#111' : '#2b2d42');

// ---------- utilidades de dibujo ----------
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(ctx, pts, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
}
function circle(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 4; ctx.stroke(); } }
function heartPath(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.1, y + s * 0.2, x - s * 0.55, y, x - s * 0.5, y - s * 0.3);
  ctx.bezierCurveTo(x - s * 0.45, y - s * 0.62, x - s * 0.05, y - s * 0.6, x, y - s * 0.28);
  ctx.bezierCurveTo(x + s * 0.05, y - s * 0.6, x + s * 0.45, y - s * 0.62, x + s * 0.5, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.55, y, x + s * 0.1, y + s * 0.2, x, y + s * 0.35); ctx.closePath();
}
function star(ctx, x, y, r, rot = 0) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5; const rad = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); }
function setFont(ctx, size, weight = 700) { ctx.font = `${weight} ${size}px ${FONT}`; }
function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean); const lines = []; let cur = [];
  for (const w of words) { const test = [...cur, w].join(' '); if (ctx.measureText(test).width > maxW && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); }
  if (cur.length) lines.push(cur); return lines;
}
function fitText(ctx, text, maxW, maxLines, size, minSize = 40, weight = 700) {
  let s = size, lines;
  for (; s >= minSize; s -= 4) { setFont(ctx, s, weight); lines = wrap(ctx, text, maxW); if (lines.length <= maxLines) break; }
  return { size: s, lines };
}

// ---------- ENTORNOS ----------
function sky(ctx, top, bottom) { const g = ctx.createLinearGradient(0, -200, 0, GY); g.addColorStop(0, C(top)); g.addColorStop(1, C(bottom)); ctx.fillStyle = g; ctx.fillRect(-600, -400, W + 1200, GY + 400); }
function floor(ctx, color, line2) { ctx.fillStyle = C(color); ctx.fillRect(-600, GY, W + 1200, H - GY + 600); if (line2) { ctx.fillStyle = C(line2); ctx.fillRect(-600, GY, W + 1200, 10); } }
function cloud(ctx, x, y, s) { ctx.fillStyle = BW ? '#fff' : '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.arc(x + 45 * s, y - 20 * s, 50 * s, 0, TAU); ctx.arc(x + 95 * s, y, 40 * s, 0, TAU); ctx.fill(); if (BW) { ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.stroke(); } }
function tree(ctx, x, y, s, g) {
  ctx.fillStyle = C('#8d5a3b'); ctx.fillRect(x - 14 * s, y - 160 * s, 28 * s, 160 * s);
  const sw = Math.sin(g * 1.5 + x) * 6 * s;
  ctx.fillStyle = C('#3fa34d'); ctx.beginPath(); ctx.arc(x + sw, y - 210 * s, 90 * s, 0, TAU); ctx.arc(x - 60 * s + sw, y - 160 * s, 60 * s, 0, TAU); ctx.arc(x + 60 * s + sw, y - 165 * s, 65 * s, 0, TAU); ctx.fill();
  if (BW) { ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.stroke(); }
}
function wallClock(ctx, x, y, r, g) {
  circle(ctx, x, y, r, C('#ffffff'), INK(), 6);
  const a1 = g * 0.6, a2 = g * 0.05;
  line(ctx, [[x, y], [x + Math.sin(a1) * r * 0.75, y - Math.cos(a1) * r * 0.75]], INK(), 4);
  line(ctx, [[x, y], [x + Math.sin(a2) * r * 0.5, y - Math.cos(a2) * r * 0.5]], INK(), 6);
}
function windowCity(ctx, x, y, w, h, g) {
  ctx.fillStyle = C('#bfe3ff'); rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
  for (let i = 0; i < 6; i++) { const bx = x + i * (w / 5) - 20, bh = 80 + hash(i + 3) * 160; ctx.fillStyle = C(i % 2 ? '#8aa1b9' : '#6c86a3'); ctx.fillRect(bx, y + h - bh, w / 6, bh); }
  cloud(ctx, x + ((g * 20) % (w + 200)) - 150, y + 60, 0.5);
  ctx.restore();
  ctx.strokeStyle = C('#ffffff'); ctx.lineWidth = 12; rr(ctx, x, y, w, h, 10); ctx.stroke();
  line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], C('#ffffff'), 10);
}
function plant(ctx, x, y, s, g) {
  ctx.fillStyle = C('#c96f4a'); ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 80 * s); ctx.lineTo(x + 40 * s, y - 80 * s); ctx.lineTo(x + 30 * s, y); ctx.lineTo(x - 30 * s, y); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45 + Math.sin(g * 2 + i) * 0.05; ctx.strokeStyle = C('#2f9e44'); ctx.lineWidth = 14 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 80 * s); ctx.quadraticCurveTo(x + Math.sin(a) * 60 * s, y - 150 * s, x + Math.sin(a) * 90 * s, y - (170 + 30 * Math.cos(i)) * s); ctx.stroke(); }
}

const ENV_DRAW = {
  oficina(ctx, g) {
    sky(ctx, '#eaf2fb', '#dbe7f3');
    ctx.fillStyle = C('#cfdceb'); ctx.fillRect(-600, GY - 360, W + 1200, 18);
    windowCity(ctx, 90, 380, 380, 420, g); windowCity(ctx, 620, 380, 380, 420, g + 3);
    wallClock(ctx, 540, 260, 70, g);
    floor(ctx, '#b8c7d6', '#9fb0c2');
    plant(ctx, 40, GY, 1, g); plant(ctx, 1040, GY, 0.9, g + 1);
    ctx.fillStyle = C('#ffd166'); rr(ctx, 860, 860, 140, 90, 8); ctx.fill(); // nota adhesiva
    ctx.fillStyle = C('#a0c4ff'); rr(ctx, 700, 880, 130, 80, 8); ctx.fill();
  },
  casa(ctx, g) {
    sky(ctx, '#fff1df', '#fde2c2');
    ctx.globalAlpha = 0.25; for (let i = -6; i < 16; i++) { ctx.fillStyle = C('#f4b183'); ctx.fillRect(i * 90, -400, 30, GY + 400); } ctx.globalAlpha = 1;
    ctx.fillStyle = C('#ffffff'); rr(ctx, 360, 360, 360, 260, 10); ctx.fill(); ctx.strokeStyle = C('#a0522d'); ctx.lineWidth = 16; ctx.stroke();
    ctx.fillStyle = C('#ffd166'); circle(ctx, 470, 470, 40, C('#ffd166')); ctx.fillStyle = C('#74c69d'); ctx.beginPath(); ctx.moveTo(380, 600); ctx.lineTo(500, 480); ctx.lineTo(600, 560); ctx.lineTo(700, 470); ctx.lineTo(700, 600); ctx.fill();
    // sofá
    ctx.fillStyle = C('#8e7dbe'); rr(ctx, 120, GY - 260, 840, 170, 40); ctx.fill(); rr(ctx, 80, GY - 170, 920, 150, 40); ctx.fill();
    ctx.fillStyle = C('#6c5ba7'); ctx.fillRect(130, GY - 30, 40, 30); ctx.fillRect(910, GY - 30, 40, 30);
    // lámpara
    line(ctx, [[1000, GY], [1000, GY - 560]], C('#555555'), 8); ctx.fillStyle = C('#ffe066'); ctx.beginPath(); ctx.moveTo(940, GY - 560); ctx.lineTo(1060, GY - 560); ctx.lineTo(1030, GY - 660); ctx.lineTo(970, GY - 660); ctx.fill();
    floor(ctx, '#c08552', '#a26b3c');
    for (let i = 0; i < 12; i++) line(ctx, [[i * 120 - 200, GY + 10], [i * 120 - 260, H + 200]], C('#a26b3c'), 4);
  },
  parque(ctx, g) {
    sky(ctx, '#7cc8ff', '#dff4ff');
    circle(ctx, 880, 230, 90, C('#ffd43b')); ctx.globalAlpha = 0.25; circle(ctx, 880, 230, 130 + Math.sin(g * 2) * 8, C('#ffd43b')); ctx.globalAlpha = 1;
    cloud(ctx, ((g * 25) % 1500) - 300, 260, 1); cloud(ctx, ((g * 15 + 700) % 1500) - 300, 480, 0.8);
    ctx.fillStyle = C('#94d82d'); ctx.beginPath(); ctx.ellipse(250, GY - 40, 600, 220, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = C('#69db7c'); ctx.beginPath(); ctx.ellipse(900, GY - 30, 550, 180, 0, Math.PI, TAU); ctx.fill();
    tree(ctx, 110, GY, 1.2, g); tree(ctx, 980, GY, 1.0, g + 2);
    floor(ctx, '#51cf66', '#40c057');
    ctx.fillStyle = C('#f8f0e3'); ctx.beginPath(); ctx.moveTo(300, H + 300); ctx.lineTo(480, GY); ctx.lineTo(600, GY); ctx.lineTo(780, H + 300); ctx.fill();
    for (let i = 0; i < 14; i++) { const fx = hash(i) * 1080, fy = GY + 40 + hash(i + 9) * 400; circle(ctx, fx, fy, 9, C(['#ff6b6b', '#fcc419', '#ffffff'][i % 3])); }
  },
  cafe(ctx, g) {
    sky(ctx, '#f7e7d0', '#efd5b3');
    ctx.fillStyle = C('#3d405b'); rr(ctx, 130, 250, 420, 300, 16); ctx.fill();
    ctx.fillStyle = '#ffffff'; setFont(ctx, 46, 700); ctx.textAlign = 'center'; ctx.fillText('MENU', 340, 320);
    ctx.fillStyle = BW ? '#ddd' : '#ffe8a3'; for (let i = 0; i < 4; i++) ctx.fillRect(180, 360 + i * 45, 220 + hash(i) * 80, 12);
    for (let i = 0; i < 3; i++) { const lx = 650 + i * 150, sw = Math.sin(g * 1.4 + i) * 10; line(ctx, [[lx, -100], [lx + sw, 300]], C('#555555'), 5); ctx.fillStyle = C('#f08c00'); ctx.beginPath(); ctx.arc(lx + sw, 340, 50, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = 0.2; circle(ctx, lx + sw, 360, 70, C('#fff3bf')); ctx.globalAlpha = 1; }
    ctx.fillStyle = C('#9c6644'); ctx.fillRect(-600, GY - 330, W + 1200, 30);
    ctx.fillStyle = C('#b08968'); ctx.fillRect(-600, GY - 300, W + 1200, 300);
    for (let i = 0; i < 6; i++) { const cx = 120 + i * 170; ctx.fillStyle = C('#ffffff'); rr(ctx, cx, GY - 400, 60, 70, 10); ctx.fill(); ctx.strokeStyle = C('#ffffff'); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx + 66, GY - 365, 18, -1.2, 1.2); ctx.stroke(); ctx.globalAlpha = 0.5; line(ctx, [[cx + 30, GY - 410], [cx + 30 + Math.sin(g * 3 + i) * 10, GY - 470]], C('#aaaaaa'), 5); ctx.globalAlpha = 1; }
    floor(ctx, '#7f5539', '#6f4518');
  },
  ciudad(ctx, g) {
    sky(ctx, '#89c2ff', '#ffe5ec');
    cloud(ctx, ((g * 20) % 1500) - 300, 220, 0.9);
    for (let i = 0; i < 9; i++) {
      const bx = -120 + i * 150, bh = 420 + hash(i * 3) * 420, col = ['#5c7cfa', '#748ffc', '#4dabf7', '#9775fa'][i % 4];
      ctx.fillStyle = C(col); ctx.fillRect(bx, GY - 120 - bh, 140, bh);
      ctx.fillStyle = C('#fff3bf');
      for (let r = 0; r < bh / 70 - 1; r++) for (let c = 0; c < 3; c++) if (hash(i * 50 + r * 7 + c) > 0.35) ctx.fillRect(bx + 18 + c * 40, GY - 120 - bh + 30 + r * 70, 24, 36);
    }
    ctx.fillStyle = C('#495057'); ctx.fillRect(-600, GY - 120, W + 1200, 120);
    for (let i = 0; i < 2; i++) { const cx = ((g * (220 + i * 120) + i * 600) % 1700) - 300, col = i ? '#ffd43b' : '#ff6b6b'; ctx.fillStyle = C(col); rr(ctx, cx, GY - 110, 200, 60, 20); ctx.fill(); rr(ctx, cx + 40, GY - 150, 110, 50, 16); ctx.fill(); circle(ctx, cx + 45, GY - 45, 20, C('#222222')); circle(ctx, cx + 155, GY - 45, 20, C('#222222')); }
    floor(ctx, '#ced4da', '#adb5bd');
    line(ctx, [[960, GY], [960, GY - 520]], C('#343a40'), 14); circle(ctx, 960, GY - 530, 30, C('#ffe066'));
  },
  playa(ctx, g) {
    sky(ctx, '#4dc9ff', '#fff0c9');
    circle(ctx, 800, 300, 100, C('#ffa94d'));
    cloud(ctx, ((g * 18) % 1500) - 300, 250, 0.8);
    ctx.fillStyle = C('#1c7ed6'); ctx.fillRect(-600, GY - 330, W + 1200, 250);
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = C('#a5d8ff'); ctx.lineWidth = 8; ctx.beginPath(); for (let x = -600; x < W + 600; x += 20) ctx.lineTo(x, GY - 290 + k * 70 + Math.sin(x / 60 + g * 2 + k) * 10); ctx.stroke(); }
    ctx.fillStyle = C('#ffe8a1'); ctx.fillRect(-600, GY - 90, W + 1200, 200);
    floor(ctx, '#ffd98e');
    line(ctx, [[120, GY], [160, GY - 520]], C('#8d5a3b'), 26);
    for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.6 + Math.sin(g * 1.3) * 0.05; ctx.strokeStyle = C('#2f9e44'); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(160, GY - 520); ctx.quadraticCurveTo(160 + Math.cos(a) * 120, GY - 600 + Math.sin(a) * 60, 160 + Math.cos(a) * 220, GY - 480 + Math.sin(a) * 120); ctx.stroke(); }
  },
  cocina(ctx, g) {
    sky(ctx, '#e7f5ff', '#e7f5ff');
    for (let y = 520; y < GY - 300; y += 60) for (let x = -600; x < W + 600; x += 60) { ctx.strokeStyle = C('#c5d8e6'); ctx.lineWidth = 3; ctx.strokeRect(x, y, 60, 60); }
    ctx.fillStyle = C('#ffffff'); for (let i = 0; i < 3; i++) { rr(ctx, 90 + i * 220, 160, 200, 300, 10); ctx.fill(); ctx.strokeStyle = C('#adb5bd'); ctx.lineWidth = 5; ctx.stroke(); circle(ctx, 270 + i * 220, 310, 10, C('#868e96')); }
    ctx.fillStyle = C('#dee2e6'); rr(ctx, 790, 300, 230, GY - 300, 20); ctx.fill(); ctx.strokeStyle = C('#adb5bd'); ctx.lineWidth = 6; ctx.stroke(); line(ctx, [[790, 680], [1020, 680]], C('#adb5bd'), 6); line(ctx, [[820, 400], [820, 520]], C('#868e96'), 10);
    ctx.fillStyle = C('#f1f3f5'); ctx.fillRect(-600, GY - 330, 1390 + 600, 330); ctx.fillStyle = C('#495057'); ctx.fillRect(-600, GY - 350, 1390 + 600, 26);
    ctx.fillStyle = C('#343a40'); rr(ctx, 300, GY - 380, 240, 30, 6); ctx.fill();
    ctx.globalAlpha = 0.4; for (let i = 0; i < 3; i++) line(ctx, [[360 + i * 60, GY - 400], [360 + i * 60 + Math.sin(g * 3 + i) * 15, GY - 480]], C('#adb5bd'), 6); ctx.globalAlpha = 1;
    floor(ctx, '#ced4da', '#adb5bd');
  },
  vacio(ctx, g) {
    sky(ctx, '#fff8e7', '#ffe3e3');
    ctx.globalAlpha = 0.18; for (let i = 0; i < 40; i++) { const x = (hash(i) * 1400 + g * 20) % 1400 - 160, y = hash(i + 50) * 1500; circle(ctx, x, y, 8 + hash(i + 2) * 14, C('#ff8787')); } ctx.globalAlpha = 1;
    floor(ctx, '#ffe3e3', '#ffc9c9');
  },
  caminos(ctx, g, beat) {
    sky(ctx, '#9bd4ff', '#fff4d6');
    // lado izquierdo: nublado; lado derecho: soleado
    ctx.globalAlpha = 0.85; ctx.fillStyle = C('#868e96'); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-40 + i * 110 + Math.sin(g + i) * 10, 360 + (i % 2) * 40, 90, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) { const ry = ((g * 500 + i * 120) % 500) + 430; line(ctx, [[20 + i * 45, ry], [10 + i * 45, ry + 40]], C('#4dabf7'), 4); }
    circle(ctx, 880, 330, 95, C('#ffd43b')); ctx.globalAlpha = 0.3; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + g * 0.3; line(ctx, [[880 + Math.cos(a) * 120, 330 + Math.sin(a) * 120], [880 + Math.cos(a) * 170, 330 + Math.sin(a) * 170]], C('#fab005'), 10); } ctx.globalAlpha = 1;
    ctx.fillStyle = C('#8ce99a'); ctx.fillRect(-600, 800, W + 1200, 600);
    ctx.fillStyle = C('#ced4da'); ctx.beginPath(); ctx.moveTo(-600, 820); ctx.lineTo(W + 600, 820); ctx.lineTo(W + 600, 860); ctx.lineTo(-600, 860); ctx.fill();
    floor(ctx, '#69db7c');
    // dos caminos desde abajo al horizonte
    const road = (dir, col) => { ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(540 - 170, H + 300); ctx.lineTo(540 + 170, H + 300); ctx.lineTo(540 + dir * 120 + 30, GY - 40); ctx.lineTo(540 + dir * 470 + 35, 830); ctx.lineTo(540 + dir * 470 - 35, 830); ctx.lineTo(540 + dir * 120 - 30, GY - 40); ctx.fill(); };
    road(-1, '#adb5bd'); road(1, '#ffe8a1');
    tree(ctx, 960, 880, 0.6, g); ctx.fillStyle = C('#495057'); ctx.fillRect(30, 760, 30, 70);
    // poste con letreros
    const signs = (beat && beat.sign ? beat.sign.replace('sign:', '').split('|') : []);
    if (signs.length) drawSigns(ctx, signs, beat._lang, g, beat.side || 0);
  },
};

function drawSigns(ctx, s, lang, g, side) {
  const l = lang === 'en' && s.length >= 4 ? [s[2], s[3]] : [s[0], s[1]];
  const px = 540, top = 520;
  line(ctx, [[px, GY - 30], [px, top]], C('#8d5a3b'), 22);
  const sign = (dir, text, y, col, active) => {
    const sw = Math.sin(g * 2 + dir) * 0.03 + (active ? Math.sin(g * 8) * 0.04 : 0);
    ctx.save(); ctx.translate(px, y); ctx.rotate(sw);
    const sc = active ? 1.12 : 1; ctx.scale(sc, sc);
    setFont(ctx, 46, 700); const tw = Math.max(240, ctx.measureText(text).width + 90);
    ctx.fillStyle = C(col); ctx.beginPath();
    if (dir < 0) { ctx.moveTo(10, -50); ctx.lineTo(-tw + 40, -50); ctx.lineTo(-tw, 0); ctx.lineTo(-tw + 40, 50); ctx.lineTo(10, 50); }
    else { ctx.moveTo(-10, -50); ctx.lineTo(tw - 40, -50); ctx.lineTo(tw, 0); ctx.lineTo(tw - 40, 50); ctx.lineTo(-10, 50); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK(); ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = BW ? '#111' : '#ffffff'; if (!BW && col === '#ffd43b') ctx.fillStyle = '#2b2d42';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, dir * (tw / 2 - 10), 3);
    ctx.restore();
  };
  sign(-1, l[0], top + 70, '#868e96', side < 0);
  sign(1, l[1], top + 190, '#ffd43b', side > 0);
}

// ---------- MUÑECO ----------
const SK = { thigh: 96, shin: 96, torso: 165, neck: 16, head: 46, upper: 82, fore: 78 };

function pose(action, t, g, seed) {
  const P = { lean: 0, tilt: 0, y: 0, rot: 0, arms: [{ a: 0.28, e: 0.15 }, { a: 0.28, e: 0.15 }], legs: [{ a: -0.12, k: 0.05 }, { a: 0.12, k: 0.05 }], emo: 'neutral', talk: false, fx: null, hand: null, shake: 0 };
  const bob = Math.sin(g * 3.2 + seed) * 0.03;
  P.arms[0].a += bob; P.arms[1].a -= bob; P.y = Math.sin(g * 3.2 + seed) * 3;
  const s = (f, a = 1, ph = 0) => Math.sin(t * f + ph + seed) * a;
  switch (action) {
    case 'talk': P.arms[1] = { a: 0.9 + s(5, 0.3), e: 0.9 + s(6, 0.4) }; P.arms[0] = { a: 0.4 + s(4, 0.15, 1), e: 0.4 }; P.emo = 'happy'; P.talk = true; P.tilt = s(3, 0.06); break;
    case 'walk': case 'run': {
      const sp = action === 'run' ? 15 : 9, amp = action === 'run' ? 0.75 : 0.5;
      P.legs = [{ a: s(sp, amp), k: Math.max(0, s(sp, 0.7, 1.4)) }, { a: -s(sp, amp), k: Math.max(0, -s(sp, 0.7, 1.4)) }];
      P.arms = [{ a: 0.35 + s(sp, 0.5), e: 0.5 }, { a: 0.35 - s(sp, 0.5), e: 0.5 }];
      P.y = -Math.abs(Math.sin(t * sp + seed)) * (action === 'run' ? 28 : 12); P.lean = action === 'run' ? 0.28 : 0.08; P.emo = 'happy';
      if (action === 'run') { P.fx = 'dust'; P.emo = 'shock'; }
      break;
    }
    case 'wave': P.arms[1] = { a: 2.6, e: 0.35 + s(11, 0.5) }; P.emo = 'happy'; break;
    case 'hug': P.arms = [{ a: 1.45, e: 0.9 }, { a: 1.45, e: 0.9 }]; P.emo = 'love'; P.fx = 'hearts'; P.y += s(4, 4); break;
    case 'cheer': P.arms = [{ a: 2.6 + s(9, 0.15), e: 0.1 }, { a: 2.6 - s(9, 0.15), e: 0.1 }]; P.y = -Math.abs(Math.sin(t * 7 + seed)) * 45; P.emo = 'laugh'; P.fx = 'sparkle'; break;
    case 'jump': { const j = Math.abs(Math.sin(t * 6 + seed)); P.y = -j * 80; P.legs = [{ a: 0.3, k: j }, { a: -0.1, k: j * 1.2 }]; P.arms = [{ a: 2.4, e: 0.2 }, { a: 2.4, e: 0.2 }]; P.emo = 'laugh'; break; }
    case 'facepalm': P.arms[1] = { a: 0.45, e: 2.55 }; P.tilt = 0.18 + s(2, 0.04); P.lean = 0.08; P.emo = 'tired'; break;
    case 'shrug': { const u = (Math.sin(t * 4 + seed) + 1) / 2; P.arms = [{ a: 0.75, e: 1.25 + u * 0.3 }, { a: 0.75, e: 1.25 + u * 0.3 }]; P.tilt = 0.15 * Math.sin(t * 2); P.emo = 'meh'; P.y -= u * 6; break; }
    case 'sad': P.lean = 0.14; P.tilt = 0.32; P.arms = [{ a: 0.08, e: 0.05 }, { a: 0.08, e: 0.05 }]; P.emo = 'sad'; P.fx = 'cloud'; break;
    case 'cry': P.arms = [{ a: 0.5, e: 2.35 + s(14, 0.08) }, { a: 0.5, e: 2.35 - s(14, 0.08) }]; P.tilt = 0.12; P.emo = 'cry'; P.fx = 'tears'; P.y += s(14, 2); break;
    case 'angry': P.arms = [{ a: 0.45, e: -0.3 }, { a: 0.45, e: -0.3 }]; P.emo = 'angry'; P.fx = 'steam'; P.shake = 4; P.lean = 0.06; break;
    case 'laugh': P.lean = -0.12 + s(10, 0.06); P.arms = [{ a: 0.5, e: -1.3 }, { a: 0.5, e: -1.3 }]; P.emo = 'laugh'; P.fx = 'haha'; P.y += s(12, 4); break;
    case 'think': P.arms[1] = { a: 0.38, e: 2.45 }; P.arms[0] = { a: 0.55, e: -1.2 }; P.tilt = -0.12 + s(1.5, 0.05); P.emo = 'think'; P.fx = 'question'; break;
    case 'type': P.sit = true; P.arms = [{ a: 0.75, e: 0.55 + s(22, 0.12) }, { a: 0.75, e: 0.55 + s(22, 0.12, 2) }]; P.tilt = 0.15; P.emo = 'neutral'; P.desk = true; break;
    case 'phone': P.arms[1] = { a: 0.3, e: 2.05 }; P.arms[0] = { a: 0.2, e: 0.1 }; P.tilt = 0.22; P.hand = 'phone'; P.emo = 'neutral'; P.fx = 'notif'; break;
    case 'sleep': P.sit = true; P.tilt = 0.5 + s(1.6, 0.05); P.arms = [{ a: 0.2, e: 0.3 }, { a: 0.2, e: 0.3 }]; P.emo = 'sleep'; P.fx = 'zzz'; break;
    case 'fall': { const k = easeOut(t / 0.55); P.rot = k * 1.45; P.emo = t < 0.6 ? 'shock' : 'dizzy'; P.arms = [{ a: 2.2, e: 0.5 }, { a: 2.0, e: 0.3 }]; P.fx = t > 0.6 ? 'stars' : null; break; }
    case 'point': P.front = { a: 1.45, e: 0.05 }; P.emo = 'happy'; P.talk = true; break;
    case 'sit': P.sit = true; P.arms = [{ a: 0.3, e: 0.6 }, { a: 0.3, e: 0.6 }]; P.emo = 'neutral'; break;
    case 'give': P.front = { a: 1.3, e: 0.2 }; P.emo = 'happy'; P.hand = 'gift'; break;
    case 'dance': { const d = Math.sin(t * 8 + seed); P.arms = [{ a: 1.6 + d * 0.9, e: 0.6 }, { a: 1.6 - d * 0.9, e: 0.6 }]; P.lean = d * 0.12; P.legs = [{ a: -0.2 + d * 0.15, k: Math.max(0, d) * 0.5 }, { a: 0.2 + d * 0.15, k: Math.max(0, -d) * 0.5 }]; P.y = -Math.abs(d) * 18; P.emo = 'laugh'; P.fx = 'notes'; break; }
    case 'wait': P.arms[0] = { a: 0.95, e: 1.75 }; P.legs[1] = { a: 0.25, k: 0.25 + Math.max(0, s(10, 0.25)) }; P.emo = 'meh'; P.tilt = 0.1; P.fx = 'tap'; break;
    case 'shock': { const p0 = easeOut(t / 0.2); P.arms = [{ a: 2.2 + s(30, 0.05), e: 0.4 }, { a: 2.2 - s(30, 0.05), e: 0.4 }]; P.y = -Math.sin(Math.min(1, t / 0.35) * Math.PI) * 50 * p0; P.emo = 'shock'; P.fx = 'bang'; P.shake = 3; P.lean = -0.08; break; }
    case 'love': P.arms = [{ a: 0.45, e: -1.9 }, { a: 0.45, e: -1.9 }]; P.emo = 'love'; P.fx = 'hearts'; P.tilt = s(2, 0.1); break;
    case 'tired': P.lean = 0.22; P.tilt = 0.3; P.arms = [{ a: 0.05 + s(3, 0.05), e: 0 }, { a: 0.05 - s(3, 0.05), e: 0 }]; P.legs = [{ a: -0.15, k: 0.25 }, { a: 0.15, k: 0.25 }]; P.emo = 'tired'; P.fx = 'sweat'; break;
    case 'strong': P.arms = [{ a: 1.55, e: 1.9 + s(6, 0.12) }, { a: 1.55, e: 1.9 - s(6, 0.12) }]; P.emo = 'happy'; P.fx = 'sparkle'; P.legs = [{ a: -0.25, k: 0 }, { a: 0.25, k: 0 }]; break;
    case 'lift': P.arms = [{ a: 2.85, e: 0.1 }, { a: 2.85, e: 0.1 }]; P.legs = [{ a: -0.25, k: 0.35 + s(6, 0.1) }, { a: 0.25, k: 0.35 + s(6, 0.1) }]; P.emo = 'tired'; P.hand = 'boxup'; P.fx = 'sweat'; P.shake = 1.5; break;
    default: P.emo = 'happy';
  }
  if (P.sit) { P.legs = [{ a: 1.5, k: 1.5 }, { a: 1.35, k: 1.5 }]; }
  return P;
}

function drawFace(ctx, hx, hy, r, f, emo, mouthOpen, g, seed, color) {
  const ex = f * 12, ink = BW ? '#111' : '#2b2d42';
  const blink = ((g + seed * 1.7) % 3.6) < 0.12;
  const eyeY = hy - 8, l = hx + ex - 15, rgt = hx + ex + 15;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const dotEyes = (rad = 6) => { if (blink) { line(ctx, [[l - 6, eyeY], [l + 6, eyeY]], ink, 4); line(ctx, [[rgt - 6, eyeY], [rgt + 6, eyeY]], ink, 4); } else { circle(ctx, l, eyeY, rad, ink); circle(ctx, rgt, eyeY, rad, ink); } };
  const mouth = (w, curve, y = hy + 16) => { ctx.beginPath(); ctx.moveTo(hx + ex - w, y); ctx.quadraticCurveTo(hx + ex, y + curve, hx + ex + w, y); ctx.stroke(); };
  switch (emo) {
    case 'happy': dotEyes(); if (mouthOpen > 0.2) { ctx.beginPath(); ctx.ellipse(hx + ex, hy + 18, 11, 4 + mouthOpen * 9, 0, 0, TAU); ctx.fill(); } else mouth(14, 12); break;
    case 'laugh': line(ctx, [[l - 8, eyeY + 3], [l, eyeY - 5], [l + 8, eyeY + 3]], ink, 4); line(ctx, [[rgt - 8, eyeY + 3], [rgt, eyeY - 5], [rgt + 8, eyeY + 3]], ink, 4);
      ctx.beginPath(); ctx.moveTo(hx + ex - 17, hy + 10); ctx.quadraticCurveTo(hx + ex, hy + 42, hx + ex + 17, hy + 10); ctx.closePath(); ctx.fill(); break;
    case 'sad': case 'cry': dotEyes(5); line(ctx, [[l - 9, eyeY - 14], [l + 6, eyeY - 19]], ink, 4); line(ctx, [[rgt + 9, eyeY - 14], [rgt - 6, eyeY - 19]], ink, 4); mouth(12, -10, hy + 24); break;
    case 'angry': dotEyes(5); line(ctx, [[l - 10, eyeY - 18], [l + 7, eyeY - 10]], ink, 5); line(ctx, [[rgt + 10, eyeY - 18], [rgt - 7, eyeY - 10]], ink, 5); mouth(13, -6, hy + 22); break;
    case 'shock': circle(ctx, l, eyeY, 9, '#fff', ink, 4); circle(ctx, rgt, eyeY, 9, '#fff', ink, 4); circle(ctx, l, eyeY, 4, ink); circle(ctx, rgt, eyeY, 4, ink); ctx.beginPath(); ctx.ellipse(hx + ex, hy + 22, 10, 13, 0, 0, TAU); ctx.fill(); break;
    case 'love': ctx.fillStyle = BW ? '#111' : '#e03131'; heartPath(ctx, l, eyeY, 20); ctx.fill(); heartPath(ctx, rgt, eyeY, 20); ctx.fill(); ctx.strokeStyle = ink; mouth(13, 12); break;
    case 'tired': line(ctx, [[l - 8, eyeY], [l + 8, eyeY]], ink, 4); line(ctx, [[rgt - 8, eyeY], [rgt + 8, eyeY]], ink, 4); ctx.beginPath(); ctx.moveTo(hx + ex - 12, hy + 22); for (let i = 0; i <= 4; i++) ctx.lineTo(hx + ex - 12 + i * 6, hy + 22 + (i % 2 ? -4 : 3)); ctx.stroke(); break;
    case 'sleep': ctx.beginPath(); ctx.arc(l, eyeY - 2, 7, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(rgt, eyeY - 2, 7, 0.2, Math.PI - 0.2); ctx.stroke(); circle(ctx, hx + ex, hy + 22, 5, null, ink, 3); break;
    case 'think': circle(ctx, l + 3, eyeY - 4, 5, ink); circle(ctx, rgt + 3, eyeY - 4, 5, ink); line(ctx, [[hx + ex - 8, hy + 20], [hx + ex + 10, hy + 16]], ink, 4); break;
    case 'meh': dotEyes(5); line(ctx, [[hx + ex - 11, hy + 20], [hx + ex + 11, hy + 20]], ink, 4); break;
    case 'dizzy': ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('@', l, eyeY); ctx.fillText('@', rgt, eyeY); mouth(10, 6); break;
    default: dotEyes(); if (mouthOpen > 0.2) { ctx.beginPath(); ctx.ellipse(hx + ex, hy + 18, 10, 3 + mouthOpen * 8, 0, 0, TAU); ctx.fill(); } else line(ctx, [[hx + ex - 9, hy + 18], [hx + ex + 9, hy + 18]], ink, 4);
  }
  if (!BW && (emo === 'happy' || emo === 'love' || emo === 'laugh')) { ctx.globalAlpha = 0.35; circle(ctx, l - 10, hy + 10, 8, '#ff8fa3'); circle(ctx, rgt + 10, hy + 10, 8, '#ff8fa3'); ctx.globalAlpha = 1; }
  if (!BW && emo === 'angry') { ctx.globalAlpha = 0.25; circle(ctx, hx, hy, r - 4, '#ff6b6b'); ctx.globalAlpha = 1; }
}

function drawHandProp(ctx, type, x, y, g, color) {
  if (type === 'phone') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2); ctx.fillStyle = '#212529'; rr(ctx, -18, -32, 36, 62, 8); ctx.fill(); ctx.fillStyle = BW ? '#ddd' : '#74c0fc'; rr(ctx, -13, -26, 26, 48, 4); ctx.fill(); ctx.restore(); }
  if (type === 'gift') { ctx.fillStyle = C('#e64980'); rr(ctx, x - 35, y - 60, 70, 60, 6); ctx.fill(); ctx.fillStyle = C('#ffd43b'); ctx.fillRect(x - 7, y - 60, 14, 60); ctx.fillRect(x - 35, y - 37, 70, 12); }
  if (type === 'boxup') { ctx.fillStyle = C('#d4a373'); rr(ctx, x - 90, y - 120, 180, 120, 8); ctx.fill(); ctx.strokeStyle = C('#9c6644'); ctx.lineWidth = 5; ctx.stroke(); line(ctx, [[x - 90, y - 60], [x + 90, y - 60]], C('#9c6644'), 4); }
  if (type === 'coffee') { ctx.fillStyle = C('#ffffff'); rr(ctx, x - 20, y - 45, 40, 48, 8); ctx.fill(); ctx.strokeStyle = INK(); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = C('#9c6644'); ctx.fillRect(x - 20, y - 30, 40, 10); }
}

function drawFigure(ctx, ch, P, g) {
  const f = ch.f, color = BW ? '#111' : ch.color, lw = ch.kid ? 11 : 14;
  ctx.save();
  const sc = ch.kid ? 0.68 : 1;
  ctx.translate(ch.x + (P.shake ? Math.sin(g * 60) * P.shake : 0), GY);
  if (P.rot) ctx.rotate(-f * P.rot);
  ctx.scale(sc, sc);
  // sombra
  ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 4, 70, 14, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  // piernas
  const legs = P.legs.map(L => { const kx = f * Math.sin(L.a) * SK.thigh, ky = Math.cos(L.a) * SK.thigh, sa = L.a - L.k; return [[0, 0], [kx, ky], [kx + f * Math.sin(sa) * SK.shin, ky + Math.cos(sa) * SK.shin]]; });
  let maxY = Math.max(...legs.map(l => l[2][1]));
  if (P.sit) maxY = 96 + 20; // sentado en silla
  const hipY = -maxY + (P.y || 0);
  ctx.translate(0, hipY);
  if (P.sit) { ctx.fillStyle = C('#6c757d'); rr(ctx, -f * 70 - 10, 8, 120, 18, 6); ctx.fill(); ctx.fillRect(-f * 70 - 2 + (f > 0 ? 0 : 92), 20, 12, maxY - 20); ctx.fillRect(-f * 70 + 85 - (f > 0 ? 0 : 92), 20, 12, maxY - 20); ctx.fillRect(-f * 70 - 10 + (f < 0 ? 104 : 0), -120, 14, 130); }
  for (const l of legs) line(ctx, l, color, lw);
  // torso
  const lean = P.lean || 0;
  const neck = [f * Math.sin(lean) * SK.torso, -Math.cos(lean) * SK.torso];
  const sh = [f * Math.sin(lean) * (SK.torso - 20), -Math.cos(lean) * (SK.torso - 20)];
  line(ctx, [[0, 0], neck], color, lw);
  // cabeza
  const ha = lean + (P.tilt || 0);
  const hx = neck[0] + f * Math.sin(ha) * (SK.neck + SK.head), hy = neck[1] - Math.cos(ha) * (SK.neck + SK.head);
  // brazos
  const arms = P.arms.map((A, i) => {
    let side = i === 0 ? -1 : 1; let a = A.a, e = A.e;
    if (P.front && ((f > 0 && i === 1) || (f < 0 && i === 0))) { a = P.front.a; e = P.front.e; }
    const el = [sh[0] + side * Math.sin(a) * SK.upper, sh[1] + Math.cos(a) * SK.upper];
    const hd = [el[0] + side * Math.sin(a + e) * SK.fore, el[1] + Math.cos(a + e) * SK.fore];
    return [sh, el, hd];
  });
  // pelo largo detrás
  if (ch.look === 'hair' || ch.look === 'granny') { ctx.fillStyle = BW ? '#333' : (ch.look === 'granny' ? '#ced4da' : '#5c3d2e'); ctx.beginPath(); ctx.ellipse(hx - f * 6, hy + 10, SK.head + 10, SK.head + 18, 0, 0, TAU); ctx.fill(); }
  for (const a of arms) line(ctx, a, color, lw);
  // cabeza
  circle(ctx, hx, hy, SK.head, '#ffffff', color, lw - 2);
  if (ch.look === 'hair') { ctx.fillStyle = BW ? '#333' : '#5c3d2e'; ctx.beginPath(); ctx.arc(hx, hy - 6, SK.head + 4, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); circle(ctx, hx + f * 30, hy - 42, 12, BW ? '#666' : '#ff6b9a'); }
  if (ch.look === 'granny') { circle(ctx, hx - f * 4, hy - SK.head - 10, 22, BW ? '#bbb' : '#dee2e6', BW ? '#333' : '#adb5bd', 3); circle(ctx, hx + f * 12 - 15, hy - 6, 12, null, '#495057', 3); circle(ctx, hx + f * 12 + 15, hy - 6, 12, null, '#495057', 3); }
  if (ch.look === 'kid') { line(ctx, [[hx - 6, hy - SK.head], [hx + 4, hy - SK.head - 22], [hx + 14, hy - SK.head - 4]], color, 6); }
  drawFace(ctx, hx, hy, SK.head, f, P.emo, P.mouth || 0, g, ch.seed, color);
  // objetos en mano
  const fh = arms[f > 0 ? 1 : 0][2];
  if (P.hand === 'phone') drawHandProp(ctx, 'phone', arms[1][2][0], arms[1][2][1] - 10, g);
  if (P.hand === 'gift' && ch.giveProp) drawHandProp(ctx, ch.giveProp, fh[0] + f * 20, fh[1] + 10, g);
  if (P.hand === 'boxup') drawHandProp(ctx, 'boxup', (arms[0][2][0] + arms[1][2][0]) / 2, Math.min(arms[0][2][1], arms[1][2][1]) + 10, g);
  if (P.desk) { ctx.fillStyle = C('#8d6e63'); ctx.fillRect(f * 60, 0, f * 200, 16); ctx.fillRect(f * 230 - 8, 16, 16, maxY - 16); ctx.fillStyle = C('#343a40'); ctx.save(); ctx.translate(f * 150, 0); ctx.fillRect(-60, -8, 120, 8); ctx.beginPath(); ctx.moveTo(-50 * f, -8); ctx.lineTo(-62 * f, -90); ctx.lineTo(-8 * f, -90); ctx.lineTo(4 * f, -8); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // devolver posición de cabeza en mundo para efectos
  return { hx: ch.x + hx * sc, hy: GY + (hipY + hy) * sc };
}

// ---------- PARTÍCULAS / EFECTOS ----------
function drawFx(ctx, type, x, y, t, g, seed) {
  if (!type) return;
  const ink = INK();
  for (let k = 0; k < 4; k++) {
    const ph = ((t * 0.7 + k / 4 + hash(seed + k) * 0.1) % 1);
    const r = hash(seed * 10 + k);
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    switch (type) {
      case 'hearts': ctx.fillStyle = BW ? '#222' : '#ff4d6d'; heartPath(ctx, x + (r - 0.5) * 140 + Math.sin(ph * 8) * 15, y - 40 - ph * 200, 34 + r * 16); ctx.fill(); break;
      case 'sparkle': ctx.fillStyle = BW ? '#222' : '#fcc419'; star(ctx, x + (r - 0.5) * 220, y - 20 - ph * 140 + r * 60, 14 + 10 * Math.sin(ph * Math.PI), g * 3); ctx.fill(); break;
      case 'tears': if (k < 2) { ctx.fillStyle = BW ? '#555' : '#4dabf7'; const side = k ? 1 : -1; ctx.beginPath(); ctx.ellipse(x + side * (28 + ph * 30), y - 5 + ph * 120, 9, 14, 0, 0, TAU); ctx.fill(); } break;
      case 'sweat': if (k < 2) { ctx.fillStyle = BW ? '#777' : '#74c0fc'; ctx.beginPath(); ctx.ellipse(x + 55 + k * 12, y - 30 + ph * 50, 8, 13, 0, 0, TAU); ctx.fill(); } break;
      case 'zzz': ctx.fillStyle = ink; setFont(ctx, 36 + k * 8, 700); ctx.textAlign = 'center'; ctx.fillText('z', x + 50 + ph * 70, y - 60 - ph * 120); break;
      case 'question': if (k < 2) { ctx.fillStyle = ink; setFont(ctx, 70, 700); ctx.textAlign = 'center'; ctx.fillText('?', x + 60 + k * 45, y - 70 - Math.sin(ph * Math.PI) * 30); } break;
      case 'bang': if (k === 0) { ctx.globalAlpha = 1; ctx.fillStyle = BW ? '#111' : '#f03e3e'; setFont(ctx, 90, 700); ctx.textAlign = 'center'; ctx.fillText('!', x + 70, y - 70 + Math.sin(g * 20) * 4); } break;
      case 'steam': ctx.fillStyle = BW ? '#888' : '#adb5bd'; circle(ctx, x + (k % 2 ? 50 : -50) + Math.sin(ph * 6) * 10, y - 50 - ph * 90, 14 + ph * 16, ctx.fillStyle); if (k === 0) { ctx.globalAlpha = 1; ctx.strokeStyle = BW ? '#111' : '#e03131'; ctx.lineWidth = 6; const ax = x + 40, ay = y - 50; ctx.beginPath(); ctx.moveTo(ax - 12, ay - 4); ctx.lineTo(ax - 4, ay - 4); ctx.lineTo(ax - 4, ay - 12); ctx.moveTo(ax + 12, ay - 4); ctx.lineTo(ax + 4, ay - 4); ctx.lineTo(ax + 4, ay - 12); ctx.moveTo(ax - 12, ay + 4); ctx.lineTo(ax - 4, ay + 4); ctx.lineTo(ax - 4, ay + 12); ctx.moveTo(ax + 12, ay + 4); ctx.lineTo(ax + 4, ay + 4); ctx.lineTo(ax + 4, ay + 12); ctx.stroke(); } break;
      case 'haha': if (k < 3) { ctx.fillStyle = ink; setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.fillText(k % 2 ? 'JA' : 'JA!', x + (k - 1) * 90, y - 90 - ph * 100); } break;
      case 'notes': ctx.fillStyle = BW ? '#222' : '#7048e8'; setFont(ctx, 54, 700); ctx.textAlign = 'center'; ctx.fillText(k % 2 ? '♪' : '♫', x + (r - 0.5) * 200, y - 60 - ph * 150); break;
      case 'notif': if (k < 3) { const nx = x + 80 + k * 20, ny = y - 60 - ph * 150; ctx.fillStyle = BW ? '#222' : '#f03e3e'; circle(ctx, nx, ny, 20, ctx.fillStyle); ctx.fillStyle = '#fff'; setFont(ctx, 24, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(1 + ((seed + k) % 9)), nx, ny + 1); ctx.textBaseline = 'alphabetic'; } break;
      case 'dust': ctx.fillStyle = BW ? '#bbb' : '#ced4da'; circle(ctx, x - 80 - ph * 120, GY - 20 - ph * 30, 14 + ph * 20, ctx.fillStyle); break;
      case 'stars': ctx.fillStyle = BW ? '#222' : '#fcc419'; star(ctx, x + Math.cos(g * 5 + k * 1.6) * 60, y - 30 + Math.sin(g * 5 + k * 1.6) * 18, 14, g); ctx.fill(); break;
      case 'cloud': if (k === 0) { ctx.globalAlpha = 0.9; ctx.fillStyle = BW ? '#999' : '#868e96'; ctx.beginPath(); ctx.arc(x - 40, y - 150, 34, 0, TAU); ctx.arc(x, y - 165, 42, 0, TAU); ctx.arc(x + 42, y - 150, 32, 0, TAU); ctx.fill(); } line(ctx, [[x - 40 + k * 26, y - 110 + ph * 60], [x - 44 + k * 26, y - 90 + ph * 60]], BW ? '#555' : '#4dabf7', 4); break;
      case 'tap': break;
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- PROPS DE ESCENA (grandes, animados) ----------
function drawProp(ctx, prop, t, g, lang, beat) {
  if (!prop || prop === 'left' || prop === 'right' || prop === 'cta' || prop.startsWith('sign:')) return;
  const [name, ...rest] = prop.split(':'); const arg = rest.join(':');
  const pin = backOut(t / 0.45), x = 540, y = 600 + Math.sin(g * 2.4) * 14;
  ctx.save(); ctx.translate(x, y); ctx.scale(pin, pin); ctx.rotate(Math.sin(g * 1.8) * 0.05);
  const ink = INK();
  const badge = (r, col) => { ctx.globalAlpha = 0.9; circle(ctx, 0, 0, r, BW ? '#fff' : col, ink, 8); ctx.globalAlpha = 1; };
  switch (name) {
    case 'clock': {
      badge(150, '#ffffff');
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, [[Math.sin(a) * 120, -Math.cos(a) * 120], [Math.sin(a) * 135, -Math.cos(a) * 135]], ink, 6); }
      let hh = 0, mm = 0; if (arg) { const m = arg.match(/(\d+):(\d+)/); if (m) { hh = +m[1]; mm = +m[2]; } }
      const spin = arg ? 0 : g * 4;
      const am = (mm / 60) * TAU + spin * 3 + (1 - easeOut(t / 0.6)) * -TAU, ah = ((hh % 12) / 12 + mm / 720) * TAU + spin;
      line(ctx, [[0, 0], [Math.sin(am) * 105, -Math.cos(am) * 105]], ink, 9);
      line(ctx, [[0, 0], [Math.sin(ah) * 70, -Math.cos(ah) * 70]], BW ? '#111' : '#e63946', 13);
      circle(ctx, 0, 0, 12, ink);
      if (arg) { setFont(ctx, 64, 700); ctx.textAlign = 'center'; ctx.fillStyle = BW ? '#111' : '#e63946'; rr(ctx, -110, 165, 220, 84, 20); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(arg, 0, 230); }
      break;
    }
    case 'money': ctx.restore(); ctx.save();
      for (let i = 0; i < 9; i++) { const ph = (t * 0.6 + i / 9) % 1, bx = 100 + hash(i) * 880, by = 150 + ph * 1100; ctx.save(); ctx.translate(bx + Math.sin(ph * 10 + i) * 40, by); ctx.rotate(Math.sin(ph * 8 + i) * 0.8); ctx.fillStyle = C('#69db7c'); rr(ctx, -55, -28, 110, 56, 6); ctx.fill(); ctx.strokeStyle = C('#2b8a3e'); ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = C('#2b8a3e'); setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2); ctx.restore(); }
      ctx.textBaseline = 'alphabetic'; break;
    case 'pizza': badge(140, '#ffe8cc'); ctx.fillStyle = C('#ffa94d'); ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(-95, -70); ctx.quadraticCurveTo(0, -120, 95, -70); ctx.closePath(); ctx.fill(); ctx.fillStyle = C('#ffd43b'); ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(-75, -50); ctx.quadraticCurveTo(0, -90, 75, -50); ctx.closePath(); ctx.fill(); for (const [px, py] of [[-25, -30], [25, -20], [0, 30]]) circle(ctx, px, py, 16, C('#e03131')); break;
    case 'heart': ctx.fillStyle = BW ? '#222' : '#ff4d6d'; const hs = 1 + Math.sin(g * 8) * 0.06; ctx.scale(hs, hs); heartPath(ctx, 0, 0, 260); ctx.fill(); break;
    case 'gift': ctx.fillStyle = C('#e64980'); rr(ctx, -110, -70, 220, 170, 14); ctx.fill(); ctx.fillStyle = C('#f783ac'); rr(ctx, -125, -110, 250, 50, 12); ctx.fill(); ctx.fillStyle = C('#ffd43b'); ctx.fillRect(-18, -110, 36, 210); ctx.beginPath(); ctx.ellipse(-40, -130, 40, 22, -0.4, 0, TAU); ctx.ellipse(40, -130, 40, 22, 0.4, 0, TAU); ctx.fill(); break;
    case 'box': ctx.fillStyle = C('#d4a373'); rr(ctx, -130, -100, 260, 200, 10); ctx.fill(); ctx.strokeStyle = C('#9c6644'); ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = C('#ffffff'); rr(ctx, -80, -30, 160, 60, 8); ctx.fill(); ctx.fillStyle = C('#9c6644'); setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.fillText(lang === 'es' ? 'ABIERTO' : 'OPEN', 0, 14); break;
    case 'chart_up': case 'chart_down': {
      const up = name === 'chart_up'; ctx.fillStyle = C('#ffffff'); rr(ctx, -170, -140, 340, 260, 20); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke();
      const prog = easeOut(t / 1.2); const pts = []; for (let i = 0; i <= 5; i++) { const px = -130 + i * 52; const v = up ? i / 5 : 1 - i / 5; pts.push([px, 80 - v * 170 + Math.sin(i * 2.1) * 18]); }
      const n = Math.max(2, Math.ceil(prog * pts.length)); line(ctx, pts.slice(0, n), BW ? '#111' : (up ? '#2f9e44' : '#e03131'), 14);
      const lp = pts[n - 1]; ctx.fillStyle = BW ? '#111' : (up ? '#2f9e44' : '#e03131'); ctx.beginPath(); ctx.arc(lp[0], lp[1], 14, 0, TAU); ctx.fill(); break;
    }
    case 'trophy': ctx.fillStyle = C('#fcc419'); ctx.beginPath(); ctx.moveTo(-100, -120); ctx.lineTo(100, -120); ctx.quadraticCurveTo(100, 40, 0, 50); ctx.quadraticCurveTo(-100, 40, -100, -120); ctx.fill(); ctx.strokeStyle = C('#fcc419'); ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(-100, -60, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(100, -60, 40, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); ctx.fillStyle = C('#e67700'); ctx.fillRect(-20, 50, 40, 60); rr(ctx, -80, 105, 160, 40, 8); ctx.fill(); ctx.fillStyle = '#fff'; star(ctx, 0, -50, 40, 0); ctx.fill(); break;
    case 'calendar': { ctx.fillStyle = C('#ffffff'); rr(ctx, -140, -130, 280, 270, 20); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = BW ? '#111' : '#e03131'; rr(ctx, -140, -130, 280, 70, [20, 20, 0, 0]); ctx.fill(); const day = 1 + Math.floor(t * 6) % 30; ctx.fillStyle = ink; setFont(ctx, 120, 700); ctx.textAlign = 'center'; ctx.fillText(String(day), 0, 100); break; }
    case 'coffee': ctx.fillStyle = C('#ffffff'); rr(ctx, -90, -80, 180, 190, 26); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.stroke(); ctx.beginPath(); ctx.arc(100, 10, 40, -1.3, 1.3); ctx.stroke(); ctx.fillStyle = C('#9c6644'); ctx.fillRect(-84, -60, 168, 30); for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.6; line(ctx, [[-40 + i * 40, -100], [-40 + i * 40 + Math.sin(g * 3 + i) * 15, -170]], C('#adb5bd'), 8); } ctx.globalAlpha = 1; break;
    case 'bulb': { const on = Math.sin(g * 6) > -0.3; if (on && !BW) { ctx.globalAlpha = 0.3; circle(ctx, 0, -20, 170, '#fff3bf'); ctx.globalAlpha = 1; } circle(ctx, 0, -30, 100, BW ? (on ? '#fff' : '#ddd') : (on ? '#ffd43b' : '#ffe066'), ink, 7); ctx.fillStyle = C('#868e96'); rr(ctx, -45, 60, 90, 60, 10); ctx.fill(); line(ctx, [[-30, -10], [0, -50], [30, -10]], ink, 6); break; }
    case 'rocket': { const fl = Math.sin(g * 30) * 10; ctx.translate(0, -easeOut(t / 2) * 120); ctx.fillStyle = C('#ffffff'); ctx.beginPath(); ctx.moveTo(0, -170); ctx.quadraticCurveTo(80, -60, 55, 90); ctx.lineTo(-55, 90); ctx.quadraticCurveTo(-80, -60, 0, -170); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke(); circle(ctx, 0, -50, 30, C('#4dabf7'), ink, 6); ctx.fillStyle = C('#e03131'); ctx.beginPath(); ctx.moveTo(-55, 40); ctx.lineTo(-100, 110); ctx.lineTo(-50, 90); ctx.fill(); ctx.beginPath(); ctx.moveTo(55, 40); ctx.lineTo(100, 110); ctx.lineTo(50, 90); ctx.fill(); ctx.fillStyle = C('#ff922b'); ctx.beginPath(); ctx.moveTo(-35, 95); ctx.lineTo(0, 190 + fl); ctx.lineTo(35, 95); ctx.fill(); break; }
    case 'plant': { const gr = easeOut(t / 1.5); ctx.fillStyle = C('#c96f4a'); ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(90, 40); ctx.lineTo(70, 170); ctx.lineTo(-70, 170); ctx.fill(); line(ctx, [[0, 40], [0, 40 - gr * 220]], C('#2f9e44'), 14); for (let i = 0; i < 3; i++) { const ly = 20 - i * 70 * gr; if (gr > i * 0.3) { ctx.fillStyle = C('#51cf66'); ctx.beginPath(); ctx.ellipse((i % 2 ? 1 : -1) * 50, ly - 20, 50 * gr, 22 * gr, (i % 2 ? -0.5 : 0.5), 0, TAU); ctx.fill(); } } break; }
    case 'laptop': ctx.fillStyle = C('#343a40'); rr(ctx, -170, -130, 340, 220, 14); ctx.fill(); ctx.fillStyle = C('#74c0fc'); rr(ctx, -150, -112, 300, 184, 6); ctx.fill(); ctx.fillStyle = C('#495057'); rr(ctx, -200, 90, 400, 26, 8); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.fillStyle = C(i % 2 ? '#ffffff' : '#d0ebff'); rr(ctx, -130 + (i % 2) * 140, -95 + Math.floor(i / 2) * 85, 120, 70, 8); ctx.fill(); circle(ctx, -70 + (i % 2) * 140, -60 + Math.floor(i / 2) * 85, 18, C('#ffd8a8')); } break;
    case 'phone': ctx.fillStyle = '#212529'; rr(ctx, -95, -170, 190, 330, 30); ctx.fill(); ctx.fillStyle = BW ? '#eee' : '#e7f5ff'; rr(ctx, -80, -150, 160, 290, 18); ctx.fill(); for (let i = 0; i < 3; i++) { const ap = easeOut((t - i * 0.25) / 0.3); if (ap > 0) { ctx.fillStyle = C(i % 2 ? '#ffffff' : '#d3f9d8'); rr(ctx, -66 + (i % 2) * 30, -130 + i * 80, 105 * ap, 60, 14); ctx.fill(); } } ctx.fillStyle = BW ? '#111' : '#f03e3e'; circle(ctx, 85, -160, 34, ctx.fillStyle); ctx.fillStyle = '#fff'; setFont(ctx, 34, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(1 + Math.floor(t * 5) % 99), 85, -158); ctx.textBaseline = 'alphabetic'; break;
    case 'confetti': if (beat.kind !== 'after') break; ctx.restore(); ctx.save(); for (let i = 0; i < 40; i++) { const ph = (t * 0.5 + hash(i)) % 1; ctx.fillStyle = C(['#ff6b6b', '#fcc419', '#51cf66', '#4dabf7', '#cc5de8'][i % 5]); ctx.save(); ctx.translate(hash(i + 3) * 1080 + Math.sin(ph * 9 + i) * 40, ph * 1500 - 100); ctx.rotate(ph * 12 + i); ctx.fillRect(-10, -6, 20, 12); ctx.restore(); } break;
  }
  ctx.restore();
}

// ---------- CÁMARA ----------
function cameraFor(beat, bi, t, chars) {
  const n = beat.shots, sd = beat.dur / n; const si = Math.min(n - 1, Math.floor(t / sd)); const st = t - si * sd; const sp = st / sd;
  const h = hash(bi * 31 + si * 7 + 3);
  const mainX = chars.length ? chars[0].x : 540;
  let types = ['wide', 'medium', 'close', 'dutch', 'push'];
  let type = types[Math.floor(h * types.length)];
  if (beat.kind === 'hook') type = si === 0 ? 'push' : 'medium';
  if (beat.kind === 'twist') type = si === 0 ? 'crash' : 'close';
  if (beat.kind === 'reflect') type = 'slow';
  if (beat.kind === 'cta') type = 'cta';
  if (beat.env === 'caminos' && beat.kind !== 'reflect' && beat.kind !== 'cta') type = beat.side ? 'side' : 'wide';
  const focusChar = chars[Math.floor(hash(bi * 13 + si) * chars.length)] || { x: 540 };
  let z, fx, fy, rot = 0;
  switch (type) {
    case 'wide': z = lerp(1.0, 1.1, sp); fx = 540; fy = 1080; break;
    case 'medium': z = lerp(1.25, 1.4, sp); fx = lerp(540, chars.reduce((s, c) => s + c.x, 0) / Math.max(1, chars.length), 0.7); fy = 1080; break;
    case 'close': z = lerp(1.75, 1.95, sp); fx = focusChar.x; fy = GY - 330; break;
    case 'dutch': z = lerp(1.35, 1.5, sp); fx = 540; fy = 1060; rot = (h > 0.5 ? 1 : -1) * 0.06; break;
    case 'push': z = lerp(1.05, 1.6, easeInOut(sp)); fx = mainX; fy = GY - 300; break;
    case 'crash': z = lerp(2.2, 1.6, easeOut(sp * 2)); fx = mainX; fy = GY - 330; rot = Math.sin(t * 40) * 0.02 * (1 - sp); break;
    case 'slow': z = lerp(1.05, 1.22, t / beat.dur); fx = 540; fy = 1000; break;
    case 'cta': z = lerp(1.0, 1.06, t / beat.dur); fx = 540; fy = 960; break;
    case 'side': z = lerp(1.15, 1.3, sp); fx = 540 + beat.side * 170; fy = 1000; break;
  }
  // golpe de zoom al cambiar de plano
  const punch = Math.max(0, 1 - st / 0.18) * 0.07;
  z *= 1 + punch;
  // vibración según intensidad
  const lvl = beat.kind === 'rep' ? (beat.level || 0) : beat.kind === 'twist' ? 1.2 : 0;
  const shake = lvl * 6;
  const ox = Math.sin(t * 37 + bi) * shake + Math.sin(t * 0.9 + bi) * 10;
  const oy = Math.cos(t * 41 + bi) * shake + Math.cos(t * 0.7) * 6;
  rot += Math.sin(t * 0.6 + bi) * 0.012 + (beat.kind === 'rep' ? Math.sin(t * 3) * 0.01 * lvl : 0);
  return { z, fx: fx + ox, fy: fy + oy, rot, si, st };
}

// ---------- TEXTOS ----------
function wordWeights(words) { const w = words.map(x => x.length + 2); const tot = w.reduce((a, b) => a + b, 0); let acc = 0; return w.map(v => { acc += v; return acc / tot; }); }
function activeWord(beat, t, nWords) {
  const vt = t - (beat.voiceLead || 0); const vd = beat.voiceDur || Math.max(1, beat.dur - 0.5);
  return { p: clamp(vt / vd, 0, 1), started: vt >= 0 };
}

function drawCaption(ctx, beat, t, opts) {
  const text = beat.text; if (!text) return;
  const kind = beat.kind;
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (kind === 'hook') {
    const { size, lines } = fitText(ctx, text.toUpperCase(), 900, 4, 92, 54, 700);
    const lh = size * 1.12; const total = lines.length * lh; const y0 = 330 - total / 2;
    const words = lines.flat(); const cum = wordWeights(words); const { p } = activeWord(beat, t, words.length);
    const boxW = Math.min(1000, Math.max(...lines.map(l => ctx.measureText(l.join(' ')).width)) + 80);
    const pin = 0.85 + 0.15 * backOut(t / 0.3);
    ctx.save(); ctx.translate(540, y0 + total / 2); ctx.scale(pin, pin); ctx.rotate(-0.02 + Math.sin(t * 3) * 0.01); ctx.translate(-540, -(y0 + total / 2));
    ctx.fillStyle = BW ? '#ffffff' : '#ffd60a'; rr(ctx, 540 - boxW / 2, y0 - 30, boxW, total + 50, 30); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
    let wi = 0;
    lines.forEach((ln, li) => {
      const lw = ctx.measureText(ln.join(' ')).width; let x = 540 - lw / 2; const y = y0 + (li + 0.82) * lh;
      for (const w of ln) { const st = wi === 0 ? 0 : cum[wi - 1]; const active = p > 0 && p < 1 && st <= p && cum[wi] > p; const ww = ctx.measureText(w + ' ').width; ctx.fillStyle = active ? (BW ? '#666' : '#e63946') : '#111'; ctx.fillText(w, x, y); x += ww; wi++; }
    });
    ctx.restore(); ctx.restore(); return;
  }
  if (kind === 'reflect') {
    const fade = clamp(t / 0.5, 0, 1) * clamp((beat.dur - t) / 0.3, 0, 1);
    const { size, lines } = fitText(ctx, text, 900, 5, 84, 52, 700);
    const lh = size * 1.2; const total = lines.length * lh; const y0 = 640 - total / 2;
    const words = lines.flat(); const cum = wordWeights(words); const { p } = activeWord(beat, t, words.length);
    let wi = 0; ctx.globalAlpha = fade; ctx.lineJoin = 'round';
    lines.forEach((ln, li) => {
      const lw = ctx.measureText(ln.join(' ')).width; let x = 540 - lw / 2; const y = y0 + (li + 0.85) * lh + (1 - easeOut(t / 0.8)) * 30;
      for (const w of ln) { const lit = (wi === 0 ? 0 : cum[wi - 1]) <= p; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 12; ctx.strokeText(w, x, y); ctx.fillStyle = lit ? (BW ? '#ffffff' : '#ffe8a3') : 'rgba(255,255,255,0.55)'; ctx.fillText(w, x, y); x += ctx.measureText(w + ' ').width; wi++; }
    });
    ctx.restore(); return;
  }
  // subtítulo normal (grande, palabra activa resaltada)
  const yC = kind === 'cta' ? 1180 : 1530;
  const { size, lines } = fitText(ctx, text, 920, 3, kind === 'twist' ? 84 : 76, 48, 700);
  const lh = size * 1.18; const total = lines.length * lh; const y0 = yC - total / 2;
  const words = lines.flat(); const cum = wordWeights(words); const { p, started } = activeWord(beat, t, words.length);
  let cur = cum.findIndex(c => c >= p); if (!started) cur = -1;
  const pin = kind === 'twist' ? backOut((t - (beat.voiceLead || 0)) / 0.3) : backOut(t / 0.25);
  ctx.save(); ctx.translate(540, yC); ctx.scale(pin, pin); if (kind === 'twist') ctx.rotate(Math.sin(t * 30) * 0.01 * Math.max(0, 1 - t)); ctx.translate(-540, -yC);
  let wi = 0; ctx.lineJoin = 'round';
  lines.forEach((ln, li) => {
    const spc = ctx.measureText(' ').width * 1.35 + 4; const lw = ln.reduce((a, w) => a + ctx.measureText(w).width, 0) + spc * (ln.length - 1); let x = 540 - lw / 2; const y = y0 + (li + 0.82) * lh;
    for (const w of ln) {
      const ww = ctx.measureText(w).width, sw = ctx.measureText(' ').width * 1.35 + 4; const active = wi === cur;
      if (active && BW) { ctx.fillStyle = '#111'; rr(ctx, x - 10, y - size * 0.86, ww + 20, size * 1.08, 14); ctx.fill(); }
      ctx.save(); if (active) { ctx.translate(x + ww / 2, y - size / 3); ctx.scale(1.06, 1.06); ctx.translate(-(x + ww / 2), -(y - size / 3)); }
      ctx.strokeStyle = '#111'; ctx.lineWidth = 16; ctx.strokeText(w, x, y);
      ctx.fillStyle = active ? (BW ? '#ffffff' : '#ffd60a') : '#ffffff'; ctx.fillText(w, x, y); ctx.restore();
      x += ww + sw; wi++;
    }
  });
  ctx.restore(); ctx.restore();
}

// ---------- LLAMADO A LA ACCIÓN ----------
function cursor(ctx, x, y, press) {
  ctx.save(); ctx.translate(x, y); ctx.scale(press ? 0.88 : 1, press ? 0.88 : 1);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 95); ctx.lineTo(24, 72); ctx.lineTo(42, 112); ctx.lineTo(60, 104); ctx.lineTo(42, 66); ctx.lineTo(74, 64); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (press) { ctx.globalAlpha = 0.6; ctx.strokeStyle = BW ? '#111' : '#ffd60a'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 - 0.9 + i * 0.36; line(ctx, [[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * 60, Math.sin(a) * 60]], ctx.strokeStyle, 6); } }
  ctx.restore();
}
function drawCTA(ctx, beat, t, g, opts) {
  const type = beat.ctaType || 'like'; const lang = opts.lang; const es = lang === 'es';
  const ap = backOut(t / 0.4); const clickT = 1.1; const clicked = t > clickT; const press = t > clickT - 0.12 && t < clickT + 0.12;
  ctx.save(); ctx.translate(540, 560); ctx.scale(ap, ap);
  const red = BW ? '#111' : '#ff0033';
  const cx = lerp(380, 60, easeInOut((t - 0.3) / 0.8)), cy = lerp(420, 40, easeInOut((t - 0.3) / 0.8));
  if (type === 'like' || type === 'combo') {
    const bx = type === 'combo' ? -260 : 0; const pulse = clicked ? 1 + Math.sin((t - clickT) * 10) * 0.08 * Math.exp(-(t - clickT)) : 1;
    ctx.save(); ctx.translate(bx, 0); ctx.scale(pulse, pulse);
    circle(ctx, 0, 0, 150, clicked ? (BW ? '#111' : '#ff4d6d') : '#ffffff', '#111', 10);
    ctx.fillStyle = clicked ? '#ffffff' : (BW ? '#111' : '#ff4d6d'); heartPath(ctx, 0, 10, 170); ctx.fill();
    ctx.restore();
    if (clicked) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = 170 + (t - clickT) * 220; ctx.globalAlpha = Math.max(0, 1 - (t - clickT)); ctx.fillStyle = BW ? '#111' : '#ff4d6d'; heartPath(ctx, bx + Math.cos(a) * d, Math.sin(a) * d, 50); ctx.fill(); ctx.globalAlpha = 1; }
    setFont(ctx, 54, 700); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 12; ctx.strokeText(es ? 'ME GUSTA' : 'LIKE', bx, 230); ctx.fillText(es ? 'ME GUSTA' : 'LIKE', bx, 230);
    if (type === 'combo') {
      const on = t > clickT + 0.6; ctx.fillStyle = on ? (BW ? '#555' : '#495057') : red; rr(ctx, 30, -70, 400, 140, 70); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
      setFont(ctx, 56, 700); ctx.fillStyle = '#fff'; ctx.fillText(on ? (es ? 'SIGUIENDO ✓' : 'FOLLOWING ✓') : (es ? 'SEGUIR' : 'FOLLOW'), 230, 20);
      ctx.restore(); cursor(ctx, 540 + (t < clickT + 0.3 ? cx - 260 : 230 + 20), 560 + (t < clickT + 0.3 ? cy : 30), press || (t > clickT + 0.5 && t < clickT + 0.7)); return;
    }
  } else if (type === 'follow') {
    const page = (opts.page || '').trim();
    circle(ctx, 0, -90, 120, BW ? '#fff' : '#ffd60a', '#111', 10);
    // mini muñeco en el avatar
    line(ctx, [[0, -100], [0, -40]], '#111', 10); circle(ctx, 0, -130, 30, '#fff', '#111', 8); line(ctx, [[-35, -80], [0, -90], [35, -80]], '#111', 8);
    if (page) { setFont(ctx, 54, 700); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 12; ctx.strokeText(page, 0, 90); ctx.fillText(page, 0, 90); }
    const on = clicked; ctx.fillStyle = on ? (BW ? '#555' : '#495057') : red; rr(ctx, -220, 130, 440, 140, 70); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
    setFont(ctx, 60, 700); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(on ? (es ? 'SIGUIENDO ✓' : 'FOLLOWING ✓') : (es ? 'SEGUIR' : 'FOLLOW'), 0, 222);
    if (on) { const bt = t - clickT; ctx.save(); ctx.translate(260, 60); ctx.rotate(Math.sin(bt * 20) * 0.3 * Math.exp(-bt)); ctx.fillStyle = BW ? '#111' : '#fcc419'; ctx.beginPath(); ctx.moveTo(-40, 30); ctx.quadraticCurveTo(-40, -50, 0, -50); ctx.quadraticCurveTo(40, -50, 40, 30); ctx.closePath(); ctx.fill(); circle(ctx, 0, 40, 12, ctx.fillStyle); ctx.restore(); }
    ctx.restore(); cursor(ctx, 540 + cx * 0.5, 560 + 200 + cy * 0.5, press); return;
  } else if (type === 'stars') {
    for (let i = 0; i < 5; i++) {
      const fillT = easeOut((t - 0.4 - i * 0.18) / 0.25), x = -320 + i * 160, y = Math.sin(g * 3 + i) * 10;
      ctx.save(); ctx.translate(x, y); ctx.scale(0.8 + fillT * 0.25, 0.8 + fillT * 0.25);
      star(ctx, 0, 0, 70, 0); ctx.fillStyle = fillT > 0.5 ? (BW ? '#111' : '#fcc419') : '#ffffff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    }
    if (!BW) { ctx.globalAlpha = 0.25 + Math.sin(g * 4) * 0.1; circle(ctx, 0, 0, 380, '#fff3bf'); ctx.globalAlpha = 1; }
    setFont(ctx, 58, 700); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 12; const st = es ? 'ESTRELLAS' : 'STARS'; ctx.strokeText('★ ' + st + ' ★', 0, 180); ctx.fillText('★ ' + st + ' ★', 0, 180);
  } else if (type === 'link') {
    const label = (opts.linkLabel || opts.linkUrl || (es ? 'Enlace' : 'Link')).trim();
    setFont(ctx, 52, 700); const tw = Math.min(900, ctx.measureText(label).width + 170);
    const sc = press ? 0.94 : 1; ctx.save(); ctx.scale(sc, sc);
    ctx.fillStyle = BW ? '#111' : '#1c7ed6'; rr(ctx, -tw / 2, -75, tw, 150, 75); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
    // icono de enlace
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.save(); ctx.translate(-tw / 2 + 75, 0); ctx.rotate(-0.78); rr(ctx, -34, -14, 40, 28, 14); ctx.stroke(); rr(ctx, -6, -14, 40, 28, 14); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let lbl = label; while (ctx.measureText(lbl).width > tw - 170 && lbl.length > 4) lbl = lbl.slice(0, -2); if (lbl !== label) lbl += '…'; ctx.fillText(lbl, 30, 4); ctx.restore(); ctx.textBaseline = 'alphabetic';
    const arrowY = -150 + Math.sin(g * 8) * 15; ctx.fillStyle = BW ? '#111' : '#ffd60a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, arrowY - 70); ctx.lineTo(40, arrowY - 70); ctx.lineTo(40, arrowY - 20); ctx.lineTo(75, arrowY - 20); ctx.lineTo(0, arrowY + 40); ctx.lineTo(-75, arrowY - 20); ctx.lineTo(-40, arrowY - 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore(); cursor(ctx, 540 + cx * 0.6, 560 + 20 + cy * 0.5, press); return;
  }
  ctx.restore();
  if (type === 'like') cursor(ctx, 540 + cx * 0.5, 560 + cy * 0.5, press);
}

// ---------- ESCENA ----------
function parseActs(a) {
  const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); if (r === 'all') { for (const k of ROLES) if (!m[k]) m[k] = act; m._all = act; } else m[r] = act; });
  return m;
}
const BASEX = { 1: [540], 2: [370, 710], 3: [250, 540, 830], 4: [180, 420, 660, 900] };

function sceneChars(beat, t, opts) {
  const n = opts.nChars; const acts = parseActs(beat.a); const looks = LOOKS[opts.sitId] || {};
  const xs = BASEX[n].slice();
  const chars = [];
  for (let i = 0; i < n; i++) {
    const role = ROLES[i];
    let act = acts[role] || acts._all || (beat.kind === 'twist' ? 'shock' : beat.kind === 'cta' ? 'wave' : beat.kind === 'reflect' ? 'idle' : 'idle');
    if (!acts[role] && !acts._all && i >= 2 && beat.kind === 'rep') act = beat.level > 0.6 ? 'laugh' : 'idle';
    let x = xs[i];
    chars.push({ role, act, x, baseX: x, color: CHAR_COLORS[role], seed: i * 1.37 + 0.5, look: looks[role], kid: looks[role] === 'kid', f: 1 });
  }
  // caminos: A camina hacia el lado del camino
  if (beat.env === 'caminos' && beat.side && chars[0]) { const c = chars[0]; const target = 540 + beat.side * 230; c.x = lerp(n > 1 ? c.baseX : 540, target, easeInOut(t / Math.min(1.2, beat.dur))); if (c.act === 'idle') c.act = 'walk'; c.walkDir = beat.side; }
  else if (beat.env === 'caminos' && n === 1) chars[0].x = 540;
  // movimientos
  const mid = chars.reduce((s, c) => s + c.x, 0) / Math.max(1, chars.length);
  for (const c of chars) {
    if (c.act === 'walk' && !c.walkDir) { const from = c.x < 540 ? -1 : 1; c.x = lerp(c.baseX + from * 320, c.baseX, easeOut(t / Math.min(1.4, beat.dur * 0.7))); c.walkDir = -from; if (t > 1.4) c.settle = true; }
    if (c.act === 'run') { const from = c.x < 540 ? -1 : 1; c.x = lerp(c.baseX + from * 700, c.baseX, easeOut(t / Math.min(0.9, beat.dur * 0.5))); c.walkDir = -from; }
  }
  const huggers = chars.filter(c => c.act === 'hug');
  if (huggers.length >= 2) { const hm = (huggers[0].baseX + huggers[1].baseX) / 2; const k = easeOut(t / 0.6); huggers[0].x = lerp(huggers[0].baseX, hm - 75, k); huggers[1].x = lerp(huggers[1].baseX, hm + 75, k); }
  else if (huggers.length === 1) huggers[0].act = 'love';
  for (const c of chars) if (c.act === 'give') { const other = chars.filter(o => o !== c).sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0]; if (other) c.x = lerp(c.baseX, lerp(c.baseX, other.x, 0.45), easeOut(t / 0.7)); c.giveProp = beat.p === 'coffee' ? 'coffee' : 'gift'; }
  // orientación
  for (const c of chars) {
    if (c.walkDir) c.f = c.walkDir;
    else if (chars.length > 1) { const others = chars.filter(o => o !== c); const nearest = others.sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0]; c.f = nearest.x >= c.x ? 1 : -1; }
    else c.f = Math.sin(t * 0.8 + 1) > -0.2 ? 1 : -1;
    if (c.act === 'walk' && c.settle && !beat.side) c.act = 'idle';
  }
  return chars;
}

export function prepareProject(project) {
  for (const b of project.beats) b._lang = project.lang;
  return project;
}

export function beatAt(project, time) {
  const bs = project.beats; let i = 0;
  while (i < bs.length - 1 && time >= bs[i].start + bs[i].dur) i++;
  return i;
}

export function drawFrame(ctx, project, time, scale = 1) {
  BW = !project.color; cache.clear();
  const opts = project;
  const bi = beatAt(project, time); const beat = project.beats[bi]; const t = Math.max(0, time - beat.start); const g = time;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = BW ? '#ffffff' : '#000'; ctx.fillRect(0, 0, W, H);
  const chars = sceneChars(beat, t, opts);
  const cam = cameraFor(beat, bi, t, chars);
  // transición de barrido al entrar al beat
  const whip = bi > 0 ? Math.max(0, 1 - t / 0.16) : 0; const dir = bi % 2 ? 1 : -1;
  ctx.save();
  ctx.translate(W / 2 + dir * whip * whip * 700, H / 2);
  ctx.rotate(cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy);
  const env = beat.env;
  (ENV_DRAW[env] || ENV_DRAW.vacio)(ctx, g, beat);
  // líneas de velocidad en repeticiones intensas o giro
  const intensity = beat.kind === 'rep' ? beat.level : beat.kind === 'twist' ? 1 : 0;
  if (intensity > 0.55) { ctx.save(); ctx.globalAlpha = 0.18 * intensity; ctx.strokeStyle = BW ? '#000' : '#ffffff'; ctx.lineWidth = 10; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + Math.floor(g * 12) * 0.13; const r0 = 520 + hash(i + Math.floor(g * 12)) * 200; ctx.beginPath(); ctx.moveTo(cam.fx + Math.cos(a) * r0, cam.fy + Math.sin(a) * r0); ctx.lineTo(cam.fx + Math.cos(a) * 1500, cam.fy + Math.sin(a) * 1500); ctx.stroke(); } ctx.restore(); }
  // personajes
  const speakingRoles = new Set(); const acts = parseActs(beat.a);
  for (const c of chars) if (c.act === 'talk' || c.act === 'point') speakingRoles.add(c.role);
  if (!speakingRoles.size && (beat.kind === 'hook' || beat.kind === 'setup') && chars[0]) speakingRoles.add(chars[0].role);
  const vt = t - (beat.voiceLead || 0); const speaking = vt > 0 && vt < (beat.voiceDur || beat.dur);
  for (const c of chars) {
    const P = pose(c.act, t, g, c.seed);
    if (speaking && speakingRoles.has(c.role)) { P.mouth = (Math.sin(g * 26 + c.seed) + 1) / 2; if (P.emo === 'neutral') P.emo = 'happy'; }
    const head = drawFigure(ctx, c, P, g);
    drawFx(ctx, P.fx, head.hx, head.hy, t, g, Math.floor(c.seed * 10) + bi);
  }
  ctx.restore();
  // objetos de escena en capa de pantalla (siempre visibles aunque la cámara haga zoom)
  if (beat.kind !== 'reflect' && beat.kind !== 'hook') { ctx.save(); const ps = 0.82; ctx.translate(540, 470); ctx.scale(ps, ps); ctx.translate(-540, -600); drawProp(ctx, beat.p, t, g, project.lang, beat); ctx.restore(); }
  if (beat.kind === 'after' && (!beat.p || beat.p === 'confetti')) drawProp(ctx, 'confetti', t, g, project.lang, beat);
  // capa de reflexión: oscurece y da calidez
  if (beat.kind === 'reflect') {
    const k = clamp(t / 0.6, 0, 1); const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, BW ? `rgba(0,0,0,${0.75 * k})` : `rgba(20,10,40,${0.78 * k})`); gr.addColorStop(0.6, BW ? `rgba(0,0,0,${0.55 * k})` : `rgba(60,20,60,${0.5 * k})`); gr.addColorStop(1, `rgba(0,0,0,${0.2 * k})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const ph = (g * 0.05 + hash(i)) % 1; ctx.globalAlpha = 0.5 * Math.sin(ph * Math.PI) * k; circle(ctx, hash(i + 7) * W, H - ph * H, 3 + hash(i + 3) * 6, BW ? '#fff' : '#ffe8a3'); }
    ctx.globalAlpha = 1;
  }
  if (beat.kind === 'cta') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H); drawCTA(ctx, beat, t, g, opts); }
  // destello en el giro
  if (beat.kind === 'twist' && t < 0.14) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 0.14})`; ctx.fillRect(0, 0, W, H); }
  if (beat.kind === 'twist' && t > 0.05 && t < (beat.voiceLead || 0.5)) { ctx.save(); setFont(ctx, 200, 700); ctx.textAlign = 'center'; ctx.lineWidth = 16; ctx.strokeStyle = '#111'; ctx.fillStyle = BW ? '#fff' : '#ffd60a'; const s = backOut((t - 0.05) / 0.2); ctx.translate(540, 760); ctx.scale(s, s); ctx.rotate(-0.08); ctx.strokeText('¿¡!?', 0, 0); ctx.fillText('¿¡!?', 0, 0); ctx.restore(); }
  drawCaption(ctx, beat, t, opts);
  // marca de agua / página
  if (opts.page && opts.page.trim()) { ctx.save(); setFont(ctx, 36, 700); ctx.textAlign = 'left'; ctx.globalAlpha = 0.85; ctx.lineWidth = 8; ctx.strokeStyle = '#111'; ctx.strokeText(opts.page.trim(), 50, 130); ctx.fillStyle = '#fff'; ctx.fillText(opts.page.trim(), 50, 130); ctx.restore(); }
  // barra de progreso superior (anima la retención)
  ctx.fillStyle = BW ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)'; ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = BW ? '#111' : '#ffd60a'; ctx.fillRect(0, 0, W * clamp(time / project.total, 0, 1), 10);
}
