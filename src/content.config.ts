import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Generated plates available under /plates/{name}-{a|b}.svg (see src/lib/plates). */
export const PLATES = ['greenup', 'rentmate', 'sunrise'] as const;

/** Files starting with "_" (like _template.md) are ignored, so templates can live beside entries. */
const entries = (base: string) => glob({ pattern: '**/[^_]*.md', base });

const link = z.object({ label: z.string(), href: z.url() });

/**
 * Projects: polished, shipped work. One Markdown file each in src/content/work.
 * Optional fields are simply not shown when missing.
 */
const work = defineCollection({
  loader: entries('./src/content/work'),
  schema: ({ image }) =>
    z.object({
      order: z.number().int().positive(),
      title: z.string(),
      /** How the title breaks across lines in the exhibition spread. */
      titleLines: z.array(z.string()).min(1),
      /** What it is, in one line. */
      summary: z.string(),
      kind: z.string(),
      year: z.number().int(),
      status: z.enum(['Live', 'Open source', 'In progress', 'Archived']),
      /** Your role, in your words. Hidden when empty. */
      role: z.string().optional(),
      stack: z.array(z.string()).min(1),
      features: z.array(z.string()).default([]),
      links: z
        .object({ repo: z.url().optional(), live: z.url().optional(), other: z.array(link).default([]) })
        .default({ other: [] }),
      /** Composition used for this project's spread in Chapter 03. */
      layout: z.enum(['right', 'wide', 'left', 'offset', 'center']),
      plate: z.enum(PLATES),
      alt: z.string(),
      detailAlt: z.string(),
      /** Real screenshots, stored next to the entry in src/assets/work/. Shown on the case study. */
      screens: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
    }),
});

/** Experiments: exploration, not product. `demo` mounts one of the live studies in Chapter 05. */
const experiments = defineCollection({
  loader: entries('./src/content/experiments'),
  schema: z.object({
    title: z.string(),
    ja: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    stack: z.array(z.string()).default([]),
    status: z.enum(['Running', 'Sketch', 'Archived']).default('Sketch'),
    demo: z.enum(['sumi', 'ten', 'hanko']).optional(),
    links: z.object({ repo: z.url().optional(), live: z.url().optional() }).default({}),
  }),
});

/**
 * Journey: the running record. One Markdown file per entry in src/content/journey.
 * Frontmatter alone makes a timeline row; write a body and the entry gets its own page.
 */
const journey = defineCollection({
  loader: entries('./src/content/journey'),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: z.string(),
      category: z.enum([
        'Learning',
        'Building',
        'Experiment',
        'Project',
        'AI',
        'Design',
        'Milestone',
        'Reading',
        'Discovery',
        'Note',
      ]),
      summary: z.string(),
      status: z.enum(['Done', 'In progress', 'Paused', 'Abandoned']).optional(),
      stack: z.array(z.string()).default([]),
      learned: z.string().optional(),
      next: z.string().optional(),
      /** Link the entry to a project in src/content/work by its file name. */
      project: reference('work').optional(),
      links: z
        .object({ github: z.url().optional(), external: z.url().optional() })
        .default({}),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { work, experiments, journey };
