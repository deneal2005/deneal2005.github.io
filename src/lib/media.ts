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
 *   reel-720.mp4     the opening shot, desktop: H.264 at the source's 30fps, colour
 *                    grade baked in, no audio. It plays natively (never scrubbed).
 *   reel-480.mp4     the same for phones (optional, falls back to 720)
 *   reel-poster.jpg  first frame, shown until playback starts (optional)
 *   theme.mp3        opt-in soundtrack, off until the visitor turns it on (optional)
 */
const dir = join(process.cwd(), 'public', 'media');
const has = (file: string) => existsSync(join(dir, file));

export const reelMedia = has('reel-720.mp4')
  ? {
      hd: '/media/reel-720.mp4',
      sd: has('reel-480.mp4') ? '/media/reel-480.mp4' : '/media/reel-720.mp4',
      poster: has('reel-poster.jpg') ? '/media/reel-poster.jpg' : undefined,
    }
  : null;

export const soundtrack = has('theme.mp3') ? '/media/theme.mp3' : null;
