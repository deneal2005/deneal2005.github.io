# Working on this repo

Delin Thangjam's portfolio, set in a dark Japanese military world: a colossal wall and a titan that breaks through it as you scroll, then six sectors filed like military records. Astro 7, static output, no client framework.

## Ground rules

- **Never invent personal information.** No made-up projects, clients, metrics, dates, skills or quotes. Facts come from `src/data/profile.ts`, the Markdown content, or the projects themselves. A missing field stays empty and its UI hides itself.
- **Projects are only RentMate and GreenUP** (`src/content/work`). Don't add GitHub repositories as projects. RentMate's repo is private: link the live site only.
- **Skills are the roadmap in `src/data/path.ts`**, as the owner wrote it. Don't add skills. Names stay concise ("SQL", "Linux", "DSA"): no "basics", sub-topics or beginner descriptions. Only add a `usedIn` link when the project's code really uses the skill.
- **No location or nationality** in the introduction, hero, metadata or anywhere describing where the owner is based. (The GitHub profile's location field is wrong; never use it.)
- LinkedIn, email and phone render as icons only (`ProfileLinks`), never as raw URLs or addresses.
- Keep the visual system: tokens in `src/styles/tokens.css`, motion in `src/styles/motion.css`. Dark ground, bone type, red (`--red`) only as a signal (primary action, active sector, seals, warnings, section numbers); red text uses `--red-light`. No neon, glow or busy gradients.
- Japanese text must mean what it says and fit its place (sector labels, classifications, stamps, warnings). Never decorative filler.
- All art is original and drawn in code. Never copy official Attack on Titan logos, characters, panels or promotional art.
- The opening sequence must stay compositor-only: animate `transform`/`opacity` on separate elements, never per-frame paint properties (see README, "The opening sequence").
- `public/media/`: the opening footage (`reel-*`) and soundtrack (`theme.mp3`) are committed and deployed by the owner's choice; they are third-party *Attack on Titan* material, so expect they may need removing on a takedown. Anything else there (e.g. `portrait.jpg`) stays git-ignored. Builds must keep working without any of it: the hero opens on the wall and the sound toggle hides (`src/lib/media.ts`).
- Every animation must respect `prefers-reduced-motion`, and content must be readable without JavaScript (hidden states only apply under `html.js`).

## Where things live

| What | Where |
| --- | --- |
| Name, role, statement, links (LinkedIn, email, phone), résumé | `src/data/profile.ts` |
| Education (Sector 02) | `src/data/education.ts` |
| "Currently" panel | `src/data/now.ts` |
| Skills roadmap (Sector 03) | `src/data/path.ts` |
| Sector names, numbers, Japanese titles | `src/data/sections.ts` |
| Projects | `src/content/work/*.md` (presented by `src/components/work/ProjectSpread.astro`) |
| Navigation (command bar, rail, mobile dock, operations map) | `src/components/chrome/` |
| Journey entries | `src/content/journey/*.md` (copy `_template.md`) |
| Generated images ("plates") | `src/lib/plates/`, served from `/plates/{name}-{a,b}.svg` |
| Build-time GitHub data | `src/lib/github.ts` |
| Opening sequence (wall, titan) | `src/components/sections/Hero.astro`, `src/lib/titan.ts`, `src/scripts/wall.ts`; local-only footage in `public/media/` (git-ignored) |

## Commands

```
npm run dev        # dev server
npm run check      # types and content schemas
npm run build      # static build into dist/
npm run qa         # crawl a running site: links, overflow at 375px, a11y basics, console errors
npm run og         # re-capture public/og.png from the running dev server
```

When starting the dev server in an agent session, use `astro dev --background` and manage it with `astro dev stop|status|logs`.
