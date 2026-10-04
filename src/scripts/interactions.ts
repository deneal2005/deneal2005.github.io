import { clamp, finePointer, onFrame, reducedMotion } from './env';

/** Hero depth: pointer drift (fine pointers only) and scroll progress through the opening plate. */
export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  onFrame(() => {
    const progress = clamp(scrollY / hero.offsetHeight);
    hero.style.setProperty('--hp', reducedMotion.matches ? '0' : progress.toFixed(3));
  });

  hero.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', (((event.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    hero.style.setProperty('--py', (((event.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  });

  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--px', '0');
    hero.style.setProperty('--py', '0');
  });
}

/** Elements that lean toward the pointer, for the few actions worth reaching for. */
export function initMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const r = el.getBoundingClientRect();
      const x = (event.clientX - (r.left + r.width / 2)) * strength;
      const y = (event.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/**
 * A contextual reading cursor for the exhibition: appears only over a work,
 * and says what clicking will do. The native cursor stays visible.
 */
export function initCursor() {
  const zones = document.querySelectorAll<HTMLElement>('[data-cursor]');
  if (!zones.length) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);

  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;

  const follow = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(follow) : 0;
  };

  zones.forEach((zone) => {
    zone.addEventListener('pointerenter', (event) => {
      if (!finePointer.matches) return;
      cursor.textContent = zone.dataset.cursor ?? '';
      x = cx = event.clientX;
      y = cy = event.clientY;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      cursor.classList.add('is-visible');
    });
    zone.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      if (reducedMotion.matches) {
        cursor.style.transform = `translate(${x}px, ${y}px)`;
      } else if (!raf) raf = requestAnimationFrame(follow);
    });
    zone.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  });
}

/** Parallax for elements marked [data-depth]: a fraction of their distance from the viewport centre. */
export function initDepth() {
  const items = [...document.querySelectorAll<HTMLElement>('[data-depth]')];
  if (!items.length) return;
  onFrame(() => {
    if (reducedMotion.matches) return;
    const mid = innerHeight / 2;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      const offset = (r.top + r.height / 2 - mid) * (Number(el.dataset.depth) || 0.1);
      el.style.setProperty('--depth', `${offset.toFixed(1)}px`);
    }
  });
}

/** Live local time for the studio, and a copy-to-clipboard for the address. */
export function initInvitation() {
  document.querySelectorAll<HTMLElement>('[data-local-time]').forEach((el) => {
    const format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: el.dataset.localTime,
    });
    const tick = () => (el.textContent = format.format(new Date()));
    tick();
    setInterval(tick, 20_000);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]') ?? button;
    const initial = label.textContent;
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        label.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied to the clipboard.';
      } catch {
        label.textContent = 'Press Ctrl+C';
        if (status) status.textContent = 'Copying was blocked by the browser. Select the address to copy it.';
      }
      setTimeout(() => (label.textContent = initial), 2400);
    });
  });
}
