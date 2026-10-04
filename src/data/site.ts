import { PUBLIC_CONTACT_EMAIL } from 'astro:env/client';
import { profile } from './profile';

/** Site-level settings derived from the profile. Edit src/data/profile.ts, not this file. */
export const site = {
  ...profile,
  email: PUBLIC_CONTACT_EMAIL || profile.links.email,
  /** The volume's own title (the design concept), distinct from the owner's name. */
  volumeTitle: 'Hamon',
  volume: 'Vol. 01',
  edition: 'First edition, October 2026',
  title: `${profile.name}: ${profile.role}, ${profile.location.city}`,
  description: `${profile.name}, ${profile.role.toLowerCase()} in ${profile.location.city}. ${profile.statement}`,
};
