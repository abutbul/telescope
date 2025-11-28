import { Octokit } from '@octokit/rest';
import { GitHubAuth } from './auth';
import type {
  GitHubUser,
  Repository,
  StarredRepo,
  CommitActivity,
  LanguageStats,
  AccountStats,
  RateLimitStatus,
} from './types';
import { differenceInDays } from 'date-fns';

export class GitHubAPI {
  private _octokit: Octokit;

  constructor(token?: string) {
    this._octokit = GitHubAuth.createOctokit(token);
  }

  // Expose octokit for advanced operations
  get octokit(): Octokit {
    return this._octokit;
  }

  // User operations
  async getAuthenticatedUser(): Promise<GitHubUser> {
    const { data } = await this._octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  }

  async getUser(username: string): Promise<GitHubUser> {
    const { data } = await this._octokit.rest.users.getByUsername({ username });
    return data as GitHubUser;
  }

  // Repository operations
  async getUserRepos(username?: string): Promise<Repository[]> {
    const repos: Repository[] = [];
    let page = 1;
    const perPage = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = username
        ? await this._octokit.rest.repos.listForUser({
            username,
            per_page: perPage,
            page,
          })
        : await this._octokit.rest.repos.listForAuthenticatedUser({
            per_page: perPage,
            page,
          });

      repos.push(...(data as Repository[]));

      if (data.length < perPage) break;
      page++;
    }

    return repos;
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const { data } = await this._octokit.rest.repos.get({ owner, repo });
    return data as Repository;
  }

  // Star operations
  async getStarredRepos(username?: string): Promise<StarredRepo[]> {
    const stars: StarredRepo[] = [];
    let page = 1;
    const perPage = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = username
        ? await this._octokit.rest.activity.listReposStarredByUser({
            username,
            per_page: perPage,
            page,
            headers: {
              accept: 'application/vnd.github.v3.star+json',
            },
          })
        : await this._octokit.rest.activity.listReposStarredByAuthenticatedUser({
            per_page: perPage,
            page,
            headers: {
              accept: 'application/vnd.github.v3.star+json',
            },
          });

      stars.push(...(data as unknown as StarredRepo[]));

      if (data.length < perPage) break;
      page++;
    }

    return stars;
  }

  async starRepository(owner: string, repo: string): Promise<void> {
    await this._octokit.rest.activity.starRepoForAuthenticatedUser({ owner, repo });
  }

  async unstarRepository(owner: string, repo: string): Promise<void> {
    await this._octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo });
  }

  async isRepositoryStarred(owner: string, repo: string): Promise<boolean> {
    try {
      await this._octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({ owner, repo });
      return true;
    } catch {
      return false;
    }
  }

  // Network operations
  async getFollowers(username?: string): Promise<GitHubUser[]> {
    const followers: GitHubUser[] = [];
    let page = 1;
    const perPage = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = username
        ? await this._octokit.rest.users.listFollowersForUser({
            username,
            per_page: perPage,
            page,
          })
        : await this._octokit.rest.users.listFollowersForAuthenticatedUser({
            per_page: perPage,
            page,
          });

      followers.push(...(data as unknown as GitHubUser[]));

      if (data.length < perPage) break;
      page++;
    }

    return followers;
  }

  async getFollowing(username?: string): Promise<GitHubUser[]> {
    const following: GitHubUser[] = [];
    let page = 1;
    const perPage = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = username
        ? await this._octokit.rest.users.listFollowingForUser({
            username,
            per_page: perPage,
            page,
          })
        : await this._octokit.rest.users.listFollowedByAuthenticatedUser({
            per_page: perPage,
            page,
          });

      following.push(...(data as unknown as GitHubUser[]));

      if (data.length < perPage) break;
      page++;
    }

    return following;
  }

  async followUser(username: string): Promise<void> {
    await this._octokit.rest.users.follow({ username });
  }

  async unfollowUser(username: string): Promise<void> {
    await this._octokit.rest.users.unfollow({ username });
  }

  async isFollowingUser(username: string): Promise<boolean> {
    try {
      await this._octokit.rest.users.checkPersonIsFollowedByAuthenticated({ username });
      return true;
    } catch {
      return false;
    }
  }

  // Analytics operations
  async getAccountStats(username?: string): Promise<AccountStats> {
    const user = username ? await this.getUser(username) : await this.getAuthenticatedUser();
    const repos = await this.getUserRepos(username);

    const accountAge = differenceInDays(new Date(), new Date(user.created_at));

    // Calculate language statistics
    const languageStats: LanguageStats = {};
    for (const repo of repos) {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    }

    // Find primary language
    const primaryLanguage = Object.entries(languageStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    // Calculate total stars
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    // Repository creation by month
    const reposCreatedByMonth: Record<string, number> = {};
    repos.forEach((repo) => {
      const month = new Date(repo.created_at).toISOString().slice(0, 7);
      reposCreatedByMonth[month] = (reposCreatedByMonth[month] || 0) + 1;
    });

    return {
      totalCommits: 0, // Would need to iterate through commits
      totalStars,
      totalRepos: repos.length,
      accountAge,
      primaryLanguage,
      languageStats,
      commitsByDay: [],
      reposCreatedByMonth,
    };
  }

  async getCommitActivity(owner: string, repo: string): Promise<CommitActivity[]> {
    const { data } = await this._octokit.rest.repos.getCommitActivityStats({ owner, repo });
    return (data as CommitActivity[]) || [];
  }

  // Rate limit
  async getRateLimit(): Promise<RateLimitStatus> {
    const { data } = await this._octokit.rest.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
      used: data.rate.used,
    };
  }

  // Fork operations
  async forkRepository(owner: string, repo: string): Promise<Repository> {
    const { data } = await this._octokit.rest.repos.createFork({ owner, repo });
    return data as Repository;
  }

  async syncFork(owner: string, repo: string, branch: string = 'main'): Promise<void> {
    await this._octokit.rest.repos.mergeUpstream({
      owner,
      repo,
      branch,
    });
  }
}
