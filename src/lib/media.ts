import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The opening reel's media, resolved at build time from public/media/.
 *
 * The footage, soundtrack and avatar are committed and deployed (the owner's choice;
 * they are third-party material). Anything else in public/media stays
 * git-ignored. Every file is optional: without the reel the hero opens on the
 * drawn wall, and without the soundtrack the sound toggle hides itself.
 *
 *   reel-720.mp4     the opening shot, desktop: H.264 at the source's 30fps, colour
 *                    grade baked in, no audio. It plays natively (never scrubbed).
 *   reel-480.mp4     the same for phones (optional, falls back to 720)
 *   reel-poster.jpg  first frame, shown until playback starts (optional)
 *   theme.mp3        opt-in soundtrack, off until the visitor turns it on (optional)
 *   portrait.jpg     avatar for the dossier in The Soldier, used when profile.portrait
 *                    is empty (optional; square works best)
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

export const avatar = has('portrait.jpg')
  ? { src: '/media/portrait.jpg', alt: 'Avatar: an anime-style figure in a long coat, backlit by a low sun.' }
  : null;
