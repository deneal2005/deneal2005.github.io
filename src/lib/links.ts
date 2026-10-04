import { githubUrl } from '../data/profile';
import { site } from '../data/site';

export type IconName = 'linkedin' | 'mail' | 'phone';

export interface ProfileLink {
  id: string;
  label: string;
  href: string;
  /** Opens in a new tab (off-site profiles, the résumé PDF). */
  newTab: boolean;
  /** rel="me" marks profiles that belong to the owner. */
  me: boolean;
  /** Contact links render as icons, never as raw addresses or URLs. */
  icon?: IconName;
  /** Shown after the label in places that have room, e.g. the handle. */
  detail?: string;
}

/** Every way to find the owner, in order of weight. Empty profile fields are skipped. */
export function profileLinks(): ProfileLink[] {
  const { links } = site;
  const list: (ProfileLink | false)[] = [
    Boolean(links.linkedin) && { id: 'linkedin', label: 'LinkedIn', href: links.linkedin, newTab: true, me: true, icon: 'linkedin', detail: 'Profile' },
    Boolean(site.email) && { id: 'email', label: 'Email', href: `mailto:${site.email}`, newTab: false, me: false, icon: 'mail', detail: 'Write to me' },
    Boolean(links.phone) && { id: 'phone', label: 'Phone', href: `tel:${links.phone}`, newTab: false, me: false, icon: 'phone', detail: 'Call' },
    Boolean(githubUrl) && { id: 'github', label: 'GitHub', href: githubUrl, newTab: true, me: true, detail: `@${links.github}` },
    Boolean(links.resume) && { id: 'resume', label: 'Résumé', href: links.resume, newTab: true, me: false, detail: 'View the PDF' },
    ...links.other.map((l) => ({ id: l.label.toLowerCase(), label: l.label, href: l.href, newTab: true, me: true })),
  ];
  return list.filter((l): l is ProfileLink => Boolean(l));
}
