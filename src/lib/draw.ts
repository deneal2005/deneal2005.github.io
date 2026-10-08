/**
 * Small, dependency-free drawing helpers shared by the hero scene and the
 * generated plates. Everything is deterministic: same seed, same print.
 */

export type Point = readonly [number, number];

/** Mulberry32: tiny seeded PRNG so every plate renders identically on every build. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const round = (n: number, p = 1) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const deg = (d: number) => (d * Math.PI) / 180;

/**
 * A halftone screen as SVG circles. `value(x, y)` returns ink coverage 0–1;
 * dots grow until neighbours touch and the area prints solid.
 */
export function halftone(opts: {
  x: number;
  y: number;
  width: number;
  height: number;
  step: number;
  angle?: number;
  value: (x: number, y: number) => number;
  /** Coverage below this is skipped entirely, keeping the markup light. */
  cutoff?: number;
  maxRadius?: number;
}) {
  const { x, y, width, height, step, angle = 45, value, cutoff = 0.04 } = opts;
  const maxRadius = opts.maxRadius ?? step * 0.71;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const cos = Math.cos(deg(angle));
  const sin = Math.sin(deg(angle));
  const reach = Math.hypot(width, height) / 2 + step;
  const circles: string[] = [];

  for (let v = -reach; v <= reach; v += step) {
    for (let u = -reach; u <= reach; u += step) {
      const px = cx + u * cos - v * sin;
      const py = cy + u * sin + v * cos;
      if (px < x - step || px > x + width + step || py < y - step || py > y + height + step) continue;
      const coverage = clamp(value(px, py));
      if (coverage < cutoff) continue;
      const r = maxRadius * Math.sqrt(coverage);
      circles.push(`<circle cx="${round(px)}" cy="${round(py)}" r="${round(r, 2)}"/>`);
    }
  }
  return circles.join('');
}

/** Catmull-Rom through points, emitted as cubic Béziers. */
export function smoothPath(points: Point[], closed = false) {
  if (points.length < 2) return '';
  const p = points;
  const at = (i: number) => (closed ? p[(i + p.length) % p.length] : p[Math.max(0, Math.min(p.length - 1, i))]);
  let d = `M${round(p[0][0])} ${round(p[0][1])}`;
  const last = closed ? p.length : p.length - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/**
 * A tapered brush stroke along a straight line, as a filled outline.
 * Pressure peaks at `peak` (0–1) and the edges wobble slightly, like a
 * loaded brush dragged fast.
 */
export function brushStroke(opts: {
  from: Point;
  to: Point;
  width: number;
  peak?: number;
  seed?: number;
  wobble?: number;
  segments?: number;
}) {
  const { from, to, width, peak = 0.4, seed = 7, wobble = 0.12, segments = 28 } = opts;
  const random = rng(seed);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Fast attack, long tail: rises to `peak`, then thins out.
    const pressure = t < peak ? Math.sin((t / peak) * (Math.PI / 2)) : Math.cos(((t - peak) / (1 - peak)) * (Math.PI / 2));
    const w = (width / 2) * Math.pow(Math.max(pressure, 0), 0.8) * (1 + (random() - 0.5) * wobble);
    const px = from[0] + dx * t;
    const py = from[1] + dy * t;
    left.push([px + nx * w, py + ny * w]);
    right.push([px - nx * w * (0.75 + random() * 0.25), py - ny * w * (0.75 + random() * 0.25)]);
  }
  return smoothPath([...left, ...right.reverse()], true);
}


/** The two halves of a circle split by a line through `through` at `angle` degrees. */
export function splitCircle(opts: { cx: number; cy: number; r: number; through: Point; angle: number; reach?: number }) {
  const { through, angle } = opts;
  const reach = opts.reach ?? opts.r * 4;
  const ux = Math.cos(deg(angle));
  const uy = Math.sin(deg(angle));
  const nx = -uy;
  const ny = ux;
  const a: Point = [through[0] - ux * reach, through[1] - uy * reach];
  const b: Point = [through[0] + ux * reach, through[1] + uy * reach];
  const plane = (sign: number) =>
    [a, b, [b[0] + nx * reach * sign, b[1] + ny * reach * sign], [a[0] + nx * reach * sign, a[1] + ny * reach * sign]]
      .map(([x, y]) => `${round(x)},${round(y)}`)
      .join(' ');
  return {
    /** Half-plane on the normal's negative side (above a downward-sloping cut). */
    upper: plane(-1),
    lower: plane(1),
    direction: [ux, uy] as Point,
    normal: [nx, ny] as Point,
  };
}
