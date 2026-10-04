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

  // Following a link closes the book first, so in-page anchors scroll the page beneath.
  dialog.addEventListener('click', (event) => {
    if ((event.target as Element).closest('[data-contents-link]')) dialog.close();
  });
}
