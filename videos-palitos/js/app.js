import { THEMES, ENVIRONMENTS, SITUATIONS, hookOptions, ctaOptions } from './content.js';
import { DURATIONS, buildBeats, timeBeats, speakable, toSRT } from './script.js';
import { drawFrame, prepareProject, FONT } from './render.js';
import { renderMix, MUSIC_STYLES } from './audio.js';
import { VOICES, synth } from './tts.js';
import { exportMP4 } from './export.js';

const $ = s => document.querySelector(s);
const I18N = {
  es: {
    title: 'Muñequitos Video', subtitle: 'Videos cortos de reflexión con muñequitos de palitos',
    s1: 'Tema', s2: 'Personajes, entorno y estilo', chars: 'Personajes', style: 'Estilo', env: 'Entorno', s3: 'Duración',
    durHint: 'La app ajusta el ritmo y la cantidad de escenas al rango elegido.', s4: 'Situación cotidiana', s5: 'Gancho inicial',
    s6: 'Llamado a la acción', other: 'Otras opciones', ctaCfg: 'Configurar página y enlace', pageName: 'Nombre de tu página (aparece en el video)',
    linkUrl: 'Enlace (URL)', linkLabel: 'Texto del botón del enlace', s7: 'Voz, música y efectos', voice: 'Voz automática',
    voiceHint: 'La voz neural se descarga una sola vez (≈60 MB) y queda guardada en el navegador.', music: 'Música', musicVol: 'Volumen música',
    sfx: 'Efectos de sonido', generate: 'Generar vista previa', regenerate: 'Regenerar vista previa', empty: 'Elige tus opciones y pulsa «Generar vista previa».',
    export: 'Exportar MP4', srt: 'Subtítulos .srt', cancel: 'Cancelar', script: 'Guion (puedes editarlo)', apply: 'Aplicar cambios',
    foot: 'Todo se genera en tu navegador. Formato vertical 1080×1920 para Shorts, Reels y Facebook.',
    color: 'Color', bw: 'B/N', escalada: 'Repetición + giro', caminos: 'Dos caminos',
    ctaTypes: { like: 'Me gusta', follow: 'Seguir', stars: 'Estrellas', link: 'Enlace', combo: 'Combo' },
    kinds: { hook: 'Gancho', setup: 'Inicio', rep: 'Repetición', twist: 'Giro final', after: 'Remate', reflect: 'Reflexión', cta: 'Llamado a la acción' },
    vPiper: 'Voz neural', vMe: 'Voz básica sin conexión (robótica)', vNone: 'Sin voz (solo subtítulos)',
    stVoice: (i, n) => `Generando voz ${i}/${n}…`, stDl: (p) => `Descargando voz neural… ${p}`, stMix: 'Mezclando música y efectos…',
    stReady: (s, n) => `Listo: ${s.toFixed(1)} s · ${n} escenas. Revisa la vista previa y exporta.`, stFallback: 'No se pudo cargar la voz neural (¿sin internet?). Usando la voz básica sin conexión.',
    exporting: p => `Exportando… ${Math.round(p * 100)} %`, exported: 'Descargar video', exportErr: 'Error al exportar: ', webmNote: 'Tu navegador no graba MP4: se exportó en WebM. Para MP4 usa Chrome, Edge o Safari actualizados.',
    meta: (s, n, sh) => `${s.toFixed(1)} s · ${n} escenas · ${sh} planos · 1080×1920`, linkMissing: 'Configura tu enlace abajo para usar este llamado.', noAudio: 'Aviso: este navegador no codifica audio; el MP4 salió sin sonido. Usa Chrome o Edge.', keepOpen: 'Exportando: deja la pantalla encendida y no cambies de app hasta que termine.', savedHintIOS: 'Listo. Toca «Guardar en Fotos / Compartir» y elige «Guardar video».', share: 'Guardar en Fotos / Compartir', opusNote: 'MP4 listo (audio Opus). Si alguna red social no reconoce el sonido, exporta desde Chrome/Edge en Windows o Mac, o Safari: allí el audio sale en AAC.',
  },
  en: {
    title: 'Stick Video', subtitle: 'Short reflection videos with stick figures',
    s1: 'Topic', s2: 'Characters, setting and style', chars: 'Characters', style: 'Style', env: 'Setting', s3: 'Length',
    durHint: 'The app adapts the pacing and number of scenes to the chosen range.', s4: 'Everyday situation', s5: 'Opening hook',
    s6: 'Call to action', other: 'More options', ctaCfg: 'Set up page and link', pageName: 'Your page name (shown in the video)',
    linkUrl: 'Link (URL)', linkLabel: 'Link button text', s7: 'Voice, music and sound effects', voice: 'Automatic voice',
    voiceHint: 'The neural voice downloads once (≈60 MB) and stays saved in your browser.', music: 'Music', musicVol: 'Music volume',
    sfx: 'Sound effects', generate: 'Generate preview', regenerate: 'Regenerate preview', empty: 'Pick your options and press "Generate preview".',
    export: 'Export MP4', srt: 'Subtitles .srt', cancel: 'Cancel', script: 'Script (editable)', apply: 'Apply changes',
    foot: 'Everything is generated in your browser. Vertical 1080×1920 for Shorts, Reels and Facebook.',
    color: 'Color', bw: 'B/W', escalada: 'Rising gag + twist', caminos: 'Two paths',
    ctaTypes: { like: 'Like', follow: 'Follow', stars: 'Stars', link: 'Link', combo: 'Combo' },
    kinds: { hook: 'Hook', setup: 'Setup', rep: 'Repetition', twist: 'Final twist', after: 'Punchline', reflect: 'Reflection', cta: 'Call to action' },
    vPiper: 'Neural voice', vMe: 'Basic offline voice (robotic)', vNone: 'No voice (subtitles only)',
    stVoice: (i, n) => `Generating voice ${i}/${n}…`, stDl: (p) => `Downloading neural voice… ${p}`, stMix: 'Mixing music and sound effects…',
    stReady: (s, n) => `Ready: ${s.toFixed(1)} s · ${n} scenes. Check the preview and export.`, stFallback: 'Could not load the neural voice (offline?). Using the basic offline voice.',
    exporting: p => `Exporting… ${Math.round(p * 100)}%`, exported: 'Download video', exportErr: 'Export error: ', webmNote: 'Your browser cannot record MP4, so it was exported as WebM. Use an up-to-date Chrome, Edge or Safari for MP4.',
    meta: (s, n, sh) => `${s.toFixed(1)} s · ${n} scenes · ${sh} shots · 1080×1920`, linkMissing: 'Set up your link below to use this call to action.', noAudio: 'Note: this browser cannot encode audio; the MP4 has no sound. Use Chrome or Edge.', keepOpen: 'Exporting: keep the screen on and stay in this app until it finishes.', savedHintIOS: 'Done. Tap "Save to Photos / Share" and choose "Save Video".', share: 'Save to Photos / Share', opusNote: 'MP4 ready (Opus audio). If a social network does not pick up the sound, export from Chrome/Edge on Windows or Mac, or Safari: there the audio is AAC.',
  },
};

// ---------- estado ----------
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const DEFAULTS = { lang: 'es', theme: 'amistad', nChars: 2, env: 'auto', color: true, dur: 'm', sit: 0, hookSeed: 1, ctaSeed: 1, hook: 0, cta: 0, page: '', linkUrl: '', linkLabel: '', engine: 'piper', voiceId: { es: IOS ? 'es_MX-ald-medium' : 'es_MX-claude-high', en: 'en_US-hfc_female-medium' }, music: 'alegre', musicVol: 0.6, sfx: true };
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('munequitos-state') || '{}') }; } catch { /* sin almacenamiento */ }
const save = () => { try { localStorage.setItem('munequitos-state', JSON.stringify(S)); } catch { /* ignorar */ } };
const tr = () => I18N[S.lang];
let project = null, mix = null, dirty = true;

// ---------- render de controles ----------
function btn(cls, html, on, onClick) { const b = document.createElement('button'); b.type = 'button'; b.className = cls + (on ? ' on' : ''); b.innerHTML = html; b.addEventListener('click', onClick); return b; }
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderAll() {
  const L = tr();
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = L[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  if (project) $('#genBtn').textContent = L.regenerate;
  const [es, en] = $('#langBtn').children; es.classList.toggle('on', S.lang === 'es'); en.classList.toggle('on', S.lang === 'en');

  const th = $('#themes'); th.replaceChildren(...THEMES.map(t => btn('chip', `${t.emoji} ${esc(t.name[S.lang])}`, S.theme === t.id, () => { S.theme = t.id; S.sit = 0; S.hook = 0; S.hookSeed = 1; change(); })));
  $('#nchars').replaceChildren(...[1, 2, 3, 4].map(n => btn('', String(n), S.nChars === n, () => { S.nChars = n; change(); })));
  $('#colorSeg').replaceChildren(btn('', '🎨 ' + L.color, S.color, () => { S.color = true; change(false); }), btn('', '⚫⚪ ' + L.bw, !S.color, () => { S.color = false; change(false); }));
  $('#envs').replaceChildren(...ENVIRONMENTS.map(e => btn('chip', `${e.emoji} ${esc(e.name[S.lang])}`, S.env === e.id, () => { S.env = e.id; change(); })));
  $('#durs').replaceChildren(...Object.entries(DURATIONS).map(([k, d]) => btn('', `${d.label[S.lang]}<small>${k === 's' ? (S.lang === 'es' ? 'Rápido' : 'Quick') : k === 'm' ? (S.lang === 'es' ? 'Estándar' : 'Standard') : (S.lang === 'es' ? 'Completo' : 'Full')}</small>`, S.dur === k, () => { S.dur = k; change(); })));

  const sits = SITUATIONS[S.theme];
  $('#sits').replaceChildren(...sits.map((s, i) => btn('opt', `<span class="tag">${s.mode === 'caminos' ? L.caminos : L.escalada}</span><div><b>${esc(s.title[S.lang])}</b><span class="d">${esc(s.hook[S.lang])}</span></div>`, S.sit === i, () => { S.sit = i; S.hook = 0; change(); })));
  const sit = sits[S.sit] || sits[0];
  const hooks = hookOptions(S.theme, sit, S.hookSeed);
  $('#hooks').replaceChildren(...hooks.map((h, i) => btn('opt', `<span class="tag">${i + 1}</span><div><b>${esc(h[S.lang])}</b></div>`, S.hook === i, () => { S.hook = i; change(); })));
  const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
  $('#ctas').replaceChildren(...ctas.map((c, i) => btn('opt', `<span class="tag">${L.ctaTypes[c.type]}</span><div><b>${esc(fillPreview(c.text[S.lang], c.type))}</b></div>`, S.cta === i, () => { S.cta = i; change(); })));

  const vs = $('#voice'); const cur = S.engine === 'piper' ? S.voiceId[S.lang] : S.engine;
  vs.replaceChildren(...VOICES[S.lang].map(v => new Option(`${L.vPiper}: ${v.label}`, v.id)), new Option(L.vMe, 'mespeak'), new Option(L.vNone, 'none'));
  vs.value = cur;
  $('#music').replaceChildren(...MUSIC_STYLES.map(m => new Option(m.name[S.lang], m.id))); $('#music').value = S.music;
  $('#musicVol').value = S.musicVol; $('#sfx').checked = S.sfx;
  $('#page').value = S.page; $('#linkUrl').value = S.linkUrl; $('#linkLabel').value = S.linkLabel;
  if (project) $('#meta').textContent = L.meta(project.total, project.beats.length, project.beats.reduce((s, b) => s + b.shots, 0));
}
function fillPreview(text, type) {
  const page = S.page.trim() || (S.lang === 'es' ? 'la página' : 'the page');
  const link = (S.linkLabel || S.linkUrl).trim() || (S.lang === 'es' ? 'en la descripción' : 'in the description');
  return text.replace('{page}', page).replace('{link}', link);
}
function change(content = true) { if (content) dirty = true; save(); renderAll(); if (project && !content) { project.color = S.color; drawAt(curTime); } }

$('#langBtn').addEventListener('click', () => { S.lang = S.lang === 'es' ? 'en' : 'es'; dirty = true; change(); });
$('#moreHooks').addEventListener('click', () => { S.hookSeed++; S.hook = 0; change(); });
$('#moreCtas').addEventListener('click', () => { S.ctaSeed++; S.cta = 0; change(); });
$('#voice').addEventListener('change', e => { const v = e.target.value; if (v === 'mespeak' || v === 'none') S.engine = v; else { S.engine = 'piper'; S.voiceId = { ...S.voiceId, [S.lang]: v }; } dirty = true; save(); });
$('#music').addEventListener('change', e => { S.music = e.target.value; dirty = true; save(); });
$('#musicVol').addEventListener('change', e => { S.musicVol = +e.target.value; dirty = true; save(); });
$('#sfx').addEventListener('change', e => { S.sfx = e.target.checked; dirty = true; save(); });
for (const id of ['page', 'linkUrl', 'linkLabel']) $('#' + id).addEventListener('input', e => { S[id] = e.target.value; save(); dirty = true; clearTimeout(window._rt); window._rt = setTimeout(() => { const f = document.activeElement; renderAll(); f && f.focus && f.focus(); }, 500); });

// ---------- generación ----------
function setStatus(msg, err = false) { const el = $('#status'); el.textContent = msg; el.classList.toggle('err', err); }

async function generate(customTexts = null) {
  const L = tr(); stop();
  $('#genBtn').disabled = true;
  try {
    await document.fonts.load(`700 80px ${FONT}`).catch(() => {});
    const sits = SITUATIONS[S.theme]; const sit = sits[S.sit] || sits[0];
    const hooks = hookOptions(S.theme, sit, S.hookSeed); const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
    const settings = { env: S.env, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel };
    const beats = buildBeats({ situation: sit, lang: S.lang, dur: S.dur, hook: hooks[S.hook] || hooks[0], cta: ctas[S.cta] || ctas[0], settings });
    if (customTexts) beats.forEach((b, i) => { if (customTexts[i] != null && customTexts[i].trim()) b.text = customTexts[i].trim(); });
    let engine = S.engine; const D = DURATIONS[S.dur];
    let speed = D.pace; let total = 0;
    for (let attempt = 0; attempt < 4; attempt++) {
      for (let i = 0; i < beats.length; i++) {
        setStatus(L.stVoice(i + 1, beats.length));
        const b = beats[i];
        let buf = null;
        try {
          buf = await synth(speakable(b.text), { engine, voiceId: S.voiceId[S.lang], lang: S.lang, speed: b.kind === 'reflect' ? speed * 0.92 : speed, onProgress: (what, l, t) => { if (what === 'model' || what === 'phon') setStatus(L.stDl(t ? Math.round(l / t * 100) + ' %' : Math.round(l / 1e6) + ' MB')); } });
        } catch (e) {
          console.warn('TTS', e);
          if (engine === 'piper') { engine = 'mespeak'; setStatus(L.stFallback, true); await new Promise(r => setTimeout(r, 1200)); i--; continue; }
          throw e;
        }
        b.voiceBuffer = buf; b.voiceDur = buf ? buf.duration : 0;
        if (!buf) b.voiceDur = undefined;
      }
      total = timeBeats(beats, S.dur);
      if (total <= D.max + 0.5 || engine === 'none' || speed >= 1.35) break;
      speed = Math.min(1.35, speed * (total / D.max) * 1.02);
    }
    if (engine !== S.engine && engine === 'mespeak') { /* se mantiene la elección; solo este video usa el respaldo */ }
    project = prepareProject({ beats, total, lang: S.lang, color: S.color, nChars: S.nChars, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, music: S.music, sitId: sit.id });
    setStatus(L.stMix);
    mix = await renderMix(project, { musicVol: S.musicVol, sfxOn: S.sfx });
    dirty = false;
    renderScript();
    $('#emptyMsg').hidden = true; $('#player').hidden = false; $('#exportRow').hidden = false; $('#bigPlay').hidden = false; $('#dl').hidden = true;
    curTime = 0; drawAt(0);
    if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus(L.stReady(total, beats.length) + (engine === 'mespeak' && S.engine === 'piper' ? ' · ' + L.stFallback : ''));
    renderAll();
  } catch (e) {
    console.error(e); setStatus(String(e.message || e), true);
  } finally { $('#genBtn').disabled = false; }
}
$('#genBtn').addEventListener('click', () => generate());

function renderScript() {
  const L = tr(); const ol = $('#scriptList');
  ol.replaceChildren(...project.beats.map((b, i) => { const li = document.createElement('li'); li.innerHTML = `<span class="k">${i + 1}. ${L.kinds[b.kind]} · ${b.dur.toFixed(1)} s</span>`; const ta = document.createElement('textarea'); ta.value = b.text; ta.rows = 2; ta.dataset.i = i; li.appendChild(ta); return li; }));
  $('#scriptCard').hidden = false;
}
$('#applyBtn').addEventListener('click', () => { const texts = [...document.querySelectorAll('#scriptList textarea')].map(t => t.value); generate(texts); });

// ---------- vista previa ----------
const canvas = $('#preview'); const pctx = canvas.getContext('2d');
let ac = null, src = null, t0 = 0, playing = false, curTime = 0, raf = 0;
// iPhone: que suene aunque el interruptor de silencio esté activado, y activar el audio en el toque
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* no disponible */ }
function unlockAudio() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
  if (ac.state !== 'running') ac.resume();
  return ac;
}
function drawAt(t) { if (!project) return; drawFrame(pctx, project, Math.min(t, project.total - 0.001), canvas.width / 1080); $('#seek').value = Math.round(t / project.total * 1000); $('#timeLbl').textContent = `${t.toFixed(1)} / ${project.total.toFixed(1)} s`; }
function play() {
  if (!project || !mix) return;
  if (dirty) { /* las opciones cambiaron: se reproduce la versión generada */ }
  unlockAudio();
  if (curTime >= project.total - 0.05) curTime = 0;
  src = ac.createBufferSource(); src.buffer = mix; src.connect(ac.destination);
  t0 = ac.currentTime - curTime; src.start(0, curTime); playing = true;
  $('#playBtn').textContent = '❚❚'; $('#bigPlay').hidden = true;
  const tick = () => { if (!playing) return; curTime = ac.currentTime - t0; if (curTime >= project.total) { stop(); curTime = project.total; drawAt(curTime); $('#bigPlay').hidden = false; return; } drawAt(curTime); raf = requestAnimationFrame(tick); };
  tick();
}
function stop() { playing = false; cancelAnimationFrame(raf); if (src) { try { src.stop(); } catch { /* ya parado */ } src = null; } $('#playBtn').textContent = '▶'; }
$('#playBtn').addEventListener('click', () => (playing ? stop() : play()));
$('#bigPlay').addEventListener('click', play);
canvas.addEventListener('click', () => { if (project) (playing ? stop() : play()); });
$('#seek').addEventListener('input', e => { if (!project) return; const was = playing; stop(); curTime = e.target.value / 1000 * project.total; drawAt(curTime); if (was) play(); });

// ---------- exportación ----------
let abort = null, lastFile = null;
$('#exportBtn').addEventListener('click', async () => {
  if (!project) return; const L = tr(); stop();
  const actx = unlockAudio(); // en iPhone el audio debe activarse dentro del toque
  if (dirty) await generate(); if (!project) return;
  abort = new AbortController();
  $('#exportBtn').disabled = true; $('#exportProg').hidden = false; $('#dl').hidden = true; $('#shareBtn').hidden = true;
  if (IOS) setStatus(L.keepOpen);
  const bar = $('#exportProg div'), lbl = $('#exportProg span');
  try {
    const { blob, ext, note } = await exportMP4(project, mix, { audioContext: actx, signal: abort.signal, onProgress: p => { bar.style.width = (p * 100).toFixed(1) + '%'; lbl.textContent = L.exporting(p); } });
    const a = $('#dl'); if (a.href) URL.revokeObjectURL(a.href);
    a.href = URL.createObjectURL(blob);
    const sit = SITUATIONS[S.theme][S.sit];
    const name = `munequitos-${S.theme}-${sit.id}-${S.lang}.${ext}`;
    a.download = name;
    a.textContent = `⬇ ${L.exported} (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1)} MB)`; a.hidden = false;
    lastFile = new File([blob], name, { type: blob.type || 'video/mp4' });
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [lastFile] }));
    $('#shareBtn').hidden = !canShare;
    setStatus(canShare && IOS ? L.savedHintIOS : '');
    if (note === 'webm') setStatus(L.webmNote, true); else if (note === 'sin-audio') setStatus(L.noAudio, true); else if (note === 'opus') setStatus(L.opusNote);
    if (!IOS) a.click();
  } catch (e) { if (e.name !== 'AbortError') { console.error(e); setStatus(L.exportErr + (e.message || e), true); } }
  finally { $('#exportBtn').disabled = false; $('#exportProg').hidden = true; abort = null; }
});
$('#shareBtn').addEventListener('click', async () => {
  if (!lastFile) return;
  try { await navigator.share({ files: [lastFile], title: lastFile.name }); } catch (e) { if (e.name !== 'AbortError') setStatus(String(e.message || e), true); }
});
$('#cancelBtn').addEventListener('click', () => abort && abort.abort());
$('#srtBtn').addEventListener('click', () => {
  if (!project) return; const blob = new Blob([toSRT(project.beats)], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `munequitos-${S.theme}-${S.lang}.srt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

renderAll();
// expone para pruebas automatizadas
window.__app = { generate, get project() { return project; }, get mix() { return mix; }, S, drawAt, exportMP4: () => exportMP4(project, mix) };
