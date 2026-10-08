import { reducedMotion } from './env';

/**
 * Opt-in soundtrack. Silent until the visitor presses the toggle; never
 * autoplays. The file is only requested on the first press.
 */
const VOLUME = 0.42;

export function initSound() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-sound]');
  const src = toggle?.dataset.sound;
  if (!toggle || !src) return;

  let audio: HTMLAudioElement | null = null;
  let fade = 0;

  const ramp = (to: number, done?: () => void) => {
    cancelAnimationFrame(fade);
    if (!audio) return;
    const a = audio;
    if (reducedMotion.matches) {
      a.volume = to;
      done?.();
      return;
    }
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 900);
      a.volume = from + (to - from) * k;
      if (k < 1) fade = requestAnimationFrame(step);
      else done?.();
    };
    fade = requestAnimationFrame(step);
  };

  toggle.addEventListener('click', async () => {
    const on = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(on));
    if (on) {
      audio ??= Object.assign(new Audio(src), { loop: true, volume: 0 });
      try {
        await audio.play();
        ramp(VOLUME);
      } catch {
        toggle.setAttribute('aria-pressed', 'false');
      }
    } else {
      ramp(0, () => audio?.pause());
    }
  });
}
