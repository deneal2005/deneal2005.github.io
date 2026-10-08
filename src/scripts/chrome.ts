import { clamp, onFrame } from './env';

/**
 * Command bar, sector rail and mobile dock: scroll state, the active sector
 * (marked in the navigation, the rail and the dock) and reading progress.
 */
export function initChrome() {
  const masthead = document.querySelector<HTMLElement>('[data-masthead]');
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]');
  const readFill = document.querySelector<HTMLElement>('[data-read-fill]');
  const railNo = document.querySelector<HTMLElement>('[data-rail-no]');
  const railJa = document.querySelector<HTMLElement>('[data-rail-ja]');
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  const dockNo = document.querySelector<HTMLElement>('[data-dock-no]');
  const dockTitle = document.querySelector<HTMLElement>('[data-dock-title]');
  const dockJa = document.querySelector<HTMLElement>('[data-dock-ja]');
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

    // The dock arrives once the opening is behind you, so it never covers the hero's own actions.
    if (dock) {
      const after = wall ? wall.offsetTop + wall.offsetHeight - vh * 1.1 : vh * 0.6;
      dock.toggleAttribute('data-shown', y > after);
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
      const no = active?.dataset.sectorNo ?? '';
      const ja = active?.dataset.sectorJa ?? '';
      if (railNo) railNo.textContent = no;
      if (railJa) railJa.textContent = ja;
      if (dockNo) dockNo.textContent = no;
      if (dockJa) dockJa.textContent = ja;
      if (dockTitle) dockTitle.textContent = active?.dataset.sectorTitle ?? '';
    }

    lastY = y;
  });
}
