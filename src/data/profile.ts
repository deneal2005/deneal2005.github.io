/**
 * Who this site belongs to. Everything personal lives in this file.
 *
 * Rules the UI follows:
 * - An empty string or empty list hides whatever depends on it. Nothing renders
 *   half-filled, and nothing is ever made up to fill a gap.
 * - Every fact below comes from the owner or from the projects themselves.
 *   Replace anything that doesn't sound like you.
 * - No location or nationality anywhere: the introduction stays location-neutral.
 */
export const profile = {
  name: 'Delin Thangjam',
  /** Used where the full name doesn't fit (small screens). */
  shortName: 'D. Thangjam',
  /** Your title, in your words. */
  role: 'Developer',

  /** The one-sentence version, first person. Shown in the hero and in link previews. */
  statement:
    'I build web apps end to end: the interface, the server behind it and the database rules underneath.',

  /** Who I am / What I do, for Sector 02 (The Soldier). Keep each to a few sentences. */
  about: {
    who: 'I’m Delin Thangjam, a developer studying Artificial Intelligence and Data Science.',
    what: 'I build for the web end to end. RentMate is a Next.js app running on its own NestJS and PostgreSQL API, with payments, chat and a trust-and-safety console; GreenUP runs on plain HTML, CSS and JavaScript with Supabase underneath. The work keeps returning to the unglamorous parts: an upload queue that survives a dropped connection, a payment path that stays consistent under concurrent requests, a README that says plainly what is still simulated. Next on my path: backend engineering.',
    /** Short phrases. Empty lists are hidden. */
    exploring: [] as string[],
    learning: [] as string[],
  },

  /** Optional real photo for the dossier in The Soldier, e.g. { src: '/portrait.jpg', alt: '…' }. Empty: the dossier says no photograph is on file. */
  portrait: null as { src: string; alt: string } | null,

  links: {
    /** GitHub username. Drives the profile link and the build-time activity data. */
    github: 'deneal2005',
    /** Full profile URL. Shown as the LinkedIn icon. Empty: hidden everywhere. */
    linkedin: 'https://www.linkedin.com/in/deneal2005',
    /** Public email. Shown as the mail icon (mailto:). PUBLIC_CONTACT_EMAIL overrides it. Empty: hidden. */
    email: 'delinthangjam@gmail.com',
    /** Phone in international format, digits only after the +. Shown as the phone icon (tel:). Empty: hidden. */
    phone: '+919862667033',
    /** Path under /public, e.g. '/resume.pdf'. Empty: every résumé link is hidden. */
    resume: '',
    /** Anything else worth linking. */
    other: [] as { label: string; href: string }[],
  },

  /** Public repositories left out of the commit activity chart. */
  hiddenRepos: ['test'],
};

export const githubUrl = profile.links.github ? `https://github.com/${profile.links.github}` : '';
