/** Content queries shared across pages. */
import { getCollection, type CollectionEntry } from 'astro:content';

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
