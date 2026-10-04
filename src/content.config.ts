import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Generated plates available under /plates/{name}-{a|b}.svg (see src/lib/plates). */
export const PLATES = ['meridian', 'salt', 'folds', 'kage', 'lowtide'] as const;

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    order: z.number().int().positive(),
    title: z.string(),
    /** How the title breaks across lines in the exhibition spread. */
    titleLines: z.array(z.string()).min(1),
    client: z.string(),
    sector: z.string(),
    year: z.number().int(),
    disciplines: z.array(z.string()).min(1),
    role: z.string(),
    logline: z.string(),
    /** Composition used for this project's spread in Chapter 01. */
    layout: z.enum(['right', 'wide', 'left', 'offset', 'center']),
    plate: z.enum(PLATES),
    /** Optional real imagery: paths under /public replace the generated plates. */
    cover: z.string().optional(),
    detail: z.string().optional(),
    ratio: z.enum(['4/5', '3/2', '1/1', '16/9']),
    alt: z.string(),
    detailAlt: z.string(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
});

export const collections = { work };
