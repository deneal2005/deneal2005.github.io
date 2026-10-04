// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
import { collectGlyphs } from './scripts/collect-glyphs.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

/** Latin subsets are self-hosted straight from the installed Fontsource packages. */
const fontsource = (/** @type {string} */ pkg, /** @type {string} */ file) =>
  `./node_modules/${pkg}/files/${file}`;

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: env.PUBLIC_SITE_URL || undefined,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  env: {
    schema: {
      PUBLIC_CONTACT_EMAIL: envField.string({
        context: 'client',
        access: 'public',
        default: 'hello@hamon.example',
      }),
    },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Noto Serif Display',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource-variable/noto-serif-display', 'noto-serif-display-latin-wdth-normal.woff2')],
            weight: '100 900',
            style: 'normal',
            stretch: '62.5% 100%',
          },
          {
            src: [fontsource('@fontsource-variable/noto-serif-display', 'noto-serif-display-latin-wdth-italic.woff2')],
            weight: '100 900',
            style: 'italic',
            stretch: '62.5% 100%',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Archivo',
      cssVariable: '--font-sans',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource-variable/archivo', 'archivo-latin-wdth-normal.woff2')],
            weight: '100 900',
            style: 'normal',
            stretch: '62% 125%',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          { src: [fontsource('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')], weight: 400, style: 'normal' },
          { src: [fontsource('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')], weight: 500, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: 'Shippori Mincho B1',
      cssVariable: '--font-jp',
      weights: [500, 800],
      styles: ['normal'],
      fallbacks: ['Yu Mincho', 'Hiragino Mincho ProN', 'serif'],
      options: { experimental: { glyphs: [collectGlyphs('./src')] } },
    },
  ],
});
