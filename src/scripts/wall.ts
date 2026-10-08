import { clamp, finePointer, onFrame, reducedMotion } from './env';

/**
 * 01 — The Wall. Scroll progress through the section drives one sequence,
 * reversibly: the opening shot hands over to the wall, tremors and cracks,
 * steam, the titan rising, the grip, the breach, the camera pulling back.
 *
 * Cost per frame is one layout read (the section's rect) and a dozen custom
 * properties on the section; every layer moves with transforms or opacity,
 * so the browser composites instead of repainting. Work happens only while
 * the section is on screen, and only while the eased value is still moving.
 *
 * The opening footage (local only) plays natively at its own frame rate. It
 * is never scrubbed: seeking a video per scroll frame is what made it stutter.
 * It loads only when the section is visible, and pauses as soon as it has
 * faded out or the section leaves the screen.
 */

const FOLLOW = 0.14; // fraction of the remaining distance the camera covers per frame

const smooth = (x: number) => x * x * (3 - 2 * x);
/** 0 → 1 across [a, b], eased. */
const seg = (p: number, a: number, b: number) => smooth(clamp((p - a) / (b - a)));
/** Rises across [a, b], holds, falls across [c, d]. */
const band = (p: number, a: number, b: number, c: number, d: number) => seg(p, a, b) * (1 - seg(p, c, d));
/** A short bump centred on c: a footstep, an impact. */
const pulse = (p: number, c: number, w: number) => Math.max(0, 1 - Math.abs(p - c) / w);

/** Footsteps getting closer, then the grip, then the breach. */
const IMPACTS: [at: number, width: number, strength: number][] = [
  [0.14, 0.025, 0.25],
  [0.2, 0.025, 0.4],
  [0.26, 0.025, 0.6],
  [0.32, 0.03, 0.8],
  [0.47, 0.04, 1],
  [0.6, 0.06, 1.4],
];

export function initWall() {
  const section = document.querySelector<HTMLElement>('[data-wall]');
  if (!section) return;

  const film = section.querySelector<HTMLVideoElement>('[data-wall-film]');
  const readout = section.querySelector<HTMLElement>('[data-wall-readout]');
  const hasFilm = Boolean(film);

  let visible = true;
  let target = 0;
  let shown = -1;
  let raf = 0;
  let lastReadout = '';

  const set = (name: string, value: number) => section.style.setProperty(name, value.toFixed(4));

  const paint = (p: number) => {
    // The footage holds the frame for the first scroll, then cuts to the wall.
    const film = hasFilm ? 1 - seg(p, 0.03, 0.12) : 0;
    const open = 1 - seg(p, 0.06, 0.13);

    let shake = 0;
    for (const [at, width, strength] of IMPACTS) shake = Math.max(shake, pulse(p, at, width) * strength);
    shake += band(p, 0.55, 0.6, 0.66, 0.72) * 0.5; // the breach keeps shaking
    const amp = reducedMotion.matches ? 0 : shake;

    set('--p', p);
    set('--film', film);
    section.toggleAttribute('data-filming', film > 0.999);
    section.toggleAttribute('data-filming-any', film > 0.001);
    set('--open', open);
    section.style.setProperty('--open-vis', open < 0.01 ? 'hidden' : 'visible');
    set('--cam', seg(p, 0.62, 0.92));
    section.style.setProperty('--shx', `${(Math.sin(p * 2300) * amp * 7).toFixed(2)}px`);
    section.style.setProperty('--shy', `${(Math.cos(p * 3100) * amp * 5).toFixed(2)}px`);
    set('--dust', band(p, 0.12, 0.18, 0.75, 0.85));
    // Cracks are drawn (painted), so they step in twentieths instead of repainting every frame.
    set('--crack', Math.round(seg(p, 0.22, 0.56) * 20) / 20);
    set('--steam', seg(p, 0.3, 0.46));
    set('--glow', seg(p, 0.12, 0.7));
    set('--rise', seg(p, 0.34, 0.86));
    set('--hand', clamp((p - 0.42) / 0.12));
    set('--frag', seg(p, 0.57, 0.74));
    set('--eyes', seg(p, 0.7, 0.78));
    set('--warn', band(p, 0.37, 0.41, 0.56, 0.6));
    set('--flash', Math.max(pulse(p, 0.42, 0.03) * 0.8, pulse(p, 0.6, 0.04), pulse(p, 0.47, 0.02) * 0.5));
    set('--fin', band(p, 0.84, 0.88, 0.94, 0.98));
    set('--end', seg(p, 0.95, 1));

    const pct = String(Math.round(p * 100)).padStart(3, '0');
    if (readout && pct !== lastReadout) {
      readout.textContent = pct;
      lastReadout = pct;
    }

    syncFilm(film);
  };

  const progress = () => {
    const span = section.offsetHeight - innerHeight;
    return span > 0 ? clamp(-section.getBoundingClientRect().top / span) : 0;
  };

  const tick = () => {
    raf = 0;
    const delta = target - shown;
    shown = shown < 0 || Math.abs(delta) < 0.0004 ? target : shown + delta * FOLLOW;
    paint(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  };

  // Reduced motion: the section is one screen, the scene already finished (CSS defaults).
  if (reducedMotion.matches) return;

  section.toggleAttribute('data-live', true);

  // Boot-up plays on the first visit of a session only.
  try {
    if (!sessionStorage.getItem('wall-booted')) {
      section.toggleAttribute('data-boot', true);
      sessionStorage.setItem('wall-booted', '1');
    }
  } catch {
    /* storage blocked: skip the boot sequence */
  }

  initPointer(section);
  onFrame(() => {
    if (!visible) return;
    target = progress();
    if (target !== shown && !raf) raf = requestAnimationFrame(tick);
  });

  // Dust and footage only run while the section is on screen.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    section.toggleAttribute('data-live', visible);
    if (!visible) film?.pause();
    else syncFilm(hasFilm ? 1 - seg(shown, 0.03, 0.12) : 0);
  }).observe(section);

  // ── The opening footage ─────────────────────────────
  let started = false;
  function syncFilm(opacity: number) {
    if (!film) return;
    const wanted = visible && opacity > 0.01;
    if (wanted && !started) start();
    else if (wanted && film.paused && film.readyState >= 2) film.play().catch(() => {});
    else if (!wanted && !film.paused) film.pause();
  }

  function start() {
    if (!film) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return; // the scene carries the opening on its own
    started = true;
    const small = matchMedia('(max-width: 47.99rem)').matches;
    film.src = (small ? film.dataset.srcSd : film.dataset.srcHd) ?? '';
    film.preload = 'auto';
    film.addEventListener('canplay', () => syncFilm(hasFilm ? 1 - seg(shown, 0.03, 0.12) : 0), { once: true });
    film.load();
  }
}

/**
 * Desktop only: the recon lamp follows the pointer, the world tilts a few
 * pixels against it, and the HUD reads out the grid square under it. One rAF
 * per pointer move, transforms only. Touch devices never run any of it.
 */
function initPointer(section: HTMLElement) {
  if (!finePointer.matches) return;
  const stage = section.querySelector<HTMLElement>('[data-wall-stage]');
  const grid = section.querySelector<HTMLElement>('[data-wall-grid]');
  if (!stage) return;

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let queued = false;
  let lastGrid = '';

  const apply = () => {
    queued = false;
    section.style.setProperty('--lx', `${x.toFixed(0)}px`);
    section.style.setProperty('--ly', `${y.toFixed(0)}px`);
    section.style.setProperty('--mx', ((x / innerWidth) * 2 - 1).toFixed(3));
    section.style.setProperty('--my', ((y / innerHeight) * 2 - 1).toFixed(3));
    const ref = `Grid ${String(Math.floor((x / innerWidth) * 16) + 1).padStart(2, '0')}-${String(Math.floor((y / innerHeight) * 9) + 1).padStart(2, '0')}`;
    if (grid && ref !== lastGrid) {
      grid.textContent = ref;
      lastGrid = ref;
    }
  };

  stage.addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(apply);
    }
  });
  stage.addEventListener('pointerenter', () => section.style.setProperty('--lamp', '1'));
  stage.addEventListener('pointerleave', () => section.style.setProperty('--lamp', '0'));
}
