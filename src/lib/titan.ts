/**
 * Geometry for the opening sequence: the wall, the breach in it, the shards
 * that blow out, the cracks that run ahead of them, and the hand that grips
 * the parapet. Everything is drawn in one 1600 × 900 world (see Hero.astro),
 * so every layer lines up exactly.
 */
import { rng, round } from './draw';

type P = [number, number];

export const WORLD = { w: 1600, h: 900 };
/** The top of the parapet. Everything above it is sky; the titan rises past it. */
export const PARAPET = 412;

/** The breach, opened from behind at the titan's chest. */
const hole: P[] = [
  [700, 492],
  [748, 470],
  [806, 484],
  [862, 466],
  [922, 482],
  [940, 548],
  [926, 616],
  [868, 646],
  [806, 628],
  [744, 642],
  [702, 612],
  [688, 552],
];
const center: P = [812, 556];

const d = (pts: P[]) => `M${pts.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`;

/** A piece's box in world units, padded so strokes aren't cut. */
const box = (pts: P[], pad = 3) => {
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  const x = Math.floor(Math.min(...xs) - pad);
  const y = Math.floor(Math.min(...ys) - pad);
  return { x, y, w: Math.ceil(Math.max(...xs) + pad) - x, h: Math.ceil(Math.max(...ys) + pad) - y };
};

/** The wall's face as one path with the breach cut out (fill-rule evenodd). */
export const wallFace = `M-120 ${PARAPET + 22}H1720V1000H-120Z${d(hole)}`;
export const holePath = d(hole);

/**
 * Shards that fill the breach exactly, so the wall reads whole until they move.
 * Each flies out toward the viewer and falls: dx/dy in world units, r in degrees,
 * delay as a fraction of the breach window.
 */
export const shards = hole.map((p, i) => {
  const q = hole[(i + 1) % hole.length];
  const mid: P = [(p[0] + q[0] + center[0]) / 3, (p[1] + q[1] + center[1]) / 3];
  const out = [mid[0] - center[0], mid[1] - center[1]];
  const len = Math.hypot(out[0], out[1]) || 1;
  const random = rng(11 + i * 7);
  return {
    d: d([p, q, center]),
    box: box([p, q, center]),
    dx: round((out[0] / len) * (120 + random() * 160)),
    dy: round(260 + random() * 260 + (out[1] > 0 ? 120 : 0)),
    r: round((random() - 0.5) * 140),
    delay: round(random() * 0.35, 2),
  };
});

/** Small chips of stone that rain from the breach with the shards. */
export const chips = Array.from({ length: 14 }, (_, i) => {
  const random = rng(101 + i * 13);
  const x = 700 + random() * 240;
  const y = 470 + random() * 170;
  const s = 6 + random() * 12;
  const pts: P[] = [
    [x, y],
    [x + s, y + s * 0.2],
    [x + s * 0.8, y + s],
    [x - s * 0.1, y + s * 0.7],
  ];
  return {
    d: d(pts),
    box: box(pts),
    dx: round((x - center[0]) * (0.8 + random())),
    dy: round(320 + random() * 380),
    r: round((random() - 0.5) * 400),
    delay: round(random() * 0.5, 2),
  };
});

/** Jagged cracks running out from the breach and from under the grip. */
const crack = (from: P, angle: number, length: number, seed: number) => {
  const random = rng(seed);
  const pts: P[] = [from];
  let [x, y] = from;
  let a = angle;
  const steps = Math.max(4, Math.round(length / 26));
  for (let i = 0; i < steps; i++) {
    a += (random() - 0.5) * 0.9;
    const step = length / steps;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    pts.push([x, y]);
  }
  return `M${pts.map(([px, py]) => `${round(px)} ${round(py)}`).join('L')}`;
};

export const cracks = [
  crack([700, 492], Math.PI * 1.05, 210, 3),
  crack([748, 470], -Math.PI * 0.6, 70, 5),
  crack([862, 466], -Math.PI * 0.45, 60, 7),
  crack([940, 548], -0.15, 260, 9),
  crack([926, 616], 0.55, 240, 13),
  crack([744, 642], Math.PI * 0.62, 230, 17),
  crack([688, 552], Math.PI * 0.95, 160, 19),
  crack([868, 646], Math.PI * 0.4, 200, 23),
  // under the fingers
  crack([590, 470], Math.PI * 0.55, 140, 29),
  crack([668, 486], Math.PI * 0.35, 120, 31),
];

/**
 * The grip: the back of a hand rising behind the parapet, and four fingers
 * hooked over it, bent at the edge and pressing into the face of the wall.
 * We see their backs, so the nails are at the bottom, facing us.
 */
export const handBack = `M528 ${PARAPET + 4}C524 ${PARAPET - 40} 560 ${PARAPET - 78} 640 ${PARAPET - 86}C716 ${PARAPET - 92} 748 ${PARAPET - 56} 744 ${PARAPET + 4}Z`;

export const fingers = [
  { x: 536, w: 44, len: 92, lean: -6 },
  { x: 582, w: 50, len: 128, lean: -2 },
  { x: 634, w: 50, len: 120, lean: 3 },
  { x: 686, w: 42, len: 86, lean: 8 },
].map(({ x, w, len, lean }) => {
  const knuckle = PARAPET - 22;
  const edge = PARAPET + 8;
  const bottom = PARAPET + 22 + len;
  const tip = w * 0.42; // fingers taper toward the tip
  const bx = x + lean; // the fingertip drifts a little sideways
  const inset = (w - tip * 2) / 2;
  return {
    // knuckle hump over the parapet, then down the face to a rounded tip
    d: `M${x} ${edge}C${x - 2} ${knuckle} ${x + w + 2} ${knuckle} ${x + w} ${edge}C${x + w - 1} ${edge + len * 0.4} ${bx + w - inset} ${bottom - tip} ${bx + w - inset} ${bottom}C${bx + w - inset} ${bottom + tip * 1.2} ${bx + inset} ${bottom + tip * 1.2} ${bx + inset} ${bottom}C${bx + inset} ${bottom - tip} ${x + 1} ${edge + len * 0.4} ${x} ${edge}Z`,
    knuckle: `M${x + 6} ${PARAPET - 8}C${x + w * 0.3} ${knuckle + 2} ${x + w * 0.7} ${knuckle + 2} ${x + w - 6} ${PARAPET - 8}`,
    nail: `M${bx + inset + 5} ${bottom - 4}C${bx + inset + 5} ${bottom + tip * 0.85} ${bx + w - inset - 5} ${bottom + tip * 0.85} ${bx + w - inset - 5} ${bottom - 4}Z`,
    creases: [edge + 6, edge + len * 0.55].map((y) => {
      const t = (y - edge) / (bottom - edge);
      const l = x + (bx + inset - x) * t + 6;
      const r = x + w + (bx + w - inset - (x + w)) * t - 6;
      return `M${round(l)} ${round(y)}Q${round((l + r) / 2)} ${round(y + 4)} ${round(r)} ${round(y)}`;
    }),
  };
});

/** Cannons and lookouts along the parapet: the only things on the wall at human scale. */
export const posts = Array.from({ length: 9 }, (_, i) => {
  const x = 60 + i * 190;
  return { x, soldier: i % 3 === 1 };
});
