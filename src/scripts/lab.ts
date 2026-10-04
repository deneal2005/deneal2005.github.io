/**
 * Experiments in Chapter 03 are loaded only when they approach the viewport,
 * so the rest of the volume never pays for them.
 */
const experiments: Record<string, () => Promise<{ mount: (root: HTMLElement) => void }>> = {
  sumi: () => import('./lab/sumi'),
  ten: () => import('./lab/ten'),
  hanko: () => import('./lab/hanko'),
};

export function initLab() {
  const roots = document.querySelectorAll<HTMLElement>('[data-lab]');
  if (!roots.length) return;

  const load = (root: HTMLElement) => {
    const loader = experiments[root.dataset.lab ?? ''];
    loader?.().then(({ mount }) => mount(root));
  };

  if (!('IntersectionObserver' in window)) {
    roots.forEach(load);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        load(entry.target as HTMLElement);
      }
    },
    { rootMargin: '300px 0px' },
  );
  roots.forEach((root) => observer.observe(root));
}
