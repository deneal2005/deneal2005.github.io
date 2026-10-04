/**
 * Chapter 04 — four ideas, each tied to a place it shows up in real work.
 * The rule and body are opinion; the `seenIn` line is fact, taken from the
 * project's public README. Rewrite any of it in your own voice.
 */
export interface Precept {
  ja: string;
  name: string;
  rule: string;
  body: string;
  seenIn: { project: string; href: string; note: string };
}

export const precepts = {
  ma: {
    ja: '間',
    name: 'Ma',
    rule: 'The pause is part of the sentence.',
    body: 'Empty space isn’t what’s left over. It’s where the eye rests, so it gets designed first.',
    seenIn: { project: 'Scriptly', href: '/work/scriptly/', note: 'Plain text by default. Timestamps only when you ask for them.' },
  },
  kata: {
    ja: '型',
    name: 'Kata',
    rule: 'Form first. Then freedom.',
    body: 'Tokens, themes and type scales, settled early, so every screen after them can move faster.',
    seenIn: { project: 'GreenUP', href: '/work/greenup/', note: 'One stylesheet is the design system, light and dark themes included.' },
  },
  shuhari: {
    ja: '守破離',
    name: 'Shu · Ha · Ri',
    rule: 'Learn the rule. Break the rule. Leave the rule.',
    body: 'Conventions get questioned once. The ones that answer stay.',
    seenIn: { project: 'GreenUP', href: '/work/greenup/', note: 'No framework and no build step: plain HTML, CSS and JavaScript as ES modules.' },
    stages: [
      { ja: '守', name: 'Shu', gloss: 'Follow' },
      { ja: '破', name: 'Ha', gloss: 'Break' },
      { ja: '離', name: 'Ri', gloss: 'Leave' },
    ],
  },
  zanshin: {
    ja: '残心',
    name: 'Zanshin',
    rule: 'The cut doesn’t end when the blade stops.',
    body: 'Shipping is the midpoint. What happens after the click is part of the work.',
    seenIn: {
      project: 'GreenUP',
      href: '/work/greenup/',
      note: 'The before photo can’t be lost: it’s stored the moment you pick it, and the upload resumes after a crash.',
    },
  },
} satisfies Record<string, Precept & Record<string, unknown>>;
