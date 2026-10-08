# Hamon, Vol. 01

The portfolio of **Delin Thangjam**, set as a film: an opening reel you scrub with the scroll wheel, chapters cut like scenes, a contents page with live page numbers, and a colophon at the back. Dark, cinematic and restrained: near-black, steel, muted military green, bronze and a little gold, with film-title typography.

Everything on the site is either a fact from the projects themselves (their code, READMEs and live sites) or something written for the site. Nothing is invented. Fields that aren't filled in yet hide themselves instead of showing placeholders.

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

Name, role, the one-sentence statement, the About text and every link. The site deliberately states no location. An empty value hides whatever depends on it:

| Field | When empty |
| --- | --- |
| `links.linkedin` | No LinkedIn icon anywhere |
| `links.email` (or `PUBLIC_CONTACT_EMAIL`) | No email icon, and "Copy email" disappears |
| `links.phone` | No phone icon. Use the international format, e.g. `+919862667033` |
| `links.resume` | No résumé link. To add one, put `resume.pdf` in `public/` and set `resume: '/resume.pdf'` |
| `about.exploring`, `about.learning` | Those lists are hidden in Chapter 01 |
| `portrait` | A printed sunrise plate stands in for a photo |

LinkedIn, email and phone always appear as icons (`tel:` and `mailto:` links), never as raw URLs or addresses.

### Education: `src/data/education.ts`

Shown in Chapter 01 as a timeline, oldest first. Mark the ongoing entry with `current: true` and a `status`.

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

### Skills: `src/data/path.ts`

Chapter 02, The Path, is the roadmap toward software backend engineering in Japan: eleven areas, from Java fundamentals to Japanese, exactly as in the roadmap. Each skill can carry:

- `usedIn: ['rentmate']`: the file name of a project or journey entry where the skill really shows up. It renders as a link, and the build fails if the name doesn't exist.
- `status: 'learning'` or `'comfortable'`: a small label, shown only when set.

The Japanese area has a JLPT ladder (`ladder.current` marks where you are now; the target is N3).

### Japanese characters

The mincho font is subset at build time to exactly the characters used under `src/`. If you add new kanji, restart the dev server so they're included.

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

## The opening reel

The homepage opens on a tall (about 420vh) section whose sticky frame plays a video as a scroll-controlled image sequence: scroll progress maps directly to playback position, forward and backward (`src/scripts/reel.ts`). The owner's statement is cut into title cards timed against the reel, with a closing credit before the first chapter.

The reel's media lives in `public/media/`, which is **git-ignored**. The footage and soundtrack used while developing are third-party, copyrighted material, so they are never committed or deployed. Builds without them (CI, GitHub Pages) show an original scene in their place (`src/components/motifs/WallScene.astro`) that still moves with the scroll, and the sound toggle hides itself. To use footage you own or have licensed, drop these files into `public/media/` and remove the folder from `.gitignore`:

| File | What |
| --- | --- |
| `hero-720.mp4` | The reel. H.264, no audio, short GOP so seeking stays instant. |
| `hero-480.mp4` | Optional phone version. |
| `hero-poster.jpg` | Optional first frame, shown until the reel loads. |
| `theme.mp3` | Optional soundtrack. Off until the visitor presses Sound in the masthead. |

Encode the reel with a keyframe every few frames, or scrubbing stutters:

```
ffmpeg -i source.mp4 -an -vf "fps=24,scale=1280:-2" -c:v libx264 -preset slow -crf 26 -g 6 -bf 0 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart public/media/hero-720.mp4
```

The reel is fetched whole before the first seek, skipped entirely with Save-Data, and replaced by the poster under reduced motion.

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
  data/          profile, now, the skills path, precepts, chapter list
  content/       work/, experiments/, journey/ (Markdown, with _template.md files)
  components/
    chrome/      masthead, contents dialog, folio rail, colophon
    sections/    the homepage chapters, in reading order
    journey/     Currently panel, timeline, GitHub activity chart
    motifs/      the reel's fallback scene, temper-line divider, cut-sun mark
    ui/          shared pieces: plate frame, chapter opener, links, arrow
    work/        the exhibition spread
  lib/           drawing helpers, plates, reel media lookup, GitHub client, content queries
  pages/         routes: /, /work/[slug], /journey, /journey/[slug], /plates/*.svg, 404, sitemap, robots
  scripts/       client JS: the reel, sound, reveals, chrome, contents dialog, interactions, lab studies
  styles/        tokens, base, motion
scripts/         QA crawl, screenshots, icon rendering, glyph collection for the font subset
```

## Design system

- **Colour:** near-black (`--void`), charcoal, dark steel, a muted military green, bronze, dark gold and a warm off-white (`--bone`). Gold is the single accent and is used sparingly. Defined once in `src/styles/tokens.css`; the first edition's pigment names (`--sumi`, `--washi`, `--shu`…) remain as aliases by role. Alternate chapters (`data-tone="ink"`) sit on a green-black ground that fades in and out of the void, so there are no seams between scenes.
- **Type:** Noto Serif Display at its narrowest width for display, Archivo for text, IBM Plex Mono for metadata, Shippori Mincho B1 for Japanese. All self-hosted, with metric-matched fallbacks.
- **Motion:** four durations and three easings, restrained and deliberate. Type surfaces with a focus pull (blur to sharp) and settles; the reel's camera pushes in slowly as you scroll. Reveals wait for the display font, so type never reflows mid-animation. Page changes cut through black with cross-document view transitions.
- **Accessibility:** semantic landmarks, a skip link, visible focus, a native `<dialog>` for the contents, keyboard-readable chart with a table view, and reduced-motion support throughout.

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

Fonts under the SIL Open Font License: Noto Serif Display, Archivo, IBM Plex Mono, Shippori Mincho B1. Every image in the repository is generated from code. Any reel footage or soundtrack placed in `public/media/` belongs to its rights holders and stays out of the repository.
