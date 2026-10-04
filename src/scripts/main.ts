import { initChrome } from './chrome';
import { initContents } from './contents';
import { initCursor, initDepth, initHero, initInvitation, initMagnetic } from './interactions';
import { initLab } from './lab';
import { initReveals } from './reveal';

const root = document.documentElement;

// The opening scene and scroll reveals wait for the display face, so type never
// reflows mid-animation. A slow connection gets the fallback after 1.2s instead.
const fontsReady = Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1200))]);

fontsReady.then(() => {
  root.classList.add('is-ready');
  initReveals();
});

initChrome();
initContents();
initHero();
initDepth();
initMagnetic();
initCursor();
initInvitation();
initLab();
