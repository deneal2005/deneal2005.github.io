/** Shared runtime conditions and a single rAF-batched scroll/resize loop. */

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

type FrameCallback = () => void;
const callbacks = new Set<FrameCallback>();
let queued = false;

const flush = () => {
  queued = false;
  for (const cb of callbacks) cb();
};

const request = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
};

addEventListener('scroll', request, { passive: true });
addEventListener('resize', request, { passive: true });

/** Run `cb` once now and then at most once per frame while the page scrolls or resizes. */
export function onFrame(cb: FrameCallback) {
  callbacks.add(cb);
  request();
  return () => callbacks.delete(cb);
}
