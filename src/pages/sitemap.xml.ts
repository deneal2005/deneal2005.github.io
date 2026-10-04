import type { APIRoute } from 'astro';
import { getJourney, getWorks, hasPage } from '../lib/content';

/** Every public page. Sitemaps need absolute URLs, so this is empty until PUBLIC_SITE_URL is set. */
export const GET: APIRoute = async ({ site }) => {
  const [works, journey] = await Promise.all([getWorks(), getJourney()]);
  const paths = ['/', '/journey/', ...works.map((w) => `/work/${w.id}/`), ...journey.filter(hasPage).map((j) => `/journey/${j.id}/`)];
  const urls = site ? paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
