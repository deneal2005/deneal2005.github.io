# Delin Thangjam: portfolio

The portfolio of **Delin Thangjam**, set inside a dark Japanese military world: a colossal wall, and a titan that rises behind it and breaks through as you scroll. Six sectors follow, each filed like a military record, with Japanese labels that mean what they say. Charcoal, weathered stone and paper, metal, and red used only as a signal.

Everything on the site is either a fact from the projects themselves (their code, READMEs and live sites) or something written for the site. Nothing is invented. Fields that aren't filled in yet hide themselves instead of showing placeholders.

**Stack:** Astro 7 (static output) · TypeScript · plain CSS with design tokens · no client framework · a few KB of JavaScript (gzipped), no dependencies in the browser.

---

## Quick start

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type-checks the code and validates every content file against its schema |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serves the build locally |
| `npm run qa` | Crawls a running site: broken links and anchors, a 404 check, horizontal overflow at 375px, missing alt text, heading structure, unnamed controls, console errors, and the key interactions |
| `npm run og` | Re-captures the social preview `public/og.png` (1200×630) from the running dev server |
| `npm run icons` | Re-renders `public/apple-touch-icon.png` |

The QA and screenshot scripts drive a local Chrome or Edge in headless mode. Set `CHROME_PATH` if neither is in a standard location.

---

## Updating the site

Almost everything is edited in one of three places: **`src/data/`** for identity, **`src/content/`** for projects and log entries, and **`public/`** for files like a résumé.

### Your identity: `src/data/profile.ts`

Name, role, the one-sentence statement, the About text and every link. The site deliberately states no location. An empty value hides whatever depends on it:

| Field | When empty |
| --- | --- |
| `links.linkedin` | No LinkedIn icon anywhere |
| `links.email` (or `PUBLIC_CONTACT_EMAIL`) | No email icon, and "Copy email" disappears |
| `links.phone` | No phone icon. Use the international format, e.g. `+919862667033` |
| `links.resume` | No résumé link. To add one, put `resume.pdf` in `public/` and set `resume: '/resume.pdf'` |
| `about.exploring`, `about.learning` | Those lists are hidden in The Soldier |
| `portrait` | A printed sunrise plate stands in for a photo |

LinkedIn, email and phone always appear as icons (`tel:` and `mailto:` links), never as raw URLs or addresses.

### Education: `src/data/education.ts`

Shown in The Soldier (Sector 02) as a timeline, oldest first. Mark the ongoing entry with `current: true` and a `status`.

### What you're doing now: `src/data/now.ts`

The "Currently" panel on the homepage and the journey page. Edit the lists and bump `updated`. The "last pushed" line fills itself in from GitHub.

### A journey entry: `src/content/journey/`

Copy `_template.md` to something like `2026-11-02-learned-row-level-security.md` and fill in the frontmatter. That's the whole process: the timeline, the homepage preview, the counts and the skills index all update on their own.

- **Frontmatter only:** the entry is a row on the timeline (good for "Today I learned…").
- **Frontmatter plus a body:** it also gets its own page at `/journey/<file-name>/`, with the template's "What I tried / What worked / What failed / Next" sections.
- `project: greenup` links the entry to a case study, and the case study lists it in return.

### A project: `src/content/work/`

One Markdown file per project. The frontmatter holds the facts (summary, status, stack, features, repository and live links). The body is the case study and can contain any `##` sections you like, which become the page's table of contents. To add screenshots, put the images in `src/assets/work/` and list them under `screens:`; they're resized and served in modern formats automatically.

Each project also needs a `plate`, its generated cover image. Plates live in `src/lib/plates/index.ts`. For a new project, either write a new plate function (copy one of the existing ones) or reuse an existing plate until you do.

### Skills: `src/data/path.ts`

Sector 03, The Arsenal, is the roadmap toward software backend engineering in Japan: eleven areas, from Java fundamentals to Japanese, exactly as in the roadmap. Each skill can carry:

- `usedIn: ['rentmate']`: the file name of a project or journey entry where the skill really shows up. It renders as a link, and the build fails if the name doesn't exist.
- `status: 'learning'` or `'comfortable'`: a small label, shown only when set.

The Japanese area has a JLPT ladder (`ladder.current` marks where you are now; the target is N3).

### Japanese characters

Noto Sans JP is subset at build time to exactly the characters used under `src/`. If you add new kanji, restart the dev server so they're included.

---

## GitHub data

At build time the site asks the GitHub API for weekly commit counts across your public repositories, which powers the activity chart in the journey. Repositories are never listed as projects: only the files in `src/content/work` are. The "last pushed" line in the Currently panel only considers repositories that belong to a project. No token is needed. If GitHub can't be reached, those areas say so instead of showing anything made up. For offline builds set `GITHUB_OFFLINE=true`. Setting `GITHUB_TOKEN` only raises the rate limit. It stays on the build server and never reaches the browser.

The data is a snapshot from the last build. To keep it current, redeploy regularly (see below).

---

## Environment variables

Copy `.env.example` to `.env`. Everything is optional.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | The deployed URL. Enables canonical URLs, absolute Open Graph image URLs and the sitemap. **Set this in production.** |
| `PUBLIC_CONTACT_EMAIL` | Public email address. Overrides `profile.links.email`. |
| `GITHUB_TOKEN` | Optional. Raises the GitHub API rate limit during builds. |
| `GITHUB_OFFLINE` | `true` skips GitHub requests. |

---

## The sectors

| No. | Section | 日本語 | What |
| --- | --- | --- | --- |
| 01 | The Wall | 壁 (kabe) | The opening sequence and introduction |
| 02 | The Soldier | 兵士 (heishi) | About: a personnel dossier, education, links |
| 03 | The Arsenal | 武器庫 (bukiko) | Skills, from `src/data/path.ts` |
| 04 | The Expeditions | 遠征 (ensei) | Projects; each has an expedition report at `/work/<id>/` |
| 05 | The Campaigns | 戦歴 (senreki) | The record: Currently, latest log entries, GitHub activity; the full log is `/journey/` |
| 06 | Beyond the Wall | 壁の外 (kabe no soto) | Contact |

Sector names, numbers and Japanese titles live in `src/data/sections.ts`; the navigation, sector rail, mobile dock, operations map and footer all read from it.

**Navigation.** Desktop: a command bar with the sectors (the current one marked in red) and a sector rail with page progress in the right margin. Below desktop width: a menu button at the top, and once the opening is behind you, a dock at the bottom within thumb reach (current sector and progress, a Contact shortcut, the menu). Both open the operations map (作戦図), a full-screen menu that marks the current sector, lists the expedition reports and closes itself when you pick a destination.

**Projects** are presented as operation files (`src/components/work/ProjectSpread.astro`): a recon image (the project's first landscape screenshot, with a phone screenshot riding on it if there is one; the drawn plate otherwise), then status, objective, the first three features as capabilities, the stack as a loadout, and separate actions for the mission report, the live site and the source.

## The opening sequence

`src/components/sections/Hero.astro` is a tall (about 520vh) section with a sticky stage. Scroll progress drives one sequence, and scrolling back reverses it exactly: the wall alone → tremors, falling dust and cracks → steam behind the parapet → a head rises, a warning, a hand grips the edge → the wall breaks open at the titan's chest → the camera pulls back. All of it is original art drawn in code (geometry in `src/lib/titan.ts`); no frames or assets are copied from anywhere.

On first visit the HUD boots up (起動 System online…) while the name is stamped in. On desktop, a recon lamp with its survey grid follows the pointer, the sky and clouds drift against it for depth, and the HUD reads out the grid square under it; a scan line sweeps the frame. None of that runs on touch devices. Phones get the same sequence over a shorter run (380vh instead of 520vh), with half the dust.

How it stays smooth: every layer is its own element and moves with `transform` or `opacity` only, so the browser composites instead of repainting. Shards are individual elements, the eyes glow on their own layer, and the only painted change (the cracks) steps in twentieths. `src/scripts/wall.ts` does one layout read per frame, eases the camera, and stops work when the section is off screen. Under reduced motion, or without JavaScript, the section is one screen showing the finished scene.

### Opening footage and soundtrack

If `public/media/` holds footage, it plays as the opening shot and cuts to the wall on the first scroll; if it holds `theme.mp3`, a Sound toggle appears in the command bar. The current footage and soundtrack are third-party *Attack on Titan* material, published by the owner's decision; to take them down, delete the files (and purge them from history if needed). The dossier avatar (`portrait.jpg`, used when `profile.portrait` is empty) is published the same way. Anything else in `public/media/` is git-ignored and local only. Builds without the files still work: the page opens straight on the wall, and the Sound toggle hides itself.

| File | What |
| --- | --- |
| `reel-720.mp4` | The opening shot. H.264, no audio, colour grade baked in. |
| `reel-480.mp4` | Optional phone version. |
| `reel-poster.jpg` | Optional first frame, shown until playback starts. |
| `theme.mp3` | Optional soundtrack. Off until the visitor presses Sound. |

The footage plays natively at its own frame rate; it is never seeked from the scroll (per-frame seeking is what makes scroll-scrubbed video stutter). It loads only when the section is on screen, pauses once it has faded out or scrolled away, and is skipped under Save-Data. Bake the grade into the file instead of using CSS filters over it:

```
ffmpeg -i source.mp4 -an -vf "scale=1280:-2,eq=saturation=0.55:contrast=1.1:brightness=-0.06,vignette=PI/4.5" -r 30 -c:v libx264 -profile:v high -preset slow -crf 23 -g 60 -pix_fmt yuv420p -movflags +faststart public/media/reel-720.mp4
```

---

## Deploying

The build is a folder of static files (`dist/`), so it runs on any static host. This repository deploys to GitHub Pages at https://deneal2005.github.io/ through `.github/workflows/deploy.yml`, on every push to `main` and once a day so the GitHub data stays fresh.

- **Vercel / Netlify / Cloudflare Pages:** import the repository. Build command `npm run build`, output directory `dist`, and set `PUBLIC_SITE_URL` in the project's environment variables.
- **Anything else:** run `npm run build` and upload `dist/`.

CI (`.github/workflows/ci.yml`) runs the type and content checks, the build and the QA crawl on every push and pull request.

---

## Project structure

```
src/
  data/          profile, now, education, the skills path, sections
  content/       work/, journey/ (Markdown, with _template.md files)
  components/
    chrome/      command bar, operations map, sector rail, footer
    sections/    the homepage sectors, in order
    journey/     Currently panel, timeline, GitHub activity chart
    ui/          shared pieces: section header, insignia, plate frame, links, arrow
    work/        the expedition spread
  lib/           the wall/titan geometry, drawing helpers, plates, media lookup, GitHub client, content queries
  pages/         routes: /, /work/[slug], /journey, /journey/[slug], /plates/*.svg, 404, sitemap, robots
  scripts/       client JS: the wall sequence, sound, reveals, chrome, operations map, interactions
  styles/        tokens, base, motion
scripts/         QA crawl, screenshots, icon rendering, glyph collection for the font subset
```

## Design system

- **Colour:** charcoal and black, weathered stone, dirty beige and weathered paper (dossiers, `data-tone="paper"`), muted brown, metal, and off-white type. Red (`--red`, small text `--red-light`) is a signal only: the primary action, the active sector, seals, warnings and section numbers. Defined once in `src/styles/tokens.css`. Alternate sectors (`data-tone="ink"`) sit on charcoal that fades in and out of the void, so there are no seams.
- **Type:** Archivo at its narrowest, heaviest widths for industrial display type and at normal width for text, IBM Plex Mono for military metadata, Noto Sans JP (gothic, heavy) for Japanese labels. Japanese is used as signage and classification, always meaning what it says (第02区画, 人事記録, 在学中, 警報).
- **Motion:** restrained and deliberate. The wall sequence carries the drama (shake on impacts, dust, cracks, a red warning flash); elsewhere, type is stamped in and panels open like shutters. Page changes cut through black with cross-document view transitions.
- **Accessibility:** semantic landmarks, a skip link, visible focus, a native `<dialog>` for the operations map, `aria-current` on the active sector, a keyboard-readable chart with a table view, and reduced-motion support throughout.

## Still to fill in

Things only you can provide. Each one is a single field, and nothing shows until it's set:

- [ ] Your role in your own words (`profile.role`, plus a `role:` line on each project)
- [ ] Résumé PDF (`public/resume.pdf` + `profile.links.resume`)
- [ ] What you're learning and exploring (`profile.about`, `now.ts`), and `status` on the skills you're working on (`path.ts`)
- [ ] Your current JLPT level (`ladder.current` in `path.ts`)
- [ ] Screenshots of GreenUP (`screens:` in `greenup.md`; RentMate's are in)
- [ ] "What I learned" sections in the case studies
- [ ] `PUBLIC_SITE_URL` once the site is deployed, then `npm run og`

## Credits

Fonts under the SIL Open Font License: Archivo, IBM Plex Mono, Noto Sans JP. Every image in the repository is generated from code. Any reel footage or soundtrack placed in `public/media/` belongs to its rights holders and stays out of the repository.
