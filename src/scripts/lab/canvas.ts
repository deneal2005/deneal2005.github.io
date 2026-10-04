/** Shared canvas plumbing for the studies: DPR-aware sizing that follows the element. */
export function fitCanvas(canvas: HTMLCanvasElement, onResize: (w: number, h: number) => void) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const apply = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize(width, height);
  };

  // ResizeObserver reports the initial size too, after the caller has its context.
  new ResizeObserver(apply).observe(canvas);
  return { ctx, dpr };
}

/** Reads the real family name Astro registered for a font variable, for use in ctx.font. */
export function fontFamily(cssVariable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
  return value || fallback;
}
