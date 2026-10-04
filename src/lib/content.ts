/**
 * Content queries shared across pages, and the skills index built from them.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { skillGroups } from '../data/skills';

export const getWorks = async () => (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);

export const getJourney = async () =>
  (await getCollection('journey')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const getExperiments = async () =>
  (await getCollection('experiments')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

/** A journey entry gets its own page only when it has a body. */
export const hasPage = (entry: CollectionEntry<'journey'>) => Boolean(entry.body?.trim());

export const journeyHref = (entry: CollectionEntry<'journey'>) =>
  hasPage(entry) ? `/journey/${entry.id}/` : `/journey/#${entry.id}`;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (date: Date | string) => dateFormat.format(typeof date === 'string' ? new Date(date) : date);

export interface IndexRef {
  label: string;
  href: string;
  kind: 'Project' | 'Experiment' | 'Journey';
}

export interface IndexTerm {
  term: string;
  refs: IndexRef[];
}

/**
 * The skills index: every term from every `stack`, filed under its group and
 * pointing at where it was used. Nothing appears here that isn't used somewhere.
 */
export async function buildSkillsIndex() {
  const [works, experiments, journey] = await Promise.all([getWorks(), getExperiments(), getJourney()]);
  const refs = new Map<string, IndexRef[]>();
  const add = (term: string, ref: IndexRef) => {
    const list = refs.get(term) ?? [];
    if (!list.some((r) => r.href === ref.href)) list.push(ref);
    refs.set(term, list);
  };

  for (const w of works) for (const t of w.data.stack) add(t, { label: w.data.title, href: `/work/${w.id}/`, kind: 'Project' });
  for (const e of experiments)
    for (const t of e.data.stack) add(t, { label: e.data.title, href: `/#study-${e.id}`, kind: 'Experiment' });
  // Journey entries only add terms not already covered by a project they belong to.
  for (const j of journey)
    for (const t of j.data.stack) {
      if (j.data.project && refs.get(t)?.some((r) => r.href === `/work/${j.data.project?.id}/`)) continue;
      add(t, { label: j.data.title, href: journeyHref(j), kind: 'Journey' });
    }

  const filed = new Set<string>();
  const groups = skillGroups
    .map((group) => ({
      name: group.name,
      terms: group.terms
        .filter((term) => refs.has(term))
        .map((term) => {
          filed.add(term);
          return { term, refs: refs.get(term) ?? [] };
        }),
    }))
    .filter((group) => group.terms.length > 0);

  const unfiled = [...refs.keys()].filter((t) => !filed.has(t)).sort((a, b) => a.localeCompare(b));
  if (unfiled.length) groups.push({ name: 'Also used', terms: unfiled.map((term) => ({ term, refs: refs.get(term) ?? [] })) });

  return groups;
}
