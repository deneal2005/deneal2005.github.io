/**
 * The Index. You don't list skills here: they're collected automatically from
 * the `stack` of every project, experiment and journey entry, so each term
 * links to where it was actually used.
 *
 * This file only decides which group a term is filed under. Spell terms the
 * same way everywhere. Anything not listed lands in "Also used".
 */
export const skillGroups: { name: string; terms: string[] }[] = [
  { name: 'Languages', terms: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL', 'Python'] },
  { name: 'Frontend', terms: ['Astro', 'ES modules', 'Canvas 2D', 'SVG', 'View Transitions', 'IndexedDB', 'Pointer Events'] },
  { name: 'Backend & data', terms: ['Node.js', 'Express', 'Supabase', 'PostgreSQL', 'Row-level security', 'yt-dlp', 'REST APIs'] },
  { name: 'Platforms & tools', terms: ['Google Maps API', 'OpenStreetMap', 'Docker', 'Render', 'GitHub Pages', 'Git & GitHub', 'Jupyter'] },
  { name: 'AI', terms: ['Claude Code'] },
];

/**
 * Things you're actively learning but haven't used in anything on this site yet.
 * Shown under the index as "In progress". Empty: hidden.
 */
export const learning: string[] = [];
