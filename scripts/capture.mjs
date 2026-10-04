// Dev QA helper: screen-by-screen captures of a page through headless Chrome.
// Emulates a real viewport (true phone widths included), scrolls and saves one
// PNG per screen. Reduced motion is on unless --motion is passed.
//
// Usage: node scripts/capture.mjs <url> <outPrefix|file.png> [width=1440] [height=900] [screens=6] [--mobile] [--motion] [--from=#id] [--dpr=2]
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { launch, sleep } from './lib/cdp.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const [url = 'http://localhost:4321/', prefix = 'capture', w = '1440', h = '900', screens = '6'] = args;
const height = Number(h);
const motion = flags.includes('--motion');
const from = flags.find((f) => f.startsWith('--from='))?.slice(7);
const dpr = Number(flags.find((f) => f.startsWith('--dpr='))?.slice(6) ?? 1);

const page = await launch();
await page.viewport(Number(w), height, { mobile: flags.includes('--mobile'), reducedMotion: !motion, dpr });
await page.goto(url, 4500);

const total = await page.eval('document.documentElement.scrollHeight');
const start = from ? await page.eval(`Math.round(document.querySelector(${JSON.stringify(from)}).getBoundingClientRect().top + scrollY)`) : 0;
const count = Math.min(Number(screens), Math.ceil((total - start) / height));
const saved = [];
for (let i = 0; i < count; i++) {
  await page.eval(`window.scrollTo({ top: ${start + i * height}, behavior: 'instant' })`);
  await sleep(motion ? 2200 : 700);
  // A prefix ending in .png means "write exactly this file" (used for the share image).
  const file = resolve(prefix.endsWith('.png') ? prefix : `${prefix}-${i}.png`);
  writeFileSync(file, await page.screenshot());
  saved.push(file);
}

console.log(JSON.stringify({ pageHeight: total, saved, errors: page.errors }, null, 2));
page.close();
process.exit(0);
