/**
 * Plates are the volume's imagery: screen-print compositions generated from code
 * at build time and served as static SVG files from /plates/{name}-{a|b}.svg.
 * Variant "a" is the full plate; "b" is a detail crop of the same drawing.
 */

/** Mirrors the pigments in src/styles/tokens.css (SVG files can't read CSS variables). */
export const INK = {
  sumi: '#13110f',
  keshizumi: '#2a2622',
  usuzumi: '#a39b90',
  washi: '#ebe4d6',
  washiDeep: '#ddd4c2',
  gofun: '#f6f2ea',
  shu: '#da3b22',
  enji: '#8f1d21',
} as const;

export interface PlateDrawing {
  /** The ground the plate is printed on. */
  ground: 'washi' | 'sumi';
  defs?: string;
  body: string;
}

export interface Plate {
  width: number;
  height: number;
  /** Detail crop for variant "b": x, y, width, height in plate units. */
  detail: readonly [number, number, number, number];
  draw: () => PlateDrawing;
}

export type Variant = 'a' | 'b';

const grain = (ground: PlateDrawing['ground']) => {
  // Paper fibre on washi prints as dark specks; on sumi, the ink is flecked with paper.
  const [r, g, b] = ground === 'sumi' ? [0.92, 0.89, 0.84] : [0.07, 0.06, 0.05];
  return `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 2.3 -1.3"/></filter>`;
};

/** Hairline plate border and registration marks, as on a proof sheet. */
const proofMarks = (w: number, h: number, ground: PlateDrawing['ground']) => {
  const c = ground === 'sumi' ? INK.usuzumi : INK.sumi;
  const m = Math.round(Math.min(w, h) * 0.035);
  const tick = m * 0.7;
  const reg = (x: number, y: number) =>
    `<g stroke="${c}" stroke-width="1" fill="none" opacity="0.55"><circle cx="${x}" cy="${y}" r="${tick / 3}"/><path d="M${x - tick / 1.6} ${y}h${tick * 1.25}M${x} ${y - tick / 1.6}v${tick * 1.25}"/></g>`;
  return [
    `<rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="none" stroke="${c}" stroke-width="1" opacity="0.35"/>`,
    reg(m / 2, h / 2),
    reg(w - m / 2, h / 2),
  ].join('');
};

export function renderPlate(plate: Plate, variant: Variant) {
  const { width, height } = plate;
  const [vx, vy, vw, vh] = variant === 'b' ? plate.detail : [0, 0, width, height];
  const { ground, defs = '', body } = plate.draw();
  const bg = ground === 'sumi' ? INK.sumi : INK.washi;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">`,
    `<defs>${grain(ground)}${defs}</defs>`,
    `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg}"/>`,
    body,
    variant === 'a' ? proofMarks(width, height, ground) : '',
    `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" filter="url(#grain)" opacity="0.5"/>`,
    `</svg>`,
  ].join('');
}

export function plateSize(plate: Plate, variant: Variant) {
  return variant === 'b'
    ? { width: plate.detail[2], height: plate.detail[3] }
    : { width: plate.width, height: plate.height };
}
