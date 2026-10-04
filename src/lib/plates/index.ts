import { brushStroke, halftone, rng, round, smoothstep } from '../draw';
import { INK, type Plate } from './shared';

export { renderPlate, plateSize, type Plate, type Variant } from './shared';

/** 01 — Meridian House: a colonnade in front of a low sun, its reflection on polished stone. */
const meridian: Plate = {
  width: 800,
  height: 1000,
  detail: [150, 330, 500, 375],
  draw: () => {
    const sun = { cx: 400, cy: 610, r: 168 };
    const beam = 128;
    const slab = { top: 700, height: 56 };
    // An even facade rhythm with one interval left open around the sun: 間.
    const columns = [104, 148, 192, 236, 564, 608, 652, 696]
      .map((x, i) => `<rect x="${x - (i % 2 ? 2 : 3.5)}" y="${beam}" width="${i % 2 ? 4 : 7}" height="${slab.top - beam}"/>`)
      .join('');
    const reflection = halftone({
      x: 130,
      y: slab.top + slab.height + 8,
      width: 540,
      height: 210,
      step: 11,
      angle: 0,
      value: (x, y) => {
        const spread = Math.abs(x - sun.cx) / (sun.r * (1.05 - (y - 764) / 900));
        if (spread > 1) return 0;
        const depth = (y - (slab.top + slab.height)) / 210;
        return (1 - spread ** 2) * (1 - depth) * (0.62 + 0.38 * Math.sin(y * 0.3));
      },
    });
    return {
      ground: 'washi',
      defs: `<clipPath id="above-slab"><rect width="800" height="${slab.top}"/></clipPath>`,
      body: [
        `<circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r}" fill="${INK.shu}" clip-path="url(#above-slab)"/>`,
        `<g fill="${INK.sumi}">${columns}<rect x="98" y="${beam - 6}" width="605" height="6"/><rect x="58" y="${slab.top}" width="684" height="${slab.height}"/></g>`,
        `<g fill="${INK.shu}">${reflection}</g>`,
      ].join(''),
    };
  },
};

/** 02 — Salt & Silence: a single drop on still black water. */
const salt: Plate = {
  width: 1200,
  height: 800,
  detail: [560, 300, 440, 260],
  draw: () => {
    const c = { x: 770, y: 420 };
    const rings = Array.from({ length: 24 }, (_, n) => {
      const r = 26 + Math.pow(n, 1.42) * 17;
      const w = Math.max(0.6, 2.1 - n * 0.065);
      const o = Math.max(0.12, 0.92 - n * 0.034);
      return `<ellipse cx="${c.x}" cy="${c.y}" rx="${round(r)}" ry="${round(r * 0.34)}" stroke-width="${round(w, 2)}" opacity="${round(o, 2)}"/>`;
    }).join('');
    const mist = halftone({
      x: 0,
      y: 360,
      width: 820,
      height: 440,
      step: 10,
      angle: 30,
      value: (x, y) => (1 - x / 820) * smoothstep(380, 800, y) * 0.55,
    });
    return {
      ground: 'sumi',
      body: [
        `<g fill="none" stroke="${INK.gofun}">${rings}</g>`,
        `<ellipse cx="${c.x}" cy="${c.y}" rx="16" ry="5.5" fill="none" stroke="${INK.shu}" stroke-width="2"/>`,
        `<circle cx="${c.x}" cy="${c.y - 3}" r="5" fill="${INK.shu}"/>`,
        `<g fill="${INK.gofun}" opacity="0.75">${mist}</g>`,
      ].join(''),
    };
  },
};

/** 03 — One Thousand Folds: an accordion-pleated sheet, one crease in vermilion. */
const folds: Plate = {
  width: 1000,
  height: 1000,
  detail: [470, 300, 420, 420],
  draw: () => {
    const pleat = 72;
    const count = 10;
    const half = (pleat * count) / 2;
    const top = (k: number) => -320 + (k % 2 ? 26 : 0);
    const bottom = (k: number) => 320 - (k % 2 ? 26 : 0);
    const faces: string[] = [];
    const shade: string[] = [];
    for (let i = 0; i < count; i++) {
      const x0 = -half + i * pleat;
      const x1 = x0 + pleat;
      const pts = `${x0},${top(i)} ${x1},${top(i + 1)} ${x1},${bottom(i + 1)} ${x0},${bottom(i)}`;
      faces.push(`<polygon points="${pts}" fill="${i % 2 ? INK.washiDeep : INK.gofun}"/>`);
      if (i % 2) shade.push(`<polygon points="${pts}" fill="url(#screen)"/>`);
    }
    const outline = [
      ...Array.from({ length: count + 1 }, (_, k) => `${-half + k * pleat},${top(k)}`),
      ...Array.from({ length: count + 1 }, (_, k) => `${half - k * pleat},${bottom(count - k)}`),
    ].join(' ');
    const crease = Array.from({ length: count + 1 }, (_, k) => `${-half + k * pleat},${48 + (k % 2 ? 9 : 0)}`).join(' ');
    return {
      ground: 'washi',
      defs: [
        `<pattern id="screen" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3.5" cy="3.5" r="1.45" fill="${INK.sumi}"/></pattern>`,
        `<pattern id="shadow" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="4.5" cy="4.5" r="1.9" fill="${INK.sumi}"/></pattern>`,
      ].join(''),
      body: [
        `<g transform="translate(500 520) rotate(-10)">`,
        `<polygon points="${outline}" transform="translate(26 30)" fill="url(#shadow)" opacity="0.55"/>`,
        faces.join(''),
        `<g opacity="0.5">${shade.join('')}</g>`,
        `<polygon points="${outline}" fill="none" stroke="${INK.sumi}" stroke-width="2.5" stroke-linejoin="round"/>`,
        `<polyline points="${crease}" fill="none" stroke="${INK.shu}" stroke-width="5" stroke-linejoin="round"/>`,
        `</g>`,
      ].join(''),
    };
  },
};

/** 04 — Kage Grotesk: a letter and the shadow it casts, out of register. */
const kage: Plate = {
  width: 1600,
  height: 900,
  detail: [700, 260, 560, 420],
  draw: () => {
    const k = [
      `<rect x="560" y="-80" width="250" height="1120"/>`,
      `<polygon points="810,620 810,330 1240,-80 1580,-80"/>`,
      `<polygon points="930,455 1130,300 1700,1040 1370,1040"/>`,
    ].join('');
    const guide = (y: number) =>
      `<path d="M60 ${y}H1540" stroke="${INK.sumi}" stroke-width="1" opacity="0.32"/><path d="M60 ${y - 8}v16M1540 ${y - 8}v16" stroke="${INK.sumi}" stroke-width="1" opacity="0.5"/>`;
    return {
      ground: 'washi',
      body: [
        guide(140),
        guide(420),
        guide(770),
        `<g fill="${INK.shu}" transform="translate(64 30)">${k}</g>`,
        `<g fill="${INK.sumi}">${k}</g>`,
        // construction marks: an on-curve node and its handle
        `<g stroke="${INK.sumi}" stroke-width="1.5"><path d="M930 455L1020 384"/></g>`,
        `<rect x="1013" y="377" width="14" height="14" fill="${INK.washi}" stroke="${INK.sumi}" stroke-width="1.5"/>`,
        `<circle cx="930" cy="455" r="9" fill="${INK.washi}" stroke="${INK.shu}" stroke-width="2.5"/>`,
      ].join(''),
    };
  },
};

/** 05 — Low Tide Records: a sun half sunk, the sea as a printed waveform. */
const lowtide: Plate = {
  width: 800,
  height: 1000,
  detail: [140, 420, 520, 390],
  draw: () => {
    const water = 480;
    const sun = { cx: 400, cy: water, r: 178 };
    const random = rng(17);
    const rows: { reflect: string[]; sea: string[] } = { reflect: [], sea: [] };
    for (let y = water + 16, j = 0; y < 968; y += 15, j++) {
      const freq = 0.012 + random() * 0.02;
      const phase = random() * Math.PI * 2;
      const depth = (y - water) / 500;
      const width = sun.r * (1 - depth * 0.45);
      for (let x = 12; x < 800; x += 12) {
        const swell = 0.5 + 0.5 * Math.sin(x * freq + phase + j * 0.4);
        const r = 5.4 * swell * (1 - depth * 0.55);
        if (r < 0.6) continue;
        const dot = `<circle cx="${x}" cy="${y}" r="${round(r, 2)}"/>`;
        (Math.abs(x - sun.cx) < width ? rows.reflect : rows.sea).push(dot);
      }
    }
    return {
      ground: 'sumi',
      defs: `<clipPath id="sky"><rect width="800" height="${water}"/></clipPath>`,
      body: [
        `<circle cx="${sun.cx + 6}" cy="${sun.cy + 4}" r="${sun.r}" fill="${INK.enji}" clip-path="url(#sky)"/>`,
        `<circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r}" fill="${INK.shu}" clip-path="url(#sky)"/>`,
        `<rect x="40" y="${water - 1.5}" width="720" height="3" fill="${INK.gofun}"/>`,
        `<g fill="${INK.shu}">${rows.reflect.join('')}</g>`,
        `<g fill="${INK.gofun}" opacity="0.62">${rows.sea.join('')}</g>`,
      ].join(''),
    };
  },
};

/** Chapter 04 — a self-portrait, as a sunrise through haze. */
const sunrise: Plate = {
  width: 800,
  height: 1000,
  detail: [160, 300, 480, 480],
  draw: () => {
    const horizon = 760;
    const sun = { cx: 400, cy: 760, r: 520 };
    const dots = halftone({
      x: sun.cx - sun.r,
      y: sun.cy - sun.r,
      width: sun.r * 2,
      height: horizon - (sun.cy - sun.r),
      step: 17,
      angle: 45,
      value: (x, y) =>
        (x - sun.cx) ** 2 + (y - sun.cy) ** 2 > sun.r ** 2 ? 0 : 0.1 + 0.9 * smoothstep(sun.cy - sun.r + 20, horizon - 60, y),
    });
    const line = brushStroke({ from: [0, horizon], to: [800, horizon], width: 10, peak: 0.42, seed: 23, wobble: 0.4, segments: 36 });
    return {
      ground: 'washi',
      defs: `<clipPath id="above"><rect width="800" height="${horizon}"/></clipPath>`,
      body: [`<g fill="${INK.shu}" clip-path="url(#above)">${dots}</g>`, `<path d="${line}" fill="${INK.sumi}"/>`].join(''),
    };
  },
};

export const plates = { meridian, salt, folds, kage, lowtide, sunrise } satisfies Record<string, Plate>;
export type PlateName = keyof typeof plates;

export const plateUrl = (name: PlateName, variant: 'a' | 'b' = 'a') => `/plates/${name}-${variant}.svg`;
