// Dev QA helper: screen-by-screen captures through the Chrome DevTools Protocol.
// Emulates a real viewport (true phone widths included), scrolls the page and
// saves one PNG per screen, plus any console errors it saw.
//
// Usage: node scripts/capture.mjs <url> <outPrefix> [width=1440] [height=900] [screens=6] [--mobile] [--motion] [--from=#id]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
const [url = 'http://localhost:4321/', prefix = 'capture', w = '1440', h = '900', screens = '6'] = args;
const width = Number(w);
const height = Number(h);

const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(browser, [
  '--headless=new',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cap-'))}`,
  'about:blank',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50 && !targets; i++) {
  await sleep(200);
  targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => undefined);
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? msg);
    pending.delete(msg.id);
  }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') errors.push(msg.params.entry.text);
});
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: flags.has('--mobile'),
});
if (flags.has('--mobile')) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
if (!flags.has('--motion'))
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

await send('Page.navigate', { url });
await sleep(4500);

const { result } = await send('Runtime.evaluate', {
  expression: 'document.documentElement.scrollHeight',
  returnByValue: true,
});
// --from=#id starts the sequence at that element instead of the top of the page.
const fromFlag = [...flags].find((f) => f.startsWith('--from='));
const { result: start } = fromFlag
  ? await send('Runtime.evaluate', {
      expression: `Math.round(document.querySelector(${JSON.stringify(fromFlag.slice(7))}).getBoundingClientRect().top + scrollY)`,
      returnByValue: true,
    })
  : { result: { value: 0 } };
const total = Math.min(Number(screens), Math.ceil((result.value - start.value) / height));
const saved = [];
for (let i = 0; i < total; i++) {
  await send('Runtime.evaluate', { expression: `window.scrollTo({top:${start.value + i * height},behavior:'instant'})` });
  await sleep(flags.has('--motion') ? 2200 : 700);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const file = resolve(`${prefix}-${i}.png`);
  writeFileSync(file, Buffer.from(shot.data, 'base64'));
  saved.push(file);
}

console.log(JSON.stringify({ pageHeight: result.value, saved, errors }, null, 2));
ws.close();
chrome.kill();
process.exit(0);
