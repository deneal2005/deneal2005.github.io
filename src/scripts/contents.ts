import { reducedMotion } from './env';

/** The operations map: open and close, and in-page jumps once it has closed. */
export function initContents() {
  const dialog = document.querySelector<HTMLDialogElement>('#contents');
  if (!dialog) return;
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-contents-open]');

  openers.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      dialog.showModal();
      button.setAttribute('aria-expanded', 'true');
    });
  });

  dialog.querySelector('[data-contents-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    openers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
  });

  // Following a link closes the map first. Same-page sectors are scrolled to by hand,
  // because the page is still scroll-locked when the browser would handle the jump.
  dialog.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-contents-link]');
    if (!link) return;
    const url = new URL(link.href);
    const target = url.pathname === location.pathname && url.hash ? document.getElementById(url.hash.slice(1)) : null;
    dialog.close();
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', url.hash);
    // scrollIntoView forces the style update, so the scroll lock from the open dialog is already gone.
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}
