// Construye el guion (beats) a partir de las elecciones del usuario y le asigna tiempos.
import { fillCta } from './content.js';

export const DURATIONS = {
  s: { min: 12, max: 25, reps: 2, after: false, reflect: 1, pace: 1.12, label: { es: '12–25 s', en: '12–25 s' } },
  m: { min: 25, max: 45, reps: 4, after: true, reflect: 2, pace: 1.0, label: { es: '25–45 s', en: '25–45 s' } },
  l: { min: 45, max: 60, reps: 6, after: true, reflect: 2, pace: 0.94, label: { es: '45–60 s', en: '45–60 s' } },
};

function pickReps(reps, n) {
  const core = reps.filter(r => r.core);
  if (core.length) {
    const extra = reps.filter(r => !r.core).slice(0, Math.max(0, n - core.length));
    // intercalar los extras manteniendo el orden original
    return reps.filter(r => r.core || extra.includes(r));
  }
  if (n >= reps.length) return reps.slice();
  // siempre conservar el primero y el último (el más exagerado)
  const idx = new Set([0, reps.length - 1]);
  const step = (reps.length - 1) / (n - 1);
  for (let i = 0; idx.size < n && i < n; i++) idx.add(Math.round(i * step));
  for (let i = 1; idx.size < n; i++) idx.add(i);
  return [...idx].sort((a, b) => a - b).map(i => reps[i]);
}

export function buildBeats({ situation, lang, dur, hook, cta, settings }) {
  const D = DURATIONS[dur];
  const T = o => (typeof o === 'string' ? o : o[lang]);
  const beats = [];
  const env = situation.env;
  const signProp = (situation.setup.find(s => s.p.startsWith('sign:')) || {}).p || '';
  const baseEnv = settings.env && settings.env !== 'auto' ? settings.env : (env === 'caminos' ? 'parque' : env);
  const mk = (kind, line, extra = {}) => ({
    kind, text: T(line.t || line), a: line.a || '', p: line.p || '', fx: line.fx || '',
    env: extra.env || baseEnv, ...extra,
  });

  beats.push(mk('hook', { t: hook, a: situation.mode === 'caminos' ? 'all:think' : 'all:shock', fx: 'whoosh' }));
  situation.setup.forEach(s => beats.push(mk('setup', s, situation.mode === 'caminos' ? { env: 'caminos', sign: signProp } : {})));
  const reps = pickReps(situation.reps, D.reps);
  reps.forEach((r, i) => beats.push(mk('rep', r, {
    level: (i + 1) / reps.length,
    ...(situation.mode === 'caminos' ? { env: 'caminos', sign: signProp, side: r.p === 'left' ? -1 : r.p === 'right' ? 1 : 0, p: '' } : {}),
  })));
  beats.push(mk('twist', situation.twist));
  if (D.after && situation.after) beats.push(mk('after', situation.after));
  const refl = situation.reflect.map(T);
  if (D.reflect === 1) beats.push(mk('reflect', { t: refl.join(' '), a: 'A:hug B:hug all:idle', p: '' }));
  else refl.forEach((r, i) => beats.push(mk('reflect', { t: r, a: i ? 'A:hug B:hug all:idle' : 'all:idle', p: '' })));
  beats.push(mk('cta', { t: fillCta(T(cta.text), lang, settings), a: 'all:wave A:point', p: 'cta', fx: 'pop' }, { ctaType: cta.type }));
  return beats;
}

// Texto apto para la voz (sin comillas ni símbolos)
export function speakable(text) {
  return text.replace(/["“”«»]/g, '').replace(/\s+/g, ' ').replace(/\.\.\./g, ',').trim();
}

// Asigna tiempos: beat.start, beat.dur, beat.voiceStart. voiceDur viene del TTS (o estimación).
export function timeBeats(beats, dur) {
  const D = DURATIONS[dur];
  const base = { hook: 0.35, setup: 0.3, rep: 0.25, twist: 0.6, after: 0.35, reflect: 0.8, cta: 0.6 };
  const lead = { hook: 0.15, setup: 0.1, rep: 0.08, twist: 0.55, after: 0.12, reflect: 0.3, cta: 0.2 };
  const minD = { hook: 2.2, setup: 2.0, rep: 1.9, twist: 2.6, after: 2.0, reflect: 3.0, cta: 3.2 };
  let total = 0;
  const calc = (padMul) => {
    total = 0;
    for (const b of beats) {
      const vd = b.voiceDur || estimateDur(b.text, D.pace);
      b.voiceLead = lead[b.kind];
      b.dur = Math.max(minD[b.kind], b.voiceLead + vd + base[b.kind] * padMul);
      b.start = total;
      total += b.dur;
    }
    return total;
  };
  calc(1);
  if (total < D.min) {
    const extra = (D.min + 0.5 - total);
    calc(1 + extra / beats.reduce((s, b) => s + base[b.kind], 0));
  } else if (total > D.max) {
    calc(0.2);
  }
  // cortes de cámara: un plano cada ~2–3 s dentro de cada beat
  for (const b of beats) {
    const n = Math.max(1, Math.round(b.dur / 2.5));
    b.shots = n;
  }
  return total;
}

export function estimateDur(text, pace = 1) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(0.8, (words / 2.7 + 0.25) / pace);
}

// Subtítulos .srt
export function toSRT(beats) {
  const ts = s => {
    const ms = Math.round(s * 1000);
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0');
    const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
    return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, '0')}`;
  };
  return beats.map((b, i) => `${i + 1}\n${ts(b.start)} --> ${ts(b.start + b.dur)}\n${b.text}\n`).join('\n');
}
