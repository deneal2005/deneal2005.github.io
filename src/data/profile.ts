/**
 * Who this volume belongs to. Everything personal lives in this file.
 *
 * Rules the UI follows:
 * - An empty string or empty list hides whatever depends on it. Nothing renders
 *   half-filled, and nothing is ever made up to fill a gap.
 * - Every fact below comes from a public source (GitHub profile and public
 *   repositories) or was written for this site. Replace anything that doesn't
 *   sound like you.
 */
export const profile = {
  name: 'Delin Thangjam',
  /** Used where the full name doesn't fit (small screens). */
  shortName: 'D. Thangjam',
  /** Your title, in your words. */
  role: 'Developer',
  location: { city: 'Tokyo', timeZone: 'Asia/Tokyo' },

  /** The one-sentence version, first person. Shown in the hero and in link previews. */
  statement:
    'I build web apps end to end: the interface, the server behind it and the database rules underneath.',

  /** Who I am / What I do, for Chapter 01. Keep each to a few sentences. */
  about: {
    who: 'I’m Delin Thangjam, a developer in Tokyo.',
    what: 'I build for the web end to end. RentMate is a Next.js app running on its own NestJS and PostgreSQL API, with payments, chat and a trust-and-safety console; GreenUP runs on plain HTML, CSS and JavaScript with Supabase underneath. The work keeps returning to the unglamorous parts: an upload queue that survives a dropped connection, a payment path that stays consistent under concurrent requests, a README that says plainly what is still simulated. Next on my path: backend engineering in Japan.',
    /** Short phrases. Empty lists are hidden. */
    exploring: [] as string[],
    learning: [] as string[],
  },

  /** Optional real photo for Chapter 01, e.g. { src: '/portrait.jpg', alt: '…' }. Empty: a printed plate stands in. */
  portrait: null as { src: string; alt: string } | null,

  links: {
    /** GitHub username. Drives the profile link and the build-time activity data. */
    github: 'deneal2005',
    /** Full URL, e.g. 'https://www.linkedin.com/in/your-handle/'. Empty: hidden everywhere. */
    linkedin: '',
    /** Public email. Can also be set with PUBLIC_CONTACT_EMAIL. Empty: the contact chapter leads with GitHub. */
    email: '',
    /** Path under /public, e.g. '/resume.pdf'. Empty: every résumé link is hidden. */
    resume: '',
    /** Anything else worth linking. */
    other: [] as { label: string; href: string }[],
  },

  /** Public repositories left out of the commit activity chart. */
  hiddenRepos: ['test'],
};

export const githubUrl = profile.links.github ? `https://github.com/${profile.links.github}` : '';
