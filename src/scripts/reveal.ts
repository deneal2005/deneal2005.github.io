/** Adds .is-in to [data-reveal] and [data-draw] elements the first time they enter the viewport. */
export function initReveals() {
  const targets = document.querySelectorAll<Element>('[data-reveal], [data-draw]');

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
  );

  targets.forEach((el) => observer.observe(el));
}
