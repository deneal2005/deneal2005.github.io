/**
 * Education, oldest first. Shown in Chapter 01 as a timeline; the entry with
 * `current: true` is marked as ongoing.
 */
export interface EducationEntry {
  title: string;
  subtitle: string;
  start: number;
  /** Shown after the start year, e.g. "2022" or "Expected 2029". */
  end: string;
  status?: string;
  current?: boolean;
}

export const education: EducationEntry[] = [
  {
    title: 'Emmanuel English Academy, Manipur',
    subtitle: 'Nursery – Class 10',
    start: 2011,
    end: '2022',
  },
  {
    title: 'Emmanuel English Academy Higher Secondary, Manipur',
    subtitle: 'PCM (Physics, Chemistry, Mathematics)',
    start: 2022,
    end: '2024',
  },
  {
    title: 'B.Tech in Artificial Intelligence and Data Science',
    subtitle: 'Excel Engineering College – Anna University',
    start: 2025,
    end: 'Expected 2029',
    status: 'Currently pursuing',
    current: true,
  },
];
