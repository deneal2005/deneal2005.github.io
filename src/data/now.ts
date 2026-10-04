/**
 * Currently — what's on the desk right now. Edit by hand and bump `updated`.
 * Empty lists are hidden. Each item can link somewhere on or off the site.
 */
export interface NowItem {
  text: string;
  href?: string;
}

export const now = {
  updated: '2026-10-05',
  building: [{ text: 'This portfolio, set as a manga volume', href: '/work/hamon/' }] as NowItem[],
  learning: [] as NowItem[],
  exploring: [] as NowItem[],
  /** One sentence: what you're trying to get done. */
  goal: '',
  reading: [] as NowItem[],
};
