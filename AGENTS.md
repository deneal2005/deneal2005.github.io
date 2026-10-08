# Working on this repo

Delin Thangjam's portfolio, set as a dark cinematic film: a scroll-scrubbed opening reel, then chapters cut like scenes. Astro 7, static output, no client framework.

## Ground rules

- **Never invent personal information.** No made-up projects, clients, metrics, dates, skills or quotes. Facts come from `src/data/profile.ts`, the Markdown content, or the projects themselves. A missing field stays empty and its UI hides itself.
- **Projects are only RentMate and GreenUP** (`src/content/work`). Don't add GitHub repositories as projects. RentMate's repo is private: link the live site only.
- **Skills are the roadmap in `src/data/path.ts`**, as the owner wrote it. Don't add skills. Names stay concise ("SQL", "Linux", "DSA"): no "basics", sub-topics or beginner descriptions. Only add a `usedIn` link when the project's code really uses the skill.
- **No location or nationality** in the introduction, hero, metadata or anywhere describing where the owner is based. (The GitHub profile's location field is wrong; never use it.)
- LinkedIn, email and phone render as icons only (`ProfileLinks`), never as raw URLs or addresses.
- Keep the visual system: tokens in `src/styles/tokens.css`, motion in `src/styles/motion.css`. Dark ground, bone type, gold (`--gold`, alias `--shu`) only for the occasional accent; small accent text uses `--gold-light`. No neon, glow or busy gradients.
- **Never commit or deploy `public/media/`.** It holds third-party footage and music for local preview only (git-ignored). Builds without it must keep working: the hero falls back to `WallScene` and the sound toggle hides (`src/lib/media.ts`).
- Every animation must respect `prefers-reduced-motion`, and content must be readable without JavaScript (hidden states only apply under `html.js`).

## Where things live

| What | Where |
| --- | --- |
| Name, role, statement, links (LinkedIn, email, phone), résumé | `src/data/profile.ts` |
| Education (Chapter 01) | `src/data/education.ts` |
| "Currently" panel | `src/data/now.ts` |
| Skills roadmap (Chapter 02) | `src/data/path.ts` |
| Precepts (Chapter 04) | `src/data/precepts.ts` |
| Projects | `src/content/work/*.md` |
| Experiments | `src/content/experiments/*.md` |
| Journey entries | `src/content/journey/*.md` (copy `_template.md`) |
| Generated images ("plates") | `src/lib/plates/`, served from `/plates/{name}-{a,b}.svg` |
| Build-time GitHub data | `src/lib/github.ts` |
| Opening reel (scroll-scrubbed video) | `src/components/sections/Hero.astro`, `src/scripts/reel.ts`, media in `public/media/` (git-ignored) |

## Commands

```
npm run dev        # dev server
npm run check      # types and content schemas
npm run build      # static build into dist/
npm run qa         # crawl a running site: links, overflow at 375px, a11y basics, console errors
npm run og         # re-capture public/og.png from the running dev server
```

When starting the dev server in an agent session, use `astro dev --background` and manage it with `astro dev stop|status|logs`.
