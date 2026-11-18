// Música procedural + efectos de sonido + voz, mezclados en un único AudioBuffer (OfflineAudioContext).
export const SR = 48000;

export const MUSIC_STYLES = [
  { id: 'alegre', name: { es: 'Alegre (ukelele)', en: 'Happy (ukulele)' }, bpm: 118 },
  { id: 'energica', name: { es: 'Enérgica', en: 'Energetic' }, bpm: 126 },
  { id: 'lofi', name: { es: 'Lo-fi relajada', en: 'Chill lo-fi' }, bpm: 86 },
  { id: 'none', name: { es: 'Sin música', en: 'No music' }, bpm: 100 },
];

const midi = n => 440 * Math.pow(2, (n - 69) / 12);
// progresión I–V–vi–IV en Do mayor / emotiva vi–IV–I–V
const PROG = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
const EMO = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];

function noiseBuffer(ctx, sec = 1) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate); const d = b.getChannelData(0);
  let s = 1234567; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
  return b;
}

function env(g, t, a, peak, d, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d); }

function osc(ctx, dest, type, f, t, dur, vol, opts = {}) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide || dur));
  if (opts.detune) o.detune.value = opts.detune;
  const g = ctx.createGain(); env(g, t, opts.a || 0.005, vol, dur, opts.sus);
  let node = o;
  if (opts.lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = opts.lp; f2.Q.value = opts.q || 0.7; o.connect(f2); node = f2; }
  node.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.1);
  if (opts.vib) { const l = ctx.createOscillator(); l.frequency.value = opts.vib; const lg = ctx.createGain(); lg.gain.value = opts.vibAmt || 20; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); }
  return o;
}
function noise(ctx, dest, nb, t, dur, vol, type = 'highpass', freq = 6000, opts = {}) {
  const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t + dur); f.Q.value = opts.q || 0.8;
  const g = ctx.createGain(); env(g, t, opts.a || 0.002, vol, dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, (t * 0.37) % 0.9); s.stop(t + dur + 0.1);
}

// ---------- Instrumentos ----------
const kick = (c, d, t, v = 0.9) => osc(c, d, 'sine', 150, t, 0.35, v, { to: 45, glide: 0.12 });
const snare = (c, d, nb, t, v = 0.35) => { noise(c, d, nb, t, 0.18, v, 'bandpass', 1800, { q: 0.6 }); osc(c, d, 'triangle', 190, t, 0.1, v * 0.5); };
const clap = (c, d, nb, t, v = 0.3) => { for (let i = 0; i < 3; i++) noise(c, d, nb, t + i * 0.012, 0.12, v, 'bandpass', 1400, { q: 1.2 }); };
const hat = (c, d, nb, t, v = 0.1, open = false) => noise(c, d, nb, t, open ? 0.2 : 0.045, v, 'highpass', 8000);
const pluck = (c, d, f, t, v = 0.16) => { osc(c, d, 'triangle', f, t, 0.35, v); osc(c, d, 'square', f * 2, t, 0.12, v * 0.18, { lp: 2500 }); };
const bass = (c, d, f, t, dur, v = 0.28) => osc(c, d, 'sawtooth', f, t, dur, v, { lp: 420, a: 0.01, sus: v * 0.4 });
const pad = (c, d, f, t, dur, v = 0.05) => { for (const dt of [-8, 8]) osc(c, d, 'sawtooth', f, t, dur, v, { lp: 900, a: 0.4, sus: v * 0.8, detune: dt }); };
const piano = (c, d, f, t, v = 0.14) => { osc(c, d, 'triangle', f, t, 1.4, v, { a: 0.004 }); osc(c, d, 'sine', f * 2, t, 0.7, v * 0.3); };

function scheduleMusic(ctx, dest, nb, style, total, sections) {
  if (style === 'none') return;
  const S = MUSIC_STYLES.find(s => s.id === style) || MUSIC_STYLES[0];
  const spb = 60 / S.bpm; const bar = spb * 4;
  const isIn = (t, kind) => sections.some(s => s.kind === kind && t >= s.start && t < s.start + s.dur);
  const twist = sections.find(s => s.kind === 'twist');
  const refl = sections.find(s => s.kind === 'reflect');
  for (let t = 0, step = 0; t < total + 0.5; t += spb / 2, step++) {
    const beatN = step / 2; const barI = Math.floor(beatN / 4);
    const inTwistGap = twist && t >= twist.start && t < twist.start + 0.5;
    if (inTwistGap) continue; // silencio dramático
    const emotive = refl && t >= refl.start - 0.05;
    const chord = (emotive ? EMO : PROG)[barI % 4];
    const off = step % 2 === 1; const q = beatN % 4;
    if (emotive) {
      // piano arpegiado + pad, sin batería (salvo pulso suave en el CTA)
      if (!off || true) piano(ctx, dest, midi(chord[step % 3] + 12), t, 0.11);
      if (step % 8 === 0) { for (const n of chord) pad(ctx, dest, midi(n), t, bar * 0.98, 0.028); bass(ctx, dest, midi(chord[0] - 24), t, bar * 0.9, 0.12); }
      if (isIn(t, 'cta') && !off) kick(ctx, dest, t, 0.35);
      continue;
    }
    const intensity = sections.reduce((m, s) => (t >= s.start && t < s.start + s.dur && s.kind === 'rep') ? Math.max(m, s.level || 0) : m, 0);
    if (style === 'alegre') {
      if (!off && (q === 0 || q === 2)) kick(ctx, dest, t, 0.7);
      if (!off && (q === 1 || q === 3)) clap(ctx, dest, nb, t, 0.22);
      hat(ctx, dest, nb, t, off ? 0.06 : 0.035);
      // rasgueo de ukelele
      const pat = [1, 0, 1, 1, 0, 1, 1, 0];
      if (pat[step % 8]) for (let k = 0; k < 3; k++) pluck(ctx, dest, midi(chord[k] + 12), t + k * 0.012, 0.075);
      if (!off) bass(ctx, dest, midi(chord[q % 2 ? 2 : 0] - 24), t, spb * 0.8, 0.2);
      if (intensity > 0.6 && off) pluck(ctx, dest, midi(chord[(step / 2 | 0) % 3] + 24), t, 0.05);
    } else if (style === 'energica') {
      if (!off) kick(ctx, dest, t, 0.85);
      if (!off && (q === 1 || q === 3)) snare(ctx, dest, nb, t, 0.28);
      hat(ctx, dest, nb, t, off ? 0.08 : 0.04, off);
      bass(ctx, dest, midi(chord[0] - 24 + (off ? 12 : 0)), t, spb * 0.45, 0.17);
      if (step % 4 === 0) for (const n of chord) osc(ctx, dest, 'sawtooth', midi(n + 12), t, spb * 1.5, 0.025, { lp: 1800 + intensity * 2500, sus: 0.01 });
      if (intensity > 0.5) osc(ctx, dest, 'square', midi(chord[step % 3] + 24), t, 0.09, 0.03, { lp: 3000 });
    } else if (style === 'lofi') {
      const sw = off ? spb * 0.08 : 0; const tt = t + sw;
      if (!off && (q === 0 || q === 2.5 || q === 2)) kick(ctx, dest, tt, 0.55);
      if (!off && (q === 1 || q === 3)) snare(ctx, dest, nb, tt, 0.16);
      hat(ctx, dest, nb, tt, 0.03);
      if (step % 8 === 0) for (const n of chord) osc(ctx, dest, 'triangle', midi(n + (n < 58 ? 12 : 0)), tt, bar * 0.95, 0.045, { lp: 1400, a: 0.02, sus: 0.02 });
      if (!off && q === 0) bass(ctx, dest, midi(chord[0] - 24), tt, bar * 0.45, 0.17);
      if (step % 3 === 0) piano(ctx, dest, midi(chord[(step / 3 | 0) % 3] + 12), tt, 0.05);
    }
  }
  // crujido de vinilo para lo-fi
  if (style === 'lofi') noise(ctx, dest, nb, 0, total, 0.012, 'bandpass', 3000, { a: 0.3 });
}

// ---------- Efectos ----------
export function sfx(ctx, dest, nb, name, t) {
  switch (name) {
    case 'whoosh': noise(ctx, dest, nb, t, 0.35, 0.35, 'bandpass', 400, { to: 4000, q: 1.5, a: 0.12 }); break;
    case 'pop': osc(ctx, dest, 'sine', 900, t, 0.12, 0.5, { to: 300, glide: 0.08 }); break;
    case 'boing': osc(ctx, dest, 'sine', 220, t, 0.5, 0.4, { to: 520, glide: 0.25, vib: 18, vibAmt: 60 }); break;
    case 'ding': osc(ctx, dest, 'sine', 1568, t, 1.0, 0.3); osc(ctx, dest, 'sine', 2349, t, 0.7, 0.12); break;
    case 'scratch': for (let i = 0; i < 3; i++) noise(ctx, dest, nb, t + i * 0.07, 0.08, 0.5, 'bandpass', i % 2 ? 900 : 2500, { to: i % 2 ? 2600 : 700, q: 3 }); osc(ctx, dest, 'sawtooth', 300, t, 0.25, 0.18, { to: 60, glide: 0.25, lp: 1200 }); break;
    case 'applause': for (let i = 0; i < 40; i++) noise(ctx, dest, nb, t + i * 0.045 + Math.sin(i * 7) * 0.02, 0.06, 0.12 * (1 - i / 50), 'bandpass', 1500 + (i % 5) * 300, { q: 1 }); break;
    case 'cash': osc(ctx, dest, 'square', 1200, t, 0.08, 0.12, { lp: 4000 }); osc(ctx, dest, 'sine', 2637, t + 0.08, 0.7, 0.25); osc(ctx, dest, 'sine', 3136, t + 0.12, 0.6, 0.15); noise(ctx, dest, nb, t, 0.1, 0.15, 'highpass', 5000); break;
    case 'sad': [392, 370, 349, 330].forEach((f, i) => osc(ctx, dest, 'sawtooth', f, t + i * 0.32, i === 3 ? 0.8 : 0.3, 0.12, { lp: 1200, vib: i === 3 ? 6 : 0, vibAmt: 8, sus: 0.05 })); break;
    case 'drum': for (let i = 0; i < 16; i++) snare(ctx, dest, nb, t + i * 0.045, 0.1 + i * 0.008); osc(ctx, dest, 'sine', 120, t + 0.75, 0.4, 0.6, { to: 50 }); break;
    case 'type': for (let i = 0; i < 10; i++) noise(ctx, dest, nb, t + i * 0.09 + Math.sin(i) * 0.02, 0.02, 0.25, 'bandpass', 3500, { q: 2 }); break;
    case 'heart': [0, 0.18, 0.8, 0.98].forEach(dt => osc(ctx, dest, 'sine', 70, t + dt, 0.18, 0.6, { to: 40 })); osc(ctx, dest, 'sine', 1046, t, 1.2, 0.08); osc(ctx, dest, 'sine', 1318, t + 0.15, 1.1, 0.07); break;
    case 'alarm': for (let i = 0; i < 4; i++) osc(ctx, dest, 'square', 1800, t + i * 0.16, 0.08, 0.1, { lp: 3500 }); break;
    case 'laugh': for (let i = 0; i < 5; i++) osc(ctx, dest, 'triangle', 420 - i * 20, t + i * 0.13, 0.09, 0.15, { lp: 2000, vib: 30, vibAmt: 40 }); break;
    case 'notif': osc(ctx, dest, 'sine', 1318, t, 0.12, 0.25); osc(ctx, dest, 'sine', 1760, t + 0.1, 0.2, 0.22); break;
    case 'click': noise(ctx, dest, nb, t, 0.03, 0.4, 'highpass', 3000); osc(ctx, dest, 'sine', 1400, t, 0.05, 0.2); break;
    case 'sparkle': for (let i = 0; i < 6; i++) osc(ctx, dest, 'sine', 1800 + i * 300, t + i * 0.05, 0.25, 0.06); break;
  }
}

// ---------- Mezcla completa ----------
export async function renderMix(project, { voiceVol = 1, musicVol = 0.6, sfxOn = true } = {}) {
  const total = project.total;
  const ctx = new OfflineAudioContext(2, Math.ceil((total + 0.3) * SR), SR);
  const nb = noiseBuffer(ctx, 2);
  const master = ctx.createDynamicsCompressor(); master.threshold.value = -10; master.ratio.value = 4; master.attack.value = 0.003; master.release.value = 0.2;
  master.connect(ctx.destination);
  const musicBus = ctx.createGain(); musicBus.gain.value = musicVol * 0.8; musicBus.connect(master);
  const sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 0.55 : 0; sfxBus.connect(master);
  const voiceBus = ctx.createGain(); voiceBus.gain.value = voiceVol * 1.25;
  // un poco de presencia en la voz
  const vEq = ctx.createBiquadFilter(); vEq.type = 'peaking'; vEq.frequency.value = 3000; vEq.gain.value = 3; vEq.Q.value = 0.8;
  voiceBus.connect(vEq); vEq.connect(master);

  // ducking: baja la música mientras habla la voz
  const g = musicBus.gain; const base = musicVol * 0.8; g.setValueAtTime(base, 0);
  for (const b of project.beats) {
    if (!b.voiceBuffer) continue;
    const vs = b.start + b.voiceLead, ve = vs + b.voiceDur;
    g.setTargetAtTime(base * 0.4, Math.max(0, vs - 0.08), 0.04);
    g.setTargetAtTime(base, ve + 0.05, 0.12);
  }
  scheduleMusic(ctx, musicBus, nb, project.music, total, project.beats);
  project.beats.forEach((b, i) => {
    if (i > 0) sfx(ctx, sfxBus, nb, 'whoosh', Math.max(0, b.start - 0.12));
    if (b.fx) sfx(ctx, sfxBus, nb, b.fx, b.start + (b.kind === 'twist' ? 0.02 : 0.08));
    // efectos extra en cortes de plano dentro del beat
    for (let s = 1; s < b.shots; s++) sfx(ctx, sfxBus, nb, 'pop', b.start + (b.dur / b.shots) * s);
    if (b.kind === 'cta') { sfx(ctx, sfxBus, nb, 'click', b.start + 1.1); sfx(ctx, sfxBus, nb, b.ctaType === 'stars' ? 'sparkle' : 'ding', b.start + 1.15); }
    if (b.kind === 'reflect' && i > 0 && project.beats[i - 1].kind !== 'reflect') sfx(ctx, sfxBus, nb, 'sparkle', b.start + 0.1);
    if (b.voiceBuffer) { const s = ctx.createBufferSource(); s.buffer = b.voiceBuffer; s.connect(voiceBus); s.start(b.start + b.voiceLead); }
  });
  return ctx.startRendering();
}
