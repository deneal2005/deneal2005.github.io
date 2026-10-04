---
order: 3
title: Hamon, Vol. 01
titleLines: ['Hamon', 'Vol. 01']
summary: This portfolio, set as a manga volume. Chapters, printed plates, and a running record of what I’m building.
kind: Website
year: 2026
status: In progress
stack: ['TypeScript', 'Astro', 'CSS', 'SVG', 'Canvas 2D', 'View Transitions', 'Pointer Events', 'REST APIs', 'Claude Code']
features:
  - Every image is generated from code at build time. No stock photography.
  - Repositories and commit activity come from the GitHub API at build time, with a fallback when it can’t be reached.
  - Projects, experiments and journey entries are Markdown files. The skills index is built from them.
  - Page turns use cross-document view transitions. All motion respects reduced-motion settings.
  - Fonts are self-hosted, and the Japanese face is subset to the glyphs actually on the page.
layout: offset
plate: hamon
alt: A vermilion sun split by a single brush stroke, with a lone swordsman standing on the horizon beneath it.
detailAlt: The cut through the sun, close up, where the two halves have slid apart.
---

## What it is

A portfolio that reads like a book: a prologue, chapters, a contents page with real page numbers, and a colophon at the back. The design borrows from Japanese print rather than from anime: halftone screens, misregistered ink, panel borders, a lot of empty paper.

## Decisions

There is no client-side framework. Pages are static HTML from Astro, and the little JavaScript there is handles reveals, the contents dialog and the three studies in Chapter 05, which only load when you scroll near them.

The plates are drawn by TypeScript at build time and saved as SVG files: a seeded random generator, a halftone function and a few brush-stroke helpers. Same seed, same print.

Nothing on the site is invented. Projects, dates and activity come from public repositories, and anything that isn’t known yet stays hidden instead of being filled in.

## Next

Real screenshots for GreenUP, a few sections in my own words, and the journey kept up to date.
