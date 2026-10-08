/**
 * 03 — The Arsenal. The skills roadmap toward software backend
 * engineering in Japan, from Delin's own roadmap. Skill names stay concise and
 * technology-focused: no "basics", sub-topics or beginner descriptions.
 *
 * `usedIn` links a skill to where it already shows up: the file name of a
 * project in src/content/work or of an entry in src/content/journey. Only add
 * a link when that work really uses the skill; the build fails on unknown ids.
 *
 * `status` is optional and shown as a small label. Set it as you go:
 *   'comfortable' — you use it confidently
 *   'learning'    — you're actively working on it
 */
export type SkillStatus = 'comfortable' | 'learning';

export interface PathSkill {
  /** A concise, professional name: "SQL", not "SQL queries, joins, indexes". */
  name: string;
  usedIn?: string[];
  status?: SkillStatus;
}

export interface PathArea {
  title: string;
  ja?: string;
  /** The line beside each area in the roadmap. */
  note: string;
  /** A level ladder drawn above the skills, e.g. JLPT. `current` is optional. */
  ladder?: { label: string; steps: string[]; target: string; current?: string };
  skills: PathSkill[];
}

export const goal = {
  title: 'Software backend engineer in Japan',
  motto: { ja: '継続は力なり', en: 'Consistency builds strength.' },
  line: 'Skills today, a better tomorrow.',
};

export const path: PathArea[] = [
  {
    title: 'Java',
    note: 'Strong foundations for a long career',
    skills: [
      { name: 'Core Java' },
      { name: 'Collections Framework' },
      { name: 'Generics' },
      { name: 'Exception Handling' },
      { name: 'Streams & Lambdas' },
      { name: 'Multithreading & Concurrency' },
      { name: 'JVM' },
    ],
  },
  {
    title: 'Spring ecosystem',
    note: 'Build real-world backend applications',
    skills: [
      { name: 'Spring Boot' },
      { name: 'Spring MVC' },
      { name: 'Spring Data JPA' },
      { name: 'Spring Security' },
      { name: 'REST APIs', usedIn: ['rentmate'] },
      { name: 'Authentication & Authorization', usedIn: ['rentmate', 'greenup'] },
      { name: 'Unit & Integration Testing', usedIn: ['rentmate'] },
    ],
  },
  {
    title: 'Database',
    note: 'Good data powers great products',
    skills: [
      { name: 'PostgreSQL', usedIn: ['rentmate', 'greenup'] },
      { name: 'SQL', usedIn: ['greenup'] },
      { name: 'Database Design', usedIn: ['rentmate', 'greenup'] },
      { name: 'JPA & Hibernate' },
      { name: 'Transaction Management', usedIn: ['rentmate'] },
      { name: 'Query Optimization' },
      { name: 'Connection Pooling' },
    ],
  },
  {
    title: 'DSA & problem solving',
    note: 'Practice sharpens thinking',
    skills: [
      { name: 'DSA' },
      { name: 'Advanced DSA' },
      { name: 'LeetCode' },
      { name: 'Problem-Solving Patterns' },
    ],
  },
  {
    title: 'Development tools',
    note: 'Use, automate, deploy faster',
    skills: [
      { name: 'Git & GitHub', usedIn: ['rentmate', 'greenup'] },
      { name: 'Docker & Docker Compose', usedIn: ['rentmate'] },
      { name: 'Linux' },
      { name: 'CI/CD', usedIn: ['rentmate'] },
      { name: 'IntelliJ IDEA' },
    ],
  },
  {
    title: 'Cloud (AWS)',
    note: 'Deploy, scale, learn, grow',
    skills: [
      { name: 'AWS Core Services' },
      { name: 'Deployment & Monitoring' },
      { name: 'Scalable Architecture' },
      { name: 'Cost Management' },
    ],
  },
  {
    title: 'System design',
    note: 'Think, design, solve at scale',
    skills: [
      { name: 'System Design' },
      { name: 'API Design', usedIn: ['rentmate'] },
      { name: 'Scalability' },
      { name: 'Microservices' },
      { name: 'Distributed Systems' },
      { name: 'Software Architecture', usedIn: ['rentmate'] },
    ],
  },
  {
    title: 'Projects',
    note: 'Build, apply, showcase',
    skills: [
      { name: 'Backend Projects', usedIn: ['rentmate'] },
      { name: 'Real-World Features', usedIn: ['rentmate', 'greenup'] },
      { name: 'Layered Architecture', usedIn: ['rentmate'] },
      { name: 'Cloud Deployment' },
      { name: 'Technical Documentation', usedIn: ['rentmate', 'greenup'] },
    ],
  },
  {
    title: 'AI & data',
    note: 'Explore, stay curious',
    skills: [
      { name: 'Python', usedIn: ['2025-11-15-data-science-notebook'] },
      { name: 'Machine Learning' },
      { name: 'AI API Integration' },
    ],
  },
  {
    title: 'Soft skills',
    note: 'People skills take you further',
    skills: [
      { name: 'Technical Presentation' },
      { name: 'Communication' },
      { name: 'Problem Solving & Critical Thinking' },
      { name: 'Time Management' },
      { name: 'Teamwork & Collaboration' },
      { name: 'Résumé & Interviews' },
    ],
  },
  {
    title: 'Japanese',
    ja: '日本語',
    note: 'Language opens new opportunities',
    ladder: { label: 'JLPT', steps: ['N5', 'N4', 'N3'], target: 'N3', current: '' },
    skills: [
      { name: 'Vocabulary' },
      { name: 'Grammar' },
      { name: 'Reading' },
      { name: 'Listening' },
      { name: 'Speaking' },
      { name: 'Business Japanese' },
    ],
  },
];
