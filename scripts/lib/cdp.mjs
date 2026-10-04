// Minimal Chrome DevTools Protocol driver for the QA scripts. No dependencies:
// spawns headless Chrome/Edge, talks to one page over WebSocket (Node 22+).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowser() {
  const path = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find((p) => p && existsSync(p));
  if (!path) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');
  return path;
}

export async function launch() {
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(findBrowser(), [
    '--headless=new',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`,
    'about:blank',
  ]);

  let targets;
  for (let i = 0; i < 50 && !targets; i++) {
    await sleep(200);
    targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => undefined);
  }
  const target = targets?.find((t) => t.type === 'page');
  if (!target) throw new Error('Could not attach to headless Chrome.');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
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
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
      errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error')
      errors.push(`${msg.params.entry.text} ${msg.params.entry.url ?? ''}`.trim());
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');

  return {
    send,
    errors,
    async viewport(width, height, { mobile = false, reducedMotion = true, dpr = 1 } = {}) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }],
      });
    },
    async goto(url, settle = 2500) {
      await send('Page.navigate', { url });
      await sleep(settle);
    },
    async eval(expression) {
      const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      return result?.value;
    },
    async screenshot() {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      return Buffer.from(shot.data, 'base64');
    },
    close() {
      ws.close();
      chrome.kill();
    },
  };
}
