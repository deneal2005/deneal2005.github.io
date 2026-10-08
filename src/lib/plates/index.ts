import { brushStroke, halftone, rng, round, smoothstep } from '../draw';
import { INK, type Plate } from './shared';

export { renderPlate, plateSize, type Plate, type Variant } from './shared';

/** GreenUP: a sapling on a globe printed in ink dots, pinned where actions were logged. */
const greenup: Plate = {
  width: 800,
  height: 1000,
  detail: [150, 230, 500, 375],
  draw: () => {
    const globe = { cx: 400, cy: 540, r: 290 };
    const spin = 2.3;
    // Abstract continents: layered waves over latitude and longitude, with seeded phases.
    const random = rng(8);
    const phases = Array.from({ length: 8 }, () => random() * Math.PI * 2);
    const land = (lat: number, lon: number) => {
      let v = 0;
      for (let o = 0, amp = 1, f = 1.4; o < 4; o++, amp *= 0.55, f *= 2.05) {
        v += amp * Math.sin(lon * f * 1.3 + phases[o]) * Math.cos(lat * f + phases[o + 4]);
      }
      return v > 0.12;
    };
    const sphere = (x: number, y: number) => {
      const nx = (x - globe.cx) / globe.r;
      const ny = (y - globe.cy) / globe.r;
      const d = nx * nx + ny * ny;
      if (d > 1) return null;
      const nz = Math.sqrt(1 - d);
      return { nx, ny, nz, lat: Math.asin(-ny), lon: Math.atan2(nx, nz) + spin };
    };
    // Land prints as distinct dots (coverage below the merge point); sea as a faint screen.
    const dots = halftone({
      x: globe.cx - globe.r,
      y: globe.cy - globe.r,
      width: globe.r * 2,
      height: globe.r * 2,
      step: 11,
      angle: 30,
      value: (x, y) => {
        const p = sphere(x, y);
        if (!p) return 0;
        const light = Math.max(0, -0.45 * p.nx - 0.55 * p.ny + 0.7 * p.nz);
        const base = land(p.lat, p.lon) ? 0.26 + 0.22 * light : 0.045 + 0.02 * light;
        return base * (0.55 + 0.45 * p.nz);
      },
    });
    // Graticule: a few parallels and meridians as hairlines, so it reads as a globe.
    const graticule = [
      ...[-0.5, 0, 0.5].map((t) => {
        const y = globe.cy - t * globe.r;
        const rx = globe.r * Math.sqrt(1 - t * t);
        return `<ellipse cx="${globe.cx}" cy="${round(y)}" rx="${round(rx)}" ry="${round(rx * 0.12)}"/>`;
      }),
      ...[0.38, 0.8].map((k) => `<ellipse cx="${globe.cx}" cy="${globe.cy}" rx="${round(globe.r * k)}" ry="${globe.r}"/>`),
    ].join('');
    // Pins only on land, facing the viewer, never crowding each other.
    const pins: { x: number; y: number }[] = [];
    for (let tries = 0; pins.length < 7 && tries < 600; tries++) {
      const x = globe.cx + (random() - 0.5) * globe.r * 1.6;
      const y = globe.cy + (random() - 0.5) * globe.r * 1.6;
      const p = sphere(x, y);
      if (!p || p.nz < 0.4 || !land(p.lat, p.lon)) continue;
      if (pins.some((q) => Math.hypot(q.x - x, q.y - y) < 70)) continue;
      pins.push({ x, y });
    }
    const pinMarks = pins
      .map(
        ({ x, y }) =>
          `<circle cx="${round(x)}" cy="${round(y)}" r="13" fill="${INK.washi}" stroke="${INK.shu}" stroke-width="2.5"/><circle cx="${round(x)}" cy="${round(y)}" r="5.5" fill="${INK.shu}"/>`,
      )
      .join('');
    const shadow = halftone({
      x: 160,
      y: 860,
      width: 480,
      height: 70,
      step: 9,
      angle: 0,
      value: (x, y) => Math.max(0, 1 - ((x - 400) / 240) ** 2 - ((y - 895) / 30) ** 2) * 0.32,
    });
    const top = globe.cy - globe.r;
    return {
      ground: 'washi',
      body: [
        `<g fill="${INK.sumi}">${shadow}</g>`,
        `<g fill="${INK.sumi}">${dots}</g>`,
        `<g fill="none" stroke="${INK.sumi}" stroke-width="1" opacity="0.28">${graticule}</g>`,
        `<circle cx="${globe.cx}" cy="${globe.cy}" r="${globe.r}" fill="none" stroke="${INK.sumi}" stroke-width="1.5" opacity="0.7"/>`,
        pinMarks,
        // the sapling
        `<g fill="${INK.sumi}"><path d="M397 ${top + 2} C393 ${top - 26} 396 ${top - 52} 402 ${top - 74} L407 ${top - 73} C402 ${top - 50} 400 ${top - 26} 404 ${top + 2} Z"/>`,
        `<path d="M401 ${top - 40} C380 ${top - 64} 350 ${top - 64} 338 ${top - 52} C352 ${top - 34} 382 ${top - 30} 401 ${top - 40} Z"/>`,
        `<path d="M404 ${top - 62} C424 ${top - 92} 458 ${top - 96} 472 ${top - 84} C458 ${top - 62} 428 ${top - 54} 404 ${top - 62} Z"/></g>`,
      ].join(''),
    };
  },
};

/** RentMate: the verification seal, six checks, over a city at night. */
const rentmate: Plate = {
  width: 1200,
  height: 800,
  detail: [560, 70, 540, 360],
  draw: () => {
    const seal = { cx: 800, cy: 330, r: 205 };
    const ground = 712;
    const random = rng(41);
    const polar = (r: number, deg: number) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return [round(seal.cx + Math.cos(a) * r), round(seal.cy + Math.sin(a) * r)] as const;
    };

    // Six checks, one notch each, like the seal in the product.
    const notches = Array.from({ length: 6 }, (_, i) => {
      const [x1, y1] = polar(seal.r, i * 60 + 4);
      const [x2, y2] = polar(seal.r, i * 60 + 56);
      return `<path d="M${x1} ${y1} A${seal.r} ${seal.r} 0 0 1 ${x2} ${y2}"/>`;
    }).join('');
    const ticks = Array.from({ length: 72 }, (_, i) => {
      const [x1, y1] = polar(seal.r + 26, i * 5);
      const [x2, y2] = polar(seal.r + (i % 6 === 0 ? 40 : 32), i * 5);
      return `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;
    }).join('');

    // A low glow around the seal, printed as a halftone screen.
    const reach = seal.r + 200;
    const glow = halftone({
      x: seal.cx - reach,
      y: Math.max(0, seal.cy - reach),
      width: reach * 2,
      height: ground - Math.max(0, seal.cy - reach),
      step: 13,
      angle: 45,
      value: (x, y) => {
        const d = Math.hypot(x - seal.cx, y - seal.cy);
        if (d < seal.r + 46) return 0;
        return Math.max(0, 1 - (d - seal.r - 46) / 154) ** 1.4 * 0.42;
      },
    });

    // The city: blocks along the ground, a few windows lit, one in vermilion.
    const blocks: string[] = [];
    const windows: string[] = [];
    let lit = '';
    for (let x = 30; x < 1170; ) {
      const w = 46 + Math.floor(random() * 80);
      const h = (90 + Math.floor(random() * 230)) * (Math.abs(x + w / 2 - seal.cx) < 260 ? 0.55 : 1);
      blocks.push(`<rect x="${x}" y="${round(ground - h)}" width="${w - 6}" height="${round(h)}"/>`);
      for (let wy = ground - h + 14; wy < ground - 18; wy += 22) {
        for (let wx = x + 9; wx < x + w - 16; wx += 15) {
          const r = random();
          if (r > 0.9 && !lit && wy < ground - 80) lit = `<rect x="${wx}" y="${round(wy)}" width="7" height="11" fill="${INK.shu}"/>`;
          else if (r > 0.72) windows.push(`<rect x="${wx}" y="${round(wy)}" width="7" height="11"/>`);
        }
      }
      x += w;
    }

    const check = [
      brushStroke({ from: [seal.cx - 88, seal.cy + 2], to: [seal.cx - 22, seal.cy + 70], width: 26, peak: 0.55, seed: 3, wobble: 0.25, segments: 16 }),
      brushStroke({ from: [seal.cx - 30, seal.cy + 70], to: [seal.cx + 104, seal.cy - 92], width: 30, peak: 0.3, seed: 6, wobble: 0.3, segments: 24 }),
    ];

    return {
      ground: 'sumi',
      body: [
        `<g fill="${INK.shu}" opacity="0.85">${glow}</g>`,
        `<g fill="${INK.keshizumi}">${blocks.join('')}</g>`,
        `<g fill="${INK.gofun}" opacity="0.5">${windows.join('')}</g>`,
        lit,
        `<rect x="0" y="${ground}" width="1200" height="2" fill="${INK.usuzumi}" opacity="0.6"/>`,
        `<circle cx="${seal.cx}" cy="${seal.cy}" r="${seal.r - 34}" fill="${INK.night}"/>`,
        `<g fill="none" stroke="${INK.shu}" stroke-width="30">${notches}</g>`,
        `<g fill="none" stroke="${INK.usuzumi}" stroke-width="1.5" opacity="0.7">${ticks}</g>`,
        `<circle cx="${seal.cx}" cy="${seal.cy}" r="${seal.r - 34}" fill="none" stroke="${INK.gofun}" stroke-width="1" opacity="0.35"/>`,
        `<g fill="${INK.gofun}">${check.map((d) => `<path d="${d}"/>`).join('')}</g>`,
      ].join(''),
    };
  },
};

/** Chapter 01 portrait, until a photo is set in profile.ts: a sunrise through haze. */
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
      body: [`<g fill="${INK.enji}" clip-path="url(#above)">${dots}</g>`, `<path d="${line}" fill="${INK.sumi}"/>`].join(''),
    };
  },
};

export const plates = { greenup, rentmate, sunrise } satisfies Record<string, Plate>;
export type PlateName = keyof typeof plates;

export const plateUrl = (name: PlateName, variant: 'a' | 'b' = 'a') => `/plates/${name}-${variant}.svg`;
