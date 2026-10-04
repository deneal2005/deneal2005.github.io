import { brushStroke, halftone, rng, round, smoothstep } from '../draw';
import { computeScene } from '../scene';
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

/** Scriptly: a waveform, printed in vermilion, becoming lines of transcript. */
const scriptly: Plate = {
  width: 1200,
  height: 800,
  detail: [150, 300, 640, 400],
  draw: () => {
    const random = rng(29);
    const wave: string[] = [];
    const mid = 196;
    for (let x = 120; x <= 1080; x += 12) {
      const envelope = 0.35 + 0.65 * Math.abs(Math.sin(x * 0.0065 + 0.6));
      const amp = 66 * envelope * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.07) * Math.cos(x * 0.023)));
      for (let y = mid - amp; y <= mid + amp; y += 10) {
        const fade = 1 - Math.abs(y - mid) / (amp + 1);
        wave.push(`<circle cx="${x}" cy="${round(y)}" r="${round(1.4 + 2.6 * fade, 2)}"/>`);
      }
    }
    const lines: string[] = [];
    const stamps: string[] = [];
    let highlight = '';
    for (let i = 0, y = 334; y < 720; i++, y += 36) {
      stamps.push(`<rect x="120" y="${y - 3}" width="58" height="6" rx="3"/>`);
      if (i === 4) highlight = `<rect x="440" y="${y - 13}" width="168" height="26" fill="${INK.shu}"/>`;
      lines.push(`<rect x="232" y="${y - 4}" width="${round(360 + random() * 520)}" height="8" rx="4"/>`);
    }
    return {
      ground: 'sumi',
      body: [
        `<g fill="${INK.shu}">${wave.join('')}</g>`,
        `<path d="M520 104V288" stroke="${INK.gofun}" stroke-width="1.5"/>`,
        `<circle cx="520" cy="104" r="5" fill="${INK.gofun}"/>`,
        `<g fill="${INK.usuzumi}" opacity="0.7">${stamps.join('')}</g>`,
        highlight,
        `<g fill="${INK.gofun}" opacity="0.82">${lines.join('')}</g>`,
      ].join(''),
    };
  },
};

/** Hamon, Vol. 01 (this site): the opening plate, The Cut, at rest. */
const hamon: Plate = {
  width: 1600,
  height: 900,
  detail: [620, 120, 680, 450],
  draw: () => {
    const s = computeScene({ sun: { cx: 1000, cy: 400, r: 330 }, ground: 755, figureX: 970, figureScale: 0.69 });
    const horizon = brushStroke({ from: [0, s.ground], to: [1600, s.ground], width: 5, peak: 0.5, seed: 5, wobble: 0.5, segments: 80 });
    const sunBody = (shift: { x: number; y: number }, clip: string) =>
      `<g transform="translate(${shift.x} ${shift.y})"><g clip-path="url(#${clip})">` +
      `<circle cx="${s.sun.cx + 6}" cy="${s.sun.cy + 5}" r="${s.sun.r}" fill="${INK.enji}" mask="url(#ghost)"/>` +
      `<circle cx="${s.sun.cx}" cy="${s.sun.cy}" r="${s.sun.r}" fill="${INK.shu}" clip-path="url(#solid)"/>` +
      `<g fill="${INK.shu}" clip-path="url(#disc)">${s.sunDots}</g></g></g>`;
    const f = s.figure;
    return {
      ground: 'washi',
      defs: [
        `<clipPath id="upper"><polygon points="${s.halves.upper}"/></clipPath>`,
        `<clipPath id="lower"><polygon points="${s.halves.lower}"/></clipPath>`,
        `<clipPath id="solid"><rect width="1600" height="${round(s.fadeTop + 26)}"/></clipPath>`,
        `<clipPath id="disc"><circle cx="${s.sun.cx}" cy="${s.sun.cy}" r="${s.sun.r}"/></clipPath>`,
        `<linearGradient id="ghost-fade" gradientUnits="userSpaceOnUse" x1="0" y1="${s.sun.cy - 60}" x2="0" y2="${round(s.fadeTop)}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`,
        `<mask id="ghost" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900"><rect width="1600" height="900" fill="url(#ghost-fade)"/></mask>`,
      ].join(''),
      body: [
        sunBody(s.upperShift, 'upper'),
        sunBody(s.lowerShift, 'lower'),
        `<path d="${s.cut}" fill="${INK.sumi}"/>`,
        `<path d="${horizon}" fill="${INK.sumi}"/>`,
        `<g fill="${INK.sumi}">${s.shadowDots}</g>`,
        `<g fill="${INK.sumi}" transform="${s.figureTransform}"><path d="${f.ribbon}"/><path d="${f.saya}"/><path d="${f.body}"/><path d="${f.tsuka}"/><path d="${f.tsuba}"/><path d="${f.blade}" fill="${INK.keshizumi}"/></g>`,
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
      body: [`<g fill="${INK.shu}" clip-path="url(#above)">${dots}</g>`, `<path d="${line}" fill="${INK.sumi}"/>`].join(''),
    };
  },
};

export const plates = { greenup, scriptly, hamon, sunrise } satisfies Record<string, Plate>;
export type PlateName = keyof typeof plates;

export const plateUrl = (name: PlateName, variant: 'a' | 'b' = 'a') => `/plates/${name}-${variant}.svg`;
