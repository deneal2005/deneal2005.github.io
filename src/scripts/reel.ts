import { clamp, onFrame, reducedMotion } from './env';

/**
 * The opening reel: scroll position drives playback position.
 *
 * The reel never plays on its own. Each frame, the target time is the hero's
 * scroll progress × the reel's duration; the shown time eases toward it
 * (a critically damped follow, so fast flicks stay smooth and slow scrolls
 * stay exact) and the video seeks there. Seeks never queue: while the decoder
 * is busy we keep easing, and the next free frame jumps to wherever the
 * scroll is now.
 *
 * The file is fetched whole into memory before the first seek, so scrubbing
 * never waits on the network. The encode puts a keyframe every 6 frames,
 * which keeps any seek to at most a handful of decoded frames.
 */

const FPS = 24;
const FOLLOW = 0.16; // fraction of the remaining distance covered each frame
const FADE = 0.035; // beat fade length, as a fraction of the reel

interface Beat {
  el: HTMLElement;
  in: number;
  out: number;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export function initReel() {
  const reel = document.querySelector<HTMLElement>('[data-reel]');
  if (!reel) return;

  const video = reel.querySelector<HTMLVideoElement>('[data-reel-video]');
  const timecode = reel.querySelector<HTMLElement>('[data-reel-tc]');
  const status = reel.querySelector<HTMLElement>('[data-reel-status]');
  const next = reel.querySelector<HTMLElement>('[data-reel-next]');
  const beats: Beat[] = [...reel.querySelectorAll<HTMLElement>('[data-beat]')].map((el) => ({
    el,
    in: Number(el.dataset.in),
    out: Number(el.dataset.out),
  }));

  let target = 0;
  let shown = -1;
  let raf = 0;
  let ready = false;
  // Until the reel reports its length (or with no reel at all), the timecode runs on a nominal one.
  let duration = Number(reel.dataset.duration) || 60;

  const progress = () => {
    const span = reel.offsetHeight - innerHeight;
    return span > 0 ? clamp(-reel.getBoundingClientRect().top / span) : 0;
  };

  const tc = (seconds: number) => {
    const f = Math.floor(seconds * FPS);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `00:${pad(Math.floor(f / FPS / 60))}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
  };

  /** Everything that depends on progress: beats, letterbox, end fade, timecode, the seek. */
  const paint = (p: number) => {
    reel.style.setProperty('--p', p.toFixed(4));
    reel.style.setProperty('--bars', smooth(clamp((p - 0.06) / 0.05) * (1 - clamp((p - 0.82) / 0.05))).toFixed(3));

    for (const beat of beats) {
      const o = beat.in < 0 ? 1 - clamp((p - (beat.out - FADE)) / FADE) : clamp((p - beat.in) / FADE) * (1 - clamp((p - (beat.out - FADE)) / FADE));
      const t = beat.in < 0 ? 0 : clamp((p - beat.in) / (beat.out - beat.in));
      const value = smooth(o);
      beat.el.style.setProperty('--o', value.toFixed(3));
      beat.el.style.setProperty('--t', t.toFixed(3));
      // Hidden beats leave the accessibility tree and the tab order (the opening holds real links).
      beat.el.style.setProperty('--vis', value < 0.01 ? 'hidden' : 'visible');
    }

    if (timecode) timecode.textContent = `${tc(p * duration)} / ${tc(duration)}`;
    next?.toggleAttribute('data-idle', p < 0.002);
    seek();
  };

  const seek = () => {
    if (!video || !ready || video.seeking) return;
    const t = clamp(shown, 0, 1) * Math.max(0, duration - 1 / FPS);
    if (Math.abs(video.currentTime - t) >= 0.5 / FPS) video.currentTime = t;
  };

  const tick = () => {
    raf = 0;
    const delta = target - shown;
    shown = Math.abs(delta) < 0.0002 || reducedMotion.matches || shown < 0 ? target : shown + delta * FOLLOW;
    paint(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  onFrame(() => {
    target = reducedMotion.matches ? 0 : progress();
    // The fade to black follows the scroll exactly, so the frame is dark before it ever leaves.
    reel.style.setProperty('--end', smooth(clamp((target - 0.93) / 0.06)).toFixed(3));
    if (target !== shown) wake();
  });

  // ── Loading ────────────────────────────────────────────
  if (!video || reducedMotion.matches) return;

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) return; // the poster carries the hero

  const small = matchMedia('(max-width: 47.99rem)').matches;
  const url = (small ? video.dataset.srcSd : video.dataset.srcHd) ?? video.dataset.srcHd;
  if (!url) return;

  const setStatus = (text: string) => {
    if (status) status.textContent = text;
  };

  // The decoder finished a seek: if the scroll moved meanwhile, catch up now.
  video.addEventListener('seeked', () => {
    const t = clamp(shown, 0, 1) * duration;
    if (Math.abs(video.currentTime - t) >= 0.5 / FPS) seek();
  });

  const start = () => {
    duration = video.duration || duration;
    ready = true;
    setStatus('');
    reel.toggleAttribute('data-reel-ready', true);
    // iOS only paints seeks after the element has played once; it's muted, so this is allowed.
    video.play().then(() => {
      video.pause();
      seek();
    }, seek);
  };

  const attach = (src: string) => {
    video.addEventListener('loadeddata', start, { once: true });
    video.src = src;
    video.load();
  };

  const load = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error(String(response.status));
      const total = Number(response.headers.get('content-length')) || 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setStatus(` · Loading ${Math.round((received / total) * 100)}%`);
      }
      attach(URL.createObjectURL(new Blob(chunks as BlobPart[], { type: 'video/mp4' })));
    } catch {
      // Streaming still scrubs, just less smoothly on a slow connection.
      video.preload = 'auto';
      attach(url);
    }
  };

  // Start fetching once the browser has painted the opening.
  if (document.readyState === 'complete') load();
  else addEventListener('load', () => load(), { once: true });
}
