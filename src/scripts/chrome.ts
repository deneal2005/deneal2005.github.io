import { clamp, onFrame } from './env';

/**
 * Masthead and folio rail: scroll state, ink/paper tone, the running head
 * (current chapter) and the live page number.
 */
export function initChrome() {
  const masthead = document.querySelector<HTMLElement>('[data-masthead]');
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]');
  const readFill = document.querySelector<HTMLElement>('[data-read-fill]');
  const railPage = document.querySelector<HTMLElement>('[data-rail-page]');
  const runningLabel = document.querySelector<HTMLElement>('[data-running-label]');
  const runningTitle = document.querySelector<HTMLElement>('[data-running-title]');
  const inkSections = [...document.querySelectorAll<HTMLElement>('[data-tone="ink"]:not(dialog)')];
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter-label]')];
  const reel = document.querySelector<HTMLElement>('[data-reel]');

  let lastY = scrollY;
  let currentChapter: HTMLElement | null = null;

  const isOverInk = (y: number) =>
    inkSections.some((section) => {
      const r = section.getBoundingClientRect();
      return r.top <= y && r.bottom > y;
    });

  onFrame(() => {
    const y = scrollY;
    const vh = innerHeight;

    if (masthead) {
      const goingDown = y > lastY;
      // Over the opening reel the bar stays clear, so the frame is never boxed in.
      const reelEnd = reel ? reel.offsetTop + reel.offsetHeight - masthead.offsetHeight : 0;
      masthead.toggleAttribute('data-scrolled', y > Math.max(8, reelEnd));
      // Step out of the way while reading downward; return on any upward scroll.
      if (Math.abs(y - lastY) > 4) masthead.toggleAttribute('data-hidden', goingDown && y > vh * 0.6 && y > reelEnd);
      masthead.toggleAttribute('data-on-ink', isOverInk(masthead.offsetHeight / 2));
    }

    if (rail) rail.toggleAttribute('data-on-ink', isOverInk(vh / 2));

    const max = document.documentElement.scrollHeight - vh;
    const progress = String(max > 0 ? clamp(y / max) : 0);
    railFill?.style.setProperty('--progress', progress);
    readFill?.style.setProperty('--progress', progress);
    if (railPage) railPage.textContent = String(Math.floor(y / vh) + 1).padStart(3, '0');

    // Running head: the last chapter whose opening has passed the upper third.
    let active: HTMLElement | null = null;
    for (const chapter of chapters) if (chapter.getBoundingClientRect().top <= vh * 0.34) active = chapter;
    active ??= chapters[0] ?? null;
    if (active && active !== currentChapter) {
      currentChapter = active;
      if (runningLabel) runningLabel.textContent = active.dataset.chapterLabel ?? '';
      if (runningTitle) runningTitle.textContent = active.dataset.chapterTitle ?? '';
    }

    lastY = y;
  });
}
