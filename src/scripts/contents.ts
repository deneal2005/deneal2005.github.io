import { reducedMotion } from './env';

/** The contents dialog: open/close, and page numbers measured from the live layout. */
export function initContents() {
  const dialog = document.querySelector<HTMLDialogElement>('#contents');
  if (!dialog) return;
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-contents-open]');

  const measurePages = () => {
    dialog.querySelectorAll<HTMLElement>('[data-page-for]').forEach((el) => {
      const target = document.getElementById(el.dataset.pageFor ?? '');
      if (!target) {
        el.textContent = '';
        return;
      }
      const top = target.getBoundingClientRect().top + scrollY;
      el.textContent = `p. ${String(Math.floor(top / innerHeight) + 1).padStart(3, '0')}`;
    });
  };

  openers.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      measurePages();
      dialog.showModal();
      button.setAttribute('aria-expanded', 'true');
    });
  });

  dialog.querySelector('[data-contents-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    openers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
  });

  // Following a link closes the book first. Same-page chapters are scrolled to by hand,
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
