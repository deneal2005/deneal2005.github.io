import { reducedMotion } from '../env';
import { fitCanvas } from './canvas';

/**
 * 点 Ten — the sun as a live halftone screen. Coverage comes from the disc, a
 * slow breathing ripple and a light source that follows the pointer.
 */
const SHU = '#c2a068';
const GOFUN = 'rgba(232, 225, 210, 0.42)';
const SUMI = '#060707';
const STEP = 11;

export function mount(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas');
  const toggle = root.querySelector<HTMLButtonElement>('[data-ten-toggle]');
  if (!canvas) return;

  let w = 0;
  let h = 0;
  const { ctx } = fitCanvas(canvas, (cw, ch) => {
    w = cw;
    h = ch;
    draw(time);
  });

  const light = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let time = 0;
  let paused = false;
  let visible = false;
  let raf = 0;

  function draw(t: number) {
    if (!w || !h) return;
    ctx.fillStyle = SUMI;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.34;
    const lx = light.x * w;
    const ly = light.y * h;
    const lr = Math.min(w, h) * 0.32;

    for (let row = 0, y = STEP / 2; y < h + STEP; y += STEP * 0.866, row++) {
      for (let x = row % 2 ? STEP : STEP / 2; x < w + STEP; x += STEP) {
        const d = Math.hypot(x - cx, y - cy);
        const glow = Math.exp(-(((x - lx) ** 2 + (y - ly) ** 2) / (2 * lr * lr)));
        let v: number;
        if (d < R) {
          v = 0.8 + 0.16 * Math.sin(d * 0.045 - t * 1.4) + glow * 0.3;
        } else {
          v = Math.max(0, 0.24 - (d - R) / (R * 1.4)) * (0.7 + 0.3 * Math.sin(d * 0.045 - t * 1.4)) + glow * 0.45;
        }
        if (v < 0.04) continue;
        const r = (STEP / 2) * Math.sqrt(Math.min(1, v));
        ctx.fillStyle = d < R ? SHU : GOFUN;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const animating = () => visible && !paused && !reducedMotion.matches;

  const frame = (now: number) => {
    time = now / 1000;
    light.x += (light.tx - light.x) * 0.08;
    light.y += (light.ty - light.y) * 0.08;
    draw(time);
    raf = animating() ? requestAnimationFrame(frame) : 0;
  };

  const start = () => {
    if (!raf && animating()) raf = requestAnimationFrame(frame);
  };

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    light.tx = (e.clientX - r.left) / r.width;
    light.ty = (e.clientY - r.top) / r.height;
    if (!animating()) {
      light.x = light.tx;
      light.y = light.ty;
      draw(time);
    }
  });

  canvas.addEventListener('pointerleave', () => {
    light.tx = 0.5;
    light.ty = 0.5;
  });

  toggle?.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play' : 'Pause';
    start();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(canvas);

  reducedMotion.addEventListener('change', start);
  if (toggle && reducedMotion.matches) toggle.hidden = true;
  draw(0);
}
