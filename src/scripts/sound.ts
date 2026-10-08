import { reducedMotion } from './env';

/**
 * The soundtrack plays by default, as far as browsers allow.
 *
 * No browser lets a page start audible audio on load: it needs a user
 * gesture first (scrolling doesn't count). So: try to play on arrival (this
 * succeeds where the browser already trusts the site), and otherwise start on
 * the visitor's first click, tap or key press anywhere, fading in.
 *
 * The Sound toggle turns it off, and that choice is remembered (localStorage),
 * so nobody who muted it hears it again. Between pages the track carries on
 * from where it was (sessionStorage) instead of starting over.
 */
const VOLUME = 0.42;
const MUTED_KEY = 'sound-muted';
const TIME_KEY = 'sound-time';
const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

const store = {
  get: (s: Storage, k: string) => {
    try {
      return s.getItem(k);
    } catch {
      return null;
    }
  },
  set: (s: Storage, k: string, v: string) => {
    try {
      s.setItem(k, v);
    } catch {
      /* storage blocked: preferences just don't persist */
    }
  },
};

export function initSound() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-sound]');
  const src = toggle?.dataset.sound;
  if (!toggle || !src) return;

  const audio = Object.assign(new Audio(src), { loop: true, volume: 0, preload: 'auto' });
  // Buffer now, so the first gesture starts the music without a wait.
  if (store.get(localStorage, MUTED_KEY) !== '1') audio.load();
  let fade = 0;
  let wanted = store.get(localStorage, MUTED_KEY) !== '1';

  // Carry on from where the previous page left off.
  const resumeAt = Number(store.get(sessionStorage, TIME_KEY));
  if (resumeAt > 0) {
    audio.addEventListener('loadedmetadata', () => (audio.currentTime = resumeAt % (audio.duration || Infinity)), { once: true });
  }
  addEventListener('pagehide', () => store.set(sessionStorage, TIME_KEY, String(audio.currentTime)));

  const show = (on: boolean) => {
    toggle.setAttribute('aria-pressed', String(on));
    toggle.toggleAttribute('data-waiting', wanted && !on);
  };

  const ramp = (to: number, done?: () => void) => {
    cancelAnimationFrame(fade);
    if (reducedMotion.matches) {
      audio.volume = to;
      done?.();
      return;
    }
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / 1200));
      audio.volume = from + (to - from) * k;
      if (k < 1) fade = requestAnimationFrame(step);
      else done?.();
    };
    fade = requestAnimationFrame(step);
  };

  const play = async () => {
    try {
      await audio.play();
      ramp(VOLUME);
      show(true);
      stopWaiting();
      return true;
    } catch {
      show(false);
      return false;
    }
  };

  const onGesture = (event: Event) => {
    // The toggle handles its own clicks.
    if (toggle.contains(event.target as Node)) return;
    if (wanted && audio.paused) play();
  };
  const stopWaiting = () => GESTURES.forEach((type) => removeEventListener(type, onGesture, true));

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      wanted = true;
      store.set(localStorage, MUTED_KEY, '0');
      play();
    } else {
      wanted = false;
      store.set(localStorage, MUTED_KEY, '1');
      stopWaiting();
      show(false);
      ramp(0, () => audio.pause());
    }
  });

  if (!wanted) {
    show(false);
    return;
  }

  // Try right away; if the browser blocks it, the first gesture anywhere starts it.
  show(false);
  play().then((ok) => {
    if (!ok) GESTURES.forEach((type) => addEventListener(type, onGesture, { capture: true, passive: true }));
  });
}
