/**
 * Build-time GitHub data: public repositories and weekly commit activity.
 * Fetched once per build and shared by every page. Never fabricated: if GitHub
 * can't be reached, callers get { status: 'unavailable' } and show a fallback.
 * The optional token stays on the server and only raises the rate limit.
 */
import { GITHUB_OFFLINE, GITHUB_TOKEN } from 'astro:env/server';
import { profile } from '../data/profile';

export interface Repo {
  name: string;
  url: string;
  description: string;
  language: string | null;
  homepage: string | null;
  stars: number;
  pushedAt: string;
  createdAt: string;
}

export interface Week {
  /** ISO date of the week's Sunday (GitHub's week boundary). */
  start: string;
  commits: number;
}

export type GitHubData =
  | {
      status: 'ok';
      user: string;
      profileUrl: string;
      memberSince: string;
      repos: Repo[];
      /** Last 52 weeks, oldest first. Null when GitHub was still computing stats. */
      weeks: Week[] | null;
      fetchedAt: string;
    }
  | { status: 'unavailable'; user: string; profileUrl: string; reason: string };

const API = 'https://api.github.com';

const headers = (): HeadersInit => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'hamon-portfolio-build',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
});

async function get<T>(path: string): Promise<{ status: number; data: T | null }> {
  const res = await fetch(`${API}${path}`, { headers: headers(), signal: AbortSignal.timeout(10_000) });
  if (res.status === 202 || res.status === 204) return { status: res.status, data: null };
  if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${path}`);
  return { status: res.status, data: (await res.json()) as T };
}

/** The stats endpoint answers 202 while GitHub computes; ask again a few times. */
async function commitActivity(user: string, repo: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { status, data } = await get<{ week: number; total: number }[]>(`/repos/${user}/${repo}/stats/commit_activity`);
    if (status === 204) return [];
    if (data) return data;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return null;
}

async function load(): Promise<GitHubData> {
  const user = profile.links.github;
  const profileUrl = user ? `https://github.com/${user}` : '';
  if (!user) return { status: 'unavailable', user, profileUrl, reason: 'No GitHub username is set in profile.ts.' };
  if (GITHUB_OFFLINE) return { status: 'unavailable', user, profileUrl, reason: 'GitHub requests were switched off for this build.' };

  try {
    type RawUser = { created_at: string };
    type RawRepo = {
      name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      homepage: string | null;
      stargazers_count: number;
      pushed_at: string;
      created_at: string;
      fork: boolean;
      archived: boolean;
      size: number;
    };
    const [{ data: account }, { data: raw }] = await Promise.all([
      get<RawUser>(`/users/${user}`),
      get<RawRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed&type=owner`),
    ]);
    if (!account || !raw) throw new Error('GitHub returned an empty response.');

    const repos: Repo[] = raw
      .filter((r) => !r.fork && !r.archived && r.size > 0 && !profile.hiddenRepos.includes(r.name))
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description ?? '',
        language: r.language,
        homepage: r.homepage || null,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        createdAt: r.created_at,
      }));

    // Sum weekly commits across repositories. If any repo's stats aren't ready, show none rather than a partial count.
    const perRepo = await Promise.all(repos.map((r) => commitActivity(user, r.name)));
    let weeks: Week[] | null = null;
    if (perRepo.every((w) => w !== null)) {
      const totals = new Map<number, number>();
      for (const series of perRepo) for (const w of series ?? []) totals.set(w.week, (totals.get(w.week) ?? 0) + w.total);
      // The 52 weeks ending with the most recent one GitHub reported (or this week, if none).
      const sunday = new Date();
      sunday.setUTCHours(0, 0, 0, 0);
      sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
      const lastWeek = totals.size ? Math.max(...totals.keys()) : sunday.getTime() / 1000;
      weeks = Array.from({ length: 52 }, (_, i) => {
        const ts = lastWeek - (51 - i) * 604800;
        return { start: new Date(ts * 1000).toISOString().slice(0, 10), commits: totals.get(ts) ?? 0 };
      });
    }

    return {
      status: 'ok',
      user,
      profileUrl,
      memberSince: account.created_at,
      repos,
      weeks,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[github] Falling back: ${reason}`);
    return { status: 'unavailable', user, profileUrl, reason };
  }
}

let cached: Promise<GitHubData> | undefined;

/** Shared across all pages of a build, so GitHub is asked once. */
export const getGitHub = () => (cached ??= load());
