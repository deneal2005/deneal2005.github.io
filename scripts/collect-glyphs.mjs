import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

// Japanese glyphs are subset at build time so the mincho face ships only the
// characters the site actually uses. Any kana/kanji added under src/ is picked
// up automatically on the next dev-server start or build.
const JAPANESE = /[　-〿぀-ヿ㐀-䶿一-鿿＀-￯]/gu;
const SOURCE_EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.ts', '.js', '.mjs']);

/** @param {string} root */
export function collectGlyphs(root) {
  const glyphs = new Set();

  /** @param {string} dir */
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (SOURCE_EXTENSIONS.has(extname(name))) {
        for (const glyph of readFileSync(path, 'utf8').match(JAPANESE) ?? []) glyphs.add(glyph);
      }
    }
  };

  walk(root);
  return [...glyphs].sort().join('');
}
