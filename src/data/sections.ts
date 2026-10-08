/**
 * The site's sections, in page order. Each is a sector of the world: a
 * military number, an English title, its Japanese name and reading, and the
 * short label used in the navigation.
 */
export interface Section {
  id: string;
  /** Two-digit sector number. */
  no: string;
  title: string;
  /** Short label for the navigation bar. */
  nav: string;
  ja: string;
  /** Reading of the Japanese title. */
  reading: string;
  /** What the sector holds, set as its classification line. */
  file: string;
}

export const sections: Section[] = [
  { id: 'wall', no: '01', title: 'The Wall', nav: 'Wall', ja: '壁', reading: 'Kabe', file: 'Introduction' },
  { id: 'soldier', no: '02', title: 'The Soldier', nav: 'Soldier', ja: '兵士', reading: 'Heishi', file: 'Personnel file' },
  { id: 'arsenal', no: '03', title: 'The Arsenal', nav: 'Arsenal', ja: '武器庫', reading: 'Bukiko', file: 'Skills and tools' },
  { id: 'expeditions', no: '04', title: 'The Expeditions', nav: 'Expeditions', ja: '遠征', reading: 'Ensei', file: 'Projects' },
  { id: 'campaigns', no: '05', title: 'The Campaigns', nav: 'Campaigns', ja: '戦歴', reading: 'Senreki', file: 'Record of work' },
  { id: 'beyond', no: '06', title: 'Beyond the Wall', nav: 'Contact', ja: '壁の外', reading: 'Kabe no soto', file: 'Contact' },
];

export const sectionById = (id: string) => {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section "${id}"`);
  return section;
};
