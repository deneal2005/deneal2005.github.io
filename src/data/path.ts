/**
 * Chapter 02 — The Path. The skills roadmap toward software backend
 * engineering in Japan, exactly as it appears in Delin's own roadmap.
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
  name: string;
  detail?: string;
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
    title: 'Java fundamentals',
    note: 'Strong foundations for a long career',
    skills: [
      { name: 'Core Java', detail: 'Syntax, OOP, classes, interfaces' },
      { name: 'Collections Framework' },
      { name: 'Generics' },
      { name: 'Exception handling' },
      { name: 'Streams & lambdas' },
      { name: 'Multithreading & concurrency' },
      { name: 'JVM basics', detail: 'Memory, GC' },
    ],
  },
  {
    title: 'Spring ecosystem',
    note: 'Build real-world backend applications',
    skills: [
      { name: 'Spring Boot' },
      { name: 'Spring MVC' },
      { name: 'Spring Data JPA', detail: 'With Hibernate' },
      { name: 'Spring Security' },
      { name: 'REST API development', usedIn: ['rentmate'] },
      { name: 'Authentication & authorization', detail: 'JWT, OAuth2', usedIn: ['rentmate', 'greenup'] },
      { name: 'Testing', detail: 'Unit & integration', usedIn: ['rentmate'] },
    ],
  },
  {
    title: 'Database',
    note: 'Good data powers great products',
    skills: [
      { name: 'PostgreSQL', usedIn: ['rentmate', 'greenup'] },
      { name: 'SQL', detail: 'Queries, joins, indexes', usedIn: ['greenup'] },
      { name: 'Database design', detail: 'Normalization, ERD', usedIn: ['rentmate', 'greenup'] },
      { name: 'JPA & Hibernate', detail: 'Advanced' },
      { name: 'Transaction management', usedIn: ['rentmate'] },
      { name: 'Query optimization' },
      { name: 'Connection pooling' },
    ],
  },
  {
    title: 'DSA & problem solving',
    note: 'Practice sharpens thinking',
    skills: [
      { name: 'Basic DSA', detail: 'Arrays, strings, linked lists' },
      { name: 'Advanced DSA' },
      { name: 'LeetCode & coding practice' },
      { name: 'Problem-solving patterns' },
    ],
  },
  {
    title: 'Development tools',
    note: 'Use, automate, deploy faster',
    skills: [
      { name: 'Git & GitHub', usedIn: ['rentmate', 'greenup'] },
      { name: 'Docker & Docker Compose', usedIn: ['rentmate'] },
      { name: 'Linux', detail: 'Command line basics' },
      { name: 'CI/CD', detail: 'GitHub Actions', usedIn: ['rentmate'] },
      { name: 'IntelliJ IDEA' },
    ],
  },
  {
    title: 'Cloud (AWS)',
    note: 'Deploy, scale, learn, grow',
    skills: [
      { name: 'Core AWS services', detail: 'EC2, S3, RDS, IAM, VPC' },
      { name: 'Deployment & monitoring' },
      { name: 'Scalable architecture basics' },
      { name: 'Cost management' },
    ],
  },
  {
    title: 'System design',
    note: 'Think, design, solve at scale',
    skills: [
      { name: 'System design basics' },
      { name: 'API design & best practices', usedIn: ['rentmate'] },
      { name: 'Scalability', detail: 'Load balancing, caching' },
      { name: 'Microservices', detail: 'Basics' },
      { name: 'Distributed systems concepts' },
      { name: 'Real-world architecture practice', usedIn: ['rentmate'] },
    ],
  },
  {
    title: 'Projects',
    note: 'Build, apply, showcase',
    skills: [
      { name: 'Two or three solid backend projects', usedIn: ['rentmate'] },
      { name: 'Real-world features', usedIn: ['rentmate', 'greenup'] },
      { name: 'Best practices', detail: 'Layered architecture', usedIn: ['rentmate'] },
      { name: 'Deploying to the cloud', detail: 'AWS' },
      { name: 'Clean documentation', detail: 'READMEs', usedIn: ['rentmate', 'greenup'] },
    ],
  },
  {
    title: 'AI & data',
    note: 'Explore, stay curious',
    skills: [
      { name: 'Python', detail: 'Basics', usedIn: ['2025-11-15-data-science-notebook'] },
      { name: 'ML fundamentals', detail: 'Basics' },
      { name: 'AI API integrations', detail: 'e.g. OpenAI' },
    ],
  },
  {
    title: 'Soft skills',
    note: 'People skills take you further',
    skills: [
      { name: 'Technical speaking & presentation' },
      { name: 'Communication', detail: 'English & Japanese' },
      { name: 'Problem solving & critical thinking' },
      { name: 'Time management & discipline' },
      { name: 'Teamwork & collaboration' },
      { name: 'Résumé writing & interviews' },
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
      { name: 'Conversational & workplace Japanese' },
    ],
  },
];
