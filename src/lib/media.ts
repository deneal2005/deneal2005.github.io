import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The opening reel's media, resolved at build time from public/media/.
 *
 * public/media/ is git-ignored: the footage and soundtrack used while
 * developing are third-party and must never be committed or deployed. Builds
 * without them (CI, GitHub Pages) render the original atmospheric scene in
 * their place, and the sound toggle hides itself.
 *
 *   hero-720.mp4     scroll-scrubbed reel, desktop (H.264, keyframe every 6 frames, no audio)
 *   hero-480.mp4     the same reel for phones (optional, falls back to 720)
 *   hero-poster.jpg  first frame shown before the reel loads (optional)
 *   theme.mp3        opt-in soundtrack, off until the visitor turns it on (optional)
 */
const dir = join(process.cwd(), 'public', 'media');
const has = (file: string) => existsSync(join(dir, file));

export const reelMedia = has('hero-720.mp4')
  ? {
      hd: '/media/hero-720.mp4',
      sd: has('hero-480.mp4') ? '/media/hero-480.mp4' : '/media/hero-720.mp4',
      poster: has('hero-poster.jpg') ? '/media/hero-poster.jpg' : undefined,
    }
  : null;

export const soundtrack = has('theme.mp3') ? '/media/theme.mp3' : null;
