/**
 * Adds .is-in to [data-reveal] and [data-draw] elements the first time they enter the viewport.
 *
 * Panel reveals start fully clipped (clip-path), and IntersectionObserver measures the
 * clipped area, so a closed panel would never report as visible. Those are watched
 * through their parent, which isn't clipped.
 */
export function initReveals() {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-draw]')];

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const watched = new Map<Element, HTMLElement[]>();
  for (const el of targets) {
    const proxy = el.dataset.reveal === 'panel' && el.parentElement ? el.parentElement : el;
    watched.set(proxy, [...(watched.get(proxy) ?? []), el]);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        watched.get(entry.target)?.forEach((el) => el.classList.add('is-in'));
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
  );

  watched.forEach((_, proxy) => observer.observe(proxy));
}
