// Exportación MP4: render fotograma a fotograma (más rápido que tiempo real) con WebCodecs + mp4-muxer.
// Respaldo: MediaRecorder en tiempo real (MP4 si el navegador lo permite).
import { Muxer, ArrayBufferTarget } from '../vendor/mp4-muxer.mjs';
import { W, H, drawFrame } from './render.js';

const FPS = 30;

async function pickVideoCodec(w, h) {
  if (typeof VideoEncoder === 'undefined') return null;
  for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.640032', 'avc1.42003e']) {
    for (const hw of ['prefer-hardware', 'no-preference', 'prefer-software', null]) {
      const cfg = { codec, width: w, height: h, bitrate: 8_000_000, framerate: FPS, avc: { format: 'avc' } };
      if (hw) cfg.hardwareAcceleration = hw;
      try { const r = await VideoEncoder.isConfigSupported(cfg); if (r.supported) return cfg; } catch { /* sigue */ }
    }
  }
  return null;
}
async function pickAudioCodec() {
  if (typeof AudioEncoder === 'undefined') return null;
  for (const [codec, mux] of [['mp4a.40.2', 'aac'], ['opus', 'opus']]) {
    const cfg = { codec, sampleRate: 48000, numberOfChannels: 2, bitrate: 160_000 };
    try { const r = await AudioEncoder.isConfigSupported(cfg); if (r.supported) return { cfg, mux }; } catch { /* sigue */ }
  }
  return null;
}

export async function canWebCodecs() { return !!(await pickVideoCodec(W, H)); }

export async function exportMP4(project, mix, { onProgress, signal, audioContext } = {}) {
  const vcfg = await pickVideoCodec(W, H);
  const acodec = vcfg ? await pickAudioCodec() : null;
  // Sin codificador de audio (p. ej. iPhone con iOS antiguo): grabación en tiempo real, que sí incluye el sonido.
  if (!vcfg || !acodec) return exportRealtime(project, mix, { onProgress, signal, audioContext });
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width: W, height: H, frameRate: FPS },
    audio: acodec ? { codec: acodec.mux, numberOfChannels: 2, sampleRate: 48000 } : undefined,
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  });
  let err = null;
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { err = e; } });
  venc.configure(vcfg);
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const total = project.total; const frames = Math.ceil(total * FPS);

  // audio primero (rápido)
  if (acodec) {
    const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => { err = e; } });
    aenc.configure(acodec.cfg);
    const L = mix.getChannelData(0), R = mix.numberOfChannels > 1 ? mix.getChannelData(1) : L;
    const n = Math.min(mix.length, Math.ceil(total * 48000)); const CH = 4800;
    for (let i = 0; i < n; i += CH) {
      const len = Math.min(CH, n - i); const data = new Float32Array(len * 2);
      data.set(L.subarray(i, i + len), 0); data.set(R.subarray(i, i + len), len);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: len, numberOfChannels: 2, timestamp: Math.round(i / 48000 * 1e6), data });
      aenc.encode(ad); ad.close();
    }
    await aenc.flush(); aenc.close();
  }
  for (let i = 0; i < frames; i++) {
    if (signal && signal.aborted) { venc.close(); throw new DOMException('cancelado', 'AbortError'); }
    if (err) throw err;
    drawFrame(ctx, project, i / FPS, 1);
    const vf = new VideoFrame(canvas, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
    venc.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close();
    while (venc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 1));
    if (i % 10 === 0) { onProgress && onProgress(i / frames); await new Promise(r => setTimeout(r, 0)); }
  }
  await venc.flush(); venc.close();
  if (err) throw err;
  muxer.finalize();
  onProgress && onProgress(1);
  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), ext: 'mp4', note: !acodec ? 'sin-audio' : acodec.mux === 'opus' ? 'opus' : '' };
}

// Respaldo en tiempo real
async function exportRealtime(project, mix, { onProgress, signal, audioContext }) {
  const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
  if (!mime) throw new Error('Este navegador no puede exportar video. Usa Chrome, Edge o Safari actualizados.');
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const ac = audioContext || new AudioContext({ sampleRate: 48000 });
  if (ac.state !== 'running') await ac.resume();
  const dest = ac.createMediaStreamDestination();
  const src = ac.createBufferSource(); src.buffer = mix; src.connect(dest);
  const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(r => { rec.onstop = r; });
  drawFrame(ctx, project, 0, 1);
  rec.start(250); const t0 = ac.currentTime + 0.05; src.start(t0);
  await new Promise(resolve => {
    const tick = () => {
      const t = ac.currentTime - t0;
      if ((signal && signal.aborted) || t >= project.total) { resolve(); return; }
      drawFrame(ctx, project, Math.max(0, t), 1); onProgress && onProgress(t / project.total);
      requestAnimationFrame(tick);
    };
    tick();
  });
  rec.stop(); await done; src.stop(); if (!audioContext) ac.close();
  if (signal && signal.aborted) throw new DOMException('cancelado', 'AbortError');
  const ext = mime.includes('mp4') ? 'mp4' : 'webm';
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext, note: ext === 'webm' ? 'webm' : 'realtime' };
}
