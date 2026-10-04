# Working on this repo

Delin Thangjam's portfolio, set as a manga volume. Astro 7, static output, no client framework.

## Ground rules

- **Never invent personal information.** No made-up projects, clients, metrics, dates, skills or quotes. Facts come from `src/data/profile.ts`, the Markdown content, or public repositories. A missing field stays empty and its UI hides itself.
- Keep the visual system: tokens in `src/styles/tokens.css`, motion in `src/styles/motion.css`. Red (`--shu`) is for the sun and the occasional accent, never body text on paper (use `--enji`).
- Every animation must respect `prefers-reduced-motion`, and content must be readable without JavaScript (hidden states only apply under `html.js`).

## Where things live

| What | Where |
| --- | --- |
| Name, role, statement, links, résumé | `src/data/profile.ts` |
| "Currently" panel | `src/data/now.ts` |
| Skill groups (terms come from content stacks) | `src/data/skills.ts` |
| Precepts (Chapter 04) | `src/data/precepts.ts` |
| Projects | `src/content/work/*.md` |
| Experiments | `src/content/experiments/*.md` |
| Journey entries | `src/content/journey/*.md` (copy `_template.md`) |
| Generated images ("plates") | `src/lib/plates/`, served from `/plates/{name}-{a,b}.svg` |
| Build-time GitHub data | `src/lib/github.ts` |

## Commands

```
npm run dev        # dev server
npm run check      # types and content schemas
npm run build      # static build into dist/
npm run qa         # crawl a running site: links, overflow at 375px, a11y basics, console errors
npm run og         # re-capture public/og.png from the running dev server
```

When starting the dev server in an agent session, use `astro dev --background` and manage it with `astro dev stop|status|logs`.
