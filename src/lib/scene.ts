/**
 * Geometry for "The Cut": a vermilion sun split by one stroke, and the
 * swordsman on the horizon beneath it. Parameterised so the same picture can
 * be drawn at other sizes and positions.
 */
import { FIGURE } from './figure';
import { brushStroke, halftone, round, smoothstep, splitCircle, type Point } from './draw';

export interface SceneOptions {
  sun?: { cx: number; cy: number; r: number };
  ground?: number;
  figureX?: number;
  figureScale?: number;
}

export function computeScene({
  sun = { cx: 520, cy: 430, r: 390 },
  ground = 850,
  figureX = 485,
  figureScale = 0.82,
}: SceneOptions = {}) {
  const k = sun.r / 390;
  const figureY = ground - FIGURE.height * figureScale;

  // The cut passes high, clear of the swordsman: his stroke is already over.
  const angle = 24;
  const through: Point = [sun.cx, sun.cy - 68 * k];
  const halves = splitCircle({ ...sun, through, angle, reach: sun.r * 5 });
  const [ux, uy] = halves.direction;
  const [nx, ny] = halves.normal;
  const cutFrom: Point = [through[0] - ux * 520 * k, through[1] - uy * 520 * k];
  const cutTo: Point = [through[0] + ux * 500 * k, through[1] + uy * 500 * k];
  const cut = brushStroke({ from: cutFrom, to: cutTo, width: 11 * k, peak: 0.36, seed: 11, wobble: 0.35, segments: 40 });

  // After the cut: the cap slides down its own face, the body of the sun settles.
  const gap = 8 * k;
  const slide = 15 * k;
  const upperShift = { x: round(-nx * gap + ux * slide), y: round(-ny * gap + uy * slide) };
  const lowerShift = { x: round(nx * gap * 0.5), y: round(ny * gap * 0.5) };

  // The lower edge of the sun dissolves into a halftone screen above the horizon.
  const fadeTop = sun.cy + sun.r * 0.46;
  const fadeBottom = sun.cy + sun.r;
  const sunDots = halftone({
    x: sun.cx - sun.r,
    y: fadeTop - 30 * k,
    width: sun.r * 2,
    height: fadeBottom - fadeTop + 50 * k,
    step: 17 * k,
    angle: 45,
    value: (x, y) =>
      (x - sun.cx) ** 2 + (y - sun.cy) ** 2 > sun.r ** 2 ? 0 : 1 - smoothstep(fadeTop + 10 * k, fadeBottom - 4 * k, y),
  });

  // The figure's shadow falls toward the reader, printed as a coarse screen.
  const feet = { left: figureX + 58 * figureScale, right: figureX + 226 * figureScale };
  const depth = 150 * k;
  const shadowDots = halftone({
    x: feet.left - 10,
    y: ground + 4,
    width: 260 * k,
    height: depth,
    step: 8 * k,
    angle: 15,
    value: (x, y) => {
      const t = (y - ground) / depth;
      if (x < feet.left + 6 + t * 30 * k || x > feet.right - 10 + t * 70 * k) return 0;
      return (1 - smoothstep(ground, ground + depth * 0.8, y)) * 0.34;
    },
  });

  return {
    sun,
    ground,
    halves,
    cut,
    cutLine: `M${round(cutFrom[0])} ${round(cutFrom[1])} L${round(cutTo[0])} ${round(cutTo[1])}`,
    upperShift,
    lowerShift,
    fadeTop,
    sunDots,
    shadowDots,
    figure: FIGURE,
    figureTransform: `translate(${round(figureX)} ${round(figureY)}) scale(${figureScale})`,
  };
}
