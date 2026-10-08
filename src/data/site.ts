import { PUBLIC_CONTACT_EMAIL } from 'astro:env/client';
import { profile } from './profile';

/** Site-level settings derived from the profile. Edit src/data/profile.ts, not this file. */
export const site = {
  ...profile,
  email: PUBLIC_CONTACT_EMAIL || profile.links.email,
  title: `${profile.name}: ${profile.role}`,
  description: `${profile.name}, ${profile.role.toLowerCase()}. ${profile.statement}`,
};
