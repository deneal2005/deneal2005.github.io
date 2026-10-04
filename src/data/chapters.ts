/** The volume's table of contents. Order here is the order on the page. */
export interface Chapter {
  id: string;
  label: string;
  title: string;
  ja: string;
  /** Reading of the Japanese title, for the contents page. */
  romaji: string;
}

export const chapters: Chapter[] = [
  { id: 'prologue', label: 'Prologue', title: 'Every line is final', ja: '序', romaji: 'Jo' },
  { id: 'hand', label: 'Chapter 01', title: 'The Hand', ja: '職人', romaji: 'Shokunin' },
  { id: 'path', label: 'Chapter 02', title: 'The Path', ja: '道', romaji: 'Michi' },
  { id: 'work', label: 'Chapter 03', title: 'The Work', ja: '作品', romaji: 'Sakuhin' },
  { id: 'precepts', label: 'Chapter 04', title: 'Precepts', ja: '心得', romaji: 'Kokoroe' },
  { id: 'keiko', label: 'Chapter 05', title: 'Keiko', ja: '稽古', romaji: 'Keiko' },
  { id: 'journey', label: 'Chapter 06', title: 'Journey', ja: '修行', romaji: 'Shugyō' },
  { id: 'invitation', label: 'Final chapter', title: 'The Invitation', ja: '続く', romaji: 'Tsuzuku' },
];

export const chapterById = (id: string) => {
  const chapter = chapters.find((c) => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter "${id}"`);
  return chapter;
};
