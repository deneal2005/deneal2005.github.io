import { clamp, onFrame } from './env';

/**
 * Command bar and sector rail: scroll state, the active sector (marked in the
 * navigation and the rail) and reading progress.
 */
export function initChrome() {
  const masthead = document.querySelector<HTMLElement>('[data-masthead]');
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]');
  const readFill = document.querySelector<HTMLElement>('[data-read-fill]');
  const railNo = document.querySelector<HTMLElement>('[data-rail-no]');
  const railJa = document.querySelector<HTMLElement>('[data-rail-ja]');
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
  const sectors = [...document.querySelectorAll<HTMLElement>('[data-sector]')];
  const wall = document.querySelector<HTMLElement>('[data-wall]');

  let lastY = scrollY;
  let current: HTMLElement | null = null;

  onFrame(() => {
    const y = scrollY;
    const vh = innerHeight;

    if (masthead) {
      // Over the opening sequence the bar stays clear, so the frame is never boxed in.
      const wallEnd = wall ? wall.offsetTop + wall.offsetHeight - masthead.offsetHeight : 0;
      const goingDown = y > lastY;
      masthead.toggleAttribute('data-scrolled', y > Math.max(8, wallEnd));
      if (Math.abs(y - lastY) > 4) masthead.toggleAttribute('data-hidden', goingDown && y > wallEnd + vh * 0.6);
    }

    const max = document.documentElement.scrollHeight - vh;
    const progress = String(max > 0 ? clamp(y / max) : 0);
    railFill?.style.setProperty('--progress', progress);
    readFill?.style.setProperty('--progress', progress);

    // Active sector: the last one whose top has passed the upper third.
    let active: HTMLElement | null = null;
    for (const sector of sectors) if (sector.getBoundingClientRect().top <= vh * 0.34) active = sector;
    active ??= sectors[0] ?? null;
    if (active !== current) {
      current = active;
      const id = active?.id;
      for (const link of navLinks) {
        if (link.dataset.nav === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      if (railNo) railNo.textContent = active?.dataset.sectorNo ?? '';
      if (railJa) railJa.textContent = active?.dataset.sectorJa ?? '';
    }

    lastY = y;
  });
}
