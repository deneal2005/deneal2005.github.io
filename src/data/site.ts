import { PUBLIC_CONTACT_EMAIL } from 'astro:env/client';

/**
 * Identity. Everything a new owner needs to change about who this volume
 * belongs to lives here; the case studies live in src/content/work.
 */
export const site = {
  brand: 'HAMON',
  brandJa: '刃文',
  person: 'Ren Asano',
  title: 'HAMON — Every line is final',
  description:
    'HAMON is the independent practice of Ren Asano: art direction, interface design and creative engineering for brands that would rather be remembered than noticed.',
  volume: 'Vol. 01',
  span: '2019–2026',
  edition: 'First edition, October 2026',
  email: PUBLIC_CONTACT_EMAIL,
  location: { city: 'Tokyo', timeZone: 'Asia/Tokyo' },
  availability: 'Two commissions a season. Next opening: spring 2027.',
  responseTime: 'Replies within two working days.',
  /** Optional profiles; anything listed here is rendered in the final chapter. */
  socials: [] as { label: string; href: string }[],
} as const;
