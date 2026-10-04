# Hamon, Vol. 01

The portfolio of **Delin Thangjam**, set as a manga volume: a prologue, chapters, a contents page with live page numbers, and a colophon at the back. The design borrows from Japanese print rather than anime: halftone screens, misregistered ink, panel borders, lots of empty paper.

Everything on the site is either a public fact (GitHub profile, public repositories and their READMEs) or something written for the site. Nothing is invented. Fields that aren't filled in yet hide themselves instead of showing placeholders.

**Stack:** Astro 7 (static output) · TypeScript · plain CSS with design tokens · no client framework · under 5 KB of JavaScript (gzipped) on first load, plus the lab studies, which load only when you scroll to them.

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

Almost everything is edited in one of three places: **`src/data/`** for identity, **`src/content/`** for projects, experiments and journey entries, and **`public/`** for files like a résumé.

### Your identity: `src/data/profile.ts`

Name, role, city, the one-sentence statement, the About text and every link. An empty value hides whatever depends on it:

| Field | When empty |
| --- | --- |
| `links.linkedin` | No LinkedIn link anywhere |
| `links.email` (or `PUBLIC_CONTACT_EMAIL`) | The contact chapter leads with GitHub, and "Copy email" disappears |
| `links.resume` | No résumé link. To add one, put `resume.pdf` in `public/` and set `resume: '/resume.pdf'` |
| `about.exploring`, `about.learning` | Those lists are hidden in Chapter 01 |
| `portrait` | A printed sunrise plate stands in for a photo |

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

### An experiment: `src/content/experiments/`

Copy `_template.md`. Experiments are exploration, not product. Without a `demo` they're listed as lab notes in Chapter 05, with optional repository and live links.

### Skills

There's no list of skills to maintain. The index in Chapter 02 is built from the `stack` field of every project, experiment and journey entry, and each term links to where it was used. `src/data/skills.ts` only decides which group a term is filed under (anything unknown lands in "Also used") and holds an optional "in progress" list for things you're learning but haven't used anywhere yet.

### Japanese characters

The mincho font is subset at build time to exactly the characters used under `src/`. If you add new kanji, restart the dev server so they're included.

---

## GitHub data

At build time the site asks the GitHub API for your public repositories and weekly commit counts. That powers the activity chart, the repository list and the "last pushed" line. No token is needed. If GitHub can't be reached, those areas say so instead of showing anything made up. For offline builds set `GITHUB_OFFLINE=true`. Setting `GITHUB_TOKEN` only raises the rate limit. It stays on the build server and never reaches the browser.

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

## Deploying

The build is a folder of static files (`dist/`), so it runs on any static host. Since this repository is private, GitHub Pages would need a paid plan; these work for free:

- **Vercel / Netlify / Cloudflare Pages:** import the repository. Build command `npm run build`, output directory `dist`, and set `PUBLIC_SITE_URL` in the project's environment variables.
- **Anything else:** run `npm run build` and upload `dist/`.

To keep the GitHub data fresh, add a scheduled redeploy, for example a daily deploy hook called from a cron job or a scheduled GitHub Action.

CI (`.github/workflows/ci.yml`) runs the type and content checks, the build and the QA crawl on every push and pull request.

---

## Project structure

```
src/
  data/          profile, now, skills groups, precepts, chapter list
  content/       work/, experiments/, journey/ (Markdown, with _template.md files)
  components/
    chrome/      masthead, contents dialog, folio rail, colophon
    sections/    the homepage chapters, in reading order
    journey/     Currently panel, timeline, GitHub activity chart, repository list
    motifs/      the opening scene, temper-line divider, cut-sun mark
    ui/          shared pieces: plate frame, chapter opener, links, arrow
    work/        the exhibition spread
  lib/           drawing helpers, scene geometry, plates, GitHub client, content queries
  pages/         routes: /, /work/[slug], /journey, /journey/[slug], /plates/*.svg, 404, sitemap, robots
  scripts/       client JS: reveals, chrome, contents dialog, interactions, lab studies
  styles/        tokens, base, motion
scripts/         QA crawl, screenshots, icon rendering, glyph collection for the font subset
```

## Design system

- **Colour:** named after traditional pigments. Sumi (ink), washi (paper), shu (vermilion, the sun), enji (crimson, for small red text), plus charcoal, greys and a little gold. Defined once in `src/styles/tokens.css`. Ink chapters switch tone with `data-tone="ink"`.
- **Type:** Noto Serif Display at its narrowest width for display, Archivo for text, IBM Plex Mono for metadata, Shippori Mincho B1 for Japanese. All self-hosted, with metric-matched fallbacks.
- **Motion:** four durations and three easings. Reveals wait for the display font, so type never reflows mid-animation. Page changes use cross-document view transitions: the new page is revealed from the left, the way a right-bound book turns.
- **Accessibility:** semantic landmarks, a skip link, visible focus, a native `<dialog>` for the contents, keyboard-readable chart with a table view, and reduced-motion support throughout.

## Still to fill in

Things only you can provide. Each one is a single field, and nothing shows until it's set:

- [ ] Your role in your own words (`profile.role`, plus a `role:` line on each project)
- [ ] LinkedIn URL (`profile.links.linkedin`)
- [ ] A public email (`profile.links.email` or `PUBLIC_CONTACT_EMAIL`)
- [ ] Résumé PDF (`public/resume.pdf` + `profile.links.resume`)
- [ ] What you're learning and exploring (`profile.about`, `now.ts`, `skills.ts`)
- [ ] Screenshots of GreenUP and Scriptly (`screens:` in their project files)
- [ ] "What I learned" sections in the case studies
- [ ] `PUBLIC_SITE_URL` once the site is deployed, then `npm run og`

## Credits

Fonts under the SIL Open Font License: Noto Serif Display, Archivo, IBM Plex Mono, Shippori Mincho B1. Every image is generated from code in this repository.
