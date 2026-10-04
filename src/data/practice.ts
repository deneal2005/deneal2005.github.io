/** Copy for Chapter 02 (Precepts) and Chapter 04 (The Hand). */

export const precepts = {
  ma: {
    ja: '間',
    name: 'Ma',
    rule: 'The pause is part of the sentence.',
    body: 'Negative space isn’t what’s left over. It’s where the eye rests and the meaning lands, so I design the silence first and place everything else around it.',
  },
  kata: {
    ja: '型',
    name: 'Kata',
    rule: 'Form first. Then freedom.',
    body: 'Grids, tokens, type scales: practised until they disappear. Improvisation only looks effortless when it stands on something rigid.',
  },
  shuhari: {
    ja: '守破離',
    name: 'Shu · Ha · Ri',
    rule: 'Learn the rule. Break the rule. Leave the rule.',
    body: 'Every convention gets questioned once. The ones that answer stay. The rest get cut.',
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
    body: 'Launch is the midpoint. I stay for the measuring, the fixing and the second polish.',
  },
} as const;

/** The method is a real sequence, borrowed from how a blade is made. */
export const method = [
  {
    ja: '鍛',
    name: 'Fold',
    body: 'Steel is folded until the impurities are hammered out. Dozens of rough directions, reduced to the one that survives.',
  },
  {
    ja: '焼',
    name: 'Temper',
    body: 'Clay goes on thick where a blade must flex and thin where it must cut. Structure exactly where it’s needed, nowhere else.',
  },
  {
    ja: '研',
    name: 'Polish',
    body: 'Polishing takes longer than forging. It’s also the only stage where the line becomes visible, so it happens in production code, not in mock-ups.',
  },
] as const;

export const capabilities = [
  'Art direction & identity',
  'Interface & product design',
  'Creative engineering: front-end, WebGL, motion',
  'Typography & editorial systems',
  'Design systems that survive engineering',
] as const;

export const experience = [
  { years: '2021 — Now', place: 'HAMON', role: 'Founder, independent practice' },
  { years: '2017 — 2021', place: 'North Arc, Copenhagen', role: 'Design director' },
  { years: '2014 — 2017', place: 'Fieldwork, Tokyo', role: 'Designer & creative developer' },
  { years: '2010 — 2014', place: 'Kyoto', role: 'Studied graphic design. Taught myself to code at night.' },
] as const;
