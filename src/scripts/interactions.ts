import { finePointer, onFrame, reducedMotion } from './env';

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

/** Copy-to-clipboard for the email address. */
export function initInvitation() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]') ?? button;
    const initial = label.textContent;
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        label.textContent = 'Copied';
        button.classList.add('is-copied');
        if (status) status.textContent = 'Email address copied to the clipboard.';
      } catch {
        label.textContent = 'Copy blocked';
        if (status) status.textContent = 'Your browser blocked copying. Select the address above to copy it by hand.';
      }
      setTimeout(() => {
        label.textContent = initial;
        button.classList.remove('is-copied');
      }, 2400);
    });
  });
}
