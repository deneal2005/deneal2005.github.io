import type { APIRoute, GetStaticPaths } from 'astro';
import { plates, renderPlate, type PlateName, type Variant } from '../../lib/plates';

/** Prints every plate, full ("a") and detail ("b"), as a static SVG at build time. */
export const getStaticPaths = (() =>
  Object.keys(plates).flatMap((name) =>
    (['a', 'b'] as const).map((variant) => ({ params: { plate: `${name}-${variant}` } })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const [name, variant] = String(params.plate).split('-') as [PlateName, Variant];
  return new Response(renderPlate(plates[name], variant), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
