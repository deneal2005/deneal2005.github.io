// End-to-end QA against a running site (dev or preview).
// Crawls every internal link from the homepage, then checks each page for:
// HTTP status, console errors, horizontal overflow on a 375px phone, images
// without alt text, a single h1, unnamed links/buttons and broken #anchors.
// External links get a status check, and the key interactions get exercised.
//
// Usage: node scripts/qa.mjs [baseUrl=http://localhost:4321] [--skip-external]
import { launch, sleep } from './lib/cdp.mjs';

const base = (process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'http://localhost:4321').replace(/\/$/, '');
const skipExternal = process.argv.includes('--skip-external');
const failures = [];
const notes = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);

const page = await launch();

// ── Crawl ────────────────────────────────────────────────
const seen = new Set(['/']);
const queue = ['/'];
const external = new Map();
const anchors = [];
const idsByPage = new Map();

while (queue.length) {
  const path = queue.shift();
  const res = await fetch(base + path);
  if (res.status !== 200) {
    fail(path, `HTTP ${res.status}`);
    continue;
  }
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) continue;

  page.errors.length = 0;
  await page.viewport(375, 812, { mobile: true });
  await page.goto(base + path);

  const report = await page.eval(`(() => {
    const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.querySelector('img[alt]')?.alt || '').trim();
    return {
      // clientWidth, not innerWidth: on phones the layout viewport grows to fit overflowing content.
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      noAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.src),
      unnamed: [...document.querySelectorAll('a[href], button')].filter((el) => !name(el) && !el.closest('[aria-hidden="true"]')).map((el) => el.outerHTML.slice(0, 90)),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
      ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
    };
  })()`);

  if (report.overflow > 1) fail(path, `horizontal overflow of ${report.overflow}px at 375px`);
  if (report.h1 !== 1) fail(path, `${report.h1} h1 elements (expected 1)`);
  report.noAlt.forEach((src) => fail(path, `image without alt: ${src}`));
  report.unnamed.forEach((html) => fail(path, `link/button without a name: ${html}`));
  page.errors.forEach((e) => fail(path, `console: ${e}`));

  for (const href of report.links) {
    const url = new URL(href);
    if (url.origin !== new URL(base).origin) {
      if (url.protocol.startsWith('http')) external.set(url.href, path);
      continue;
    }
    if (url.hash) anchors.push({ from: path, page: url.pathname, id: decodeURIComponent(url.hash.slice(1)) });
    if (!seen.has(url.pathname)) {
      seen.add(url.pathname);
      queue.push(url.pathname);
    }
  }
  idsByPage.set(path, new Set(report.ids));
}

for (const { from, page: target, id } of anchors) {
  if (id === 'top') continue;
  if (!idsByPage.get(target)?.has(id)) fail(from, `link to ${target}#${id}, but no element has that id`);
}

// ── 404 ──────────────────────────────────────────────────
const missing = await fetch(`${base}/this-page-does-not-exist/`);
if (missing.status !== 404) fail('/this-page-does-not-exist/', `expected 404, got ${missing.status}`);

// ── External links ───────────────────────────────────────
if (!skipExternal) {
  for (const [href, from] of external) {
    try {
      const res = await fetch(href, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10_000) });
      if (res.status >= 400 && res.status !== 429 && res.status !== 999) fail(from, `external ${href} answered ${res.status}`);
    } catch (error) {
      notes.push(`could not reach ${href} (${error.message}); check it by hand`);
    }
  }
}

// ── Interactions (homepage, desktop) ─────────────────────
await page.viewport(1440, 900);
await page.goto(base + '/', 3000);

const contents = await page.eval(`(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const dialog = document.getElementById('contents');
  document.querySelector('[data-contents-open]').click();
  await wait(300);
  const opened = dialog.open && dialog.contains(document.activeElement);
  dialog.querySelector('a.ops__row[href="/#campaigns"]').click();
  await wait(400);
  const top = Math.round(document.getElementById('campaigns').getBoundingClientRect().top);
  return { opened, closed: !dialog.open, top, focused: document.activeElement.id };
})()`);
if (!contents.opened) fail('/', 'operations map did not open with focus inside');
if (!contents.closed) fail('/', 'operations map stayed open after choosing a sector');
if (Math.abs(contents.top) > 120) fail('/', `choosing a sector left it ${contents.top}px from the top of the viewport`);
if (contents.focused !== 'campaigns') fail('/', `focus went to "${contents.focused}" instead of the chosen sector`);

const chart = await page.eval(`(async () => {
  const plot = document.querySelector('[data-activity]');
  if (!plot) return { present: false };
  plot.focus();
  plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  const tip = plot.querySelector('[data-activity-tip]');
  return { present: true, shown: !tip.hidden, text: tip.textContent.trim() };
})()`);
if (chart.present && !chart.shown) fail('/', 'activity chart tooltip did not appear on keyboard focus');
if (!chart.present) notes.push('no activity chart rendered (GitHub unavailable at build time, or no commits)');

page.close();

// ── Report ───────────────────────────────────────────────
console.log(`Checked ${seen.size} pages, ${anchors.length} in-page anchors, ${skipExternal ? 0 : external.size} external links.`);
notes.forEach((n) => console.log(`note: ${n}`));
if (failures.length) {
  console.log(`\n${failures.length} problem(s):`);
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log('All checks passed.');
process.exit(0);
