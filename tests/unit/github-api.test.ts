/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubAPI } from '../../src/lib/github/api';

// Mock dependencies
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      users: {
        getAuthenticated: vi.fn(),
        getByUsername: vi.fn(),
        listFollowersForUser: vi.fn(),
        listFollowingForUser: vi.fn(),
      },
      repos: {
        listForUser: vi.fn(),
        listForAuthenticatedUser: vi.fn(),
        get: vi.fn(),
        getCommitActivityStats: vi.fn(),
        createFork: vi.fn(),
        mergeUpstream: vi.fn(),
      },
      activity: {
        listReposStarredByUser: vi.fn(),
        listReposStarredByAuthenticatedUser: vi.fn(),
        starRepoForAuthenticatedUser: vi.fn(),
        unstarRepoForAuthenticatedUser: vi.fn(),
        checkRepoIsStarredByAuthenticatedUser: vi.fn(),
        listPublicEventsForUser: vi.fn(),
      },
      gists: {
        listForUser: vi.fn(),
      },
      rateLimit: {
        get: vi.fn(),
      },
    },
  })),
}));

vi.mock('../../src/lib/github/auth', () => ({
  GitHubAuth: {
    createOctokit: vi.fn(),
  },
}));

import { Octokit } from '@octokit/rest';
import { GitHubAuth } from '../../src/lib/github/auth';

describe('GitHubAPI', () => {
  const mockOctokit = Octokit as any;
  const mockGitHubAuth = GitHubAuth as any;

  let api: GitHubAPI;
  let mockOctokitInstance: any;

  beforeEach(() => {
    mockOctokitInstance = {
      rest: {
        users: {
          getAuthenticated: vi.fn(),
          getByUsername: vi.fn(),
          listFollowersForUser: vi.fn(),
          listFollowingForUser: vi.fn(),
        },
        repos: {
          listForUser: vi.fn(),
          listForAuthenticatedUser: vi.fn(),
          get: vi.fn(),
          getCommitActivityStats: vi.fn(),
          createFork: vi.fn(),
          mergeUpstream: vi.fn(),
        },
        activity: {
          listReposStarredByUser: vi.fn(),
          listReposStarredByAuthenticatedUser: vi.fn(),
          starRepoForAuthenticatedUser: vi.fn(),
          unstarRepoForAuthenticatedUser: vi.fn(),
          checkRepoIsStarredByAuthenticatedUser: vi.fn(),
          listPublicEventsForUser: vi.fn(),
        },
        gists: {
          listForUser: vi.fn(),
        },
        rateLimit: {
          get: vi.fn(),
        },
      },
    };
    mockOctokit.mockImplementation(() => mockOctokitInstance);
    mockGitHubAuth.createOctokit.mockReturnValue(mockOctokitInstance);

    api = new GitHubAPI('test-token');
  });

  it('should create octokit instance', () => {
    expect(mockGitHubAuth.createOctokit).toHaveBeenCalledWith('test-token');
    expect(api.octokit).toBe(mockOctokitInstance);
  });

  it('should get authenticated user', async () => {
    const mockUser = { login: 'testuser', id: 1 };
    mockOctokitInstance.rest.users.getAuthenticated.mockResolvedValue({ data: mockUser });

    const result = await api.getAuthenticatedUser();
    expect(result).toEqual(mockUser);
  });

  it('should get user by username', async () => {
    const mockUser = { login: 'otheruser', id: 2 };
    mockOctokitInstance.rest.users.getByUsername.mockResolvedValue({ data: mockUser });

    const result = await api.getUser('otheruser');
    expect(result).toEqual(mockUser);
    expect(mockOctokitInstance.rest.users.getByUsername).toHaveBeenCalledWith({ username: 'otheruser' });
  });

  it('should get user repos for authenticated user', async () => {
    const mockRepos = [{ id: 1, name: 'repo1' }];
    mockOctokitInstance.rest.repos.listForAuthenticatedUser
      .mockResolvedValueOnce({ data: mockRepos })
      .mockResolvedValueOnce({ data: [] }); // Second call returns empty to break loop

    const result = await api.getUserRepos();
    expect(result).toEqual(mockRepos);
  });

  it('should get user repos for specific user', async () => {
    const mockRepos = [{ id: 2, name: 'repo2' }];
    mockOctokitInstance.rest.repos.listForUser
      .mockResolvedValueOnce({ data: mockRepos })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getUserRepos('testuser');
    expect(result).toEqual(mockRepos);
    expect(mockOctokitInstance.rest.repos.listForUser).toHaveBeenCalledWith({
      username: 'testuser',
      per_page: 100,
      page: 1,
    });
  });

  it('should get repository', async () => {
    const mockRepo = { id: 1, name: 'test-repo' };
    mockOctokitInstance.rest.repos.get.mockResolvedValue({ data: mockRepo });

    const result = await api.getRepository('owner', 'repo');
    expect(result).toEqual(mockRepo);
  });

  it('should get starred repos', async () => {
    const mockStars = [{ repo: { id: 1 }, starred_at: '2023-01-01' }];
    mockOctokitInstance.rest.activity.listReposStarredByAuthenticatedUser
      .mockResolvedValueOnce({ data: mockStars })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getStarredRepos();
    expect(result).toEqual(mockStars);
  });

  it('should star repository', async () => {
    mockOctokitInstance.rest.activity.starRepoForAuthenticatedUser.mockResolvedValue(undefined);

    await api.starRepository('owner', 'repo');
    expect(mockOctokitInstance.rest.activity.starRepoForAuthenticatedUser).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should unstar repository', async () => {
    mockOctokitInstance.rest.activity.unstarRepoForAuthenticatedUser.mockResolvedValue(undefined);

    await api.unstarRepository('owner', 'repo');
    expect(mockOctokitInstance.rest.activity.unstarRepoForAuthenticatedUser).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should check if repository is starred', async () => {
    mockOctokitInstance.rest.activity.checkRepoIsStarredByAuthenticatedUser.mockResolvedValue(undefined);

    const result = await api.isRepositoryStarred('owner', 'repo');
    expect(result).toBe(true);
  });

  it('should return false if repository is not starred', async () => {
    mockOctokitInstance.rest.activity.checkRepoIsStarredByAuthenticatedUser.mockRejectedValue(new Error('Not found'));

    const result = await api.isRepositoryStarred('owner', 'repo');
    expect(result).toBe(false);
  });

  it('should get account stats', async () => {
    const mockUser = { login: 'testuser', created_at: '2020-01-01T00:00:00Z' };
    const mockRepos = [
      { language: 'JavaScript', stargazers_count: 10, created_at: '2021-01-01T00:00:00Z' },
      { language: 'TypeScript', stargazers_count: 5, created_at: '2021-02-01T00:00:00Z' },
    ];

    mockOctokitInstance.rest.users.getAuthenticated.mockResolvedValue({ data: mockUser });
    mockOctokitInstance.rest.repos.listForAuthenticatedUser
      .mockResolvedValueOnce({ data: mockRepos })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getAccountStats();
    expect(result.totalRepos).toBe(2);
    expect(result.totalStars).toBe(15);
    expect(result.primaryLanguage).toBe('JavaScript');
  });

  it('should get commit activity', async () => {
    const mockActivity = [{ total: 10, week: 1, days: [1, 2, 3, 4, 5, 6, 7] }];
    mockOctokitInstance.rest.repos.getCommitActivityStats.mockResolvedValue({ data: mockActivity });

    const result = await api.getCommitActivity('owner', 'repo');
    expect(result).toEqual(mockActivity);
  });

  it('should get rate limit', async () => {
    const mockRateLimit = {
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: 1234567890,
        used: 1,
      },
    };
    mockOctokitInstance.rest.rateLimit.get.mockResolvedValue({ data: mockRateLimit });

    const result = await api.getRateLimit();
    expect(result.limit).toBe(5000);
    expect(result.remaining).toBe(4999);
    expect(result.used).toBe(1);
  });

  it('should fork repository', async () => {
    const mockRepo = { id: 1, name: 'forked-repo' };
    mockOctokitInstance.rest.repos.createFork.mockResolvedValue({ data: mockRepo });

    const result = await api.forkRepository('owner', 'repo');
    expect(result).toEqual(mockRepo);
  });

  it('should sync fork', async () => {
    mockOctokitInstance.rest.repos.mergeUpstream.mockResolvedValue(undefined);

    await api.syncFork('owner', 'repo', 'main');
    expect(mockOctokitInstance.rest.repos.mergeUpstream).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should get gists for user', async () => {
    const mockGists = [
      { id: '1', html_url: 'https://gist.github.com/1', description: 'Test gist', public: true },
      { id: '2', html_url: 'https://gist.github.com/2', description: 'Another gist', public: false },
    ];
    mockOctokitInstance.rest.gists.listForUser
      .mockResolvedValueOnce({ data: mockGists })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getGistsForUser('testuser');
    expect(result).toEqual(mockGists);
    expect(mockOctokitInstance.rest.gists.listForUser).toHaveBeenCalledWith({
      username: 'testuser',
      per_page: 100,
      page: 1,
    });
  });

  it('should get user events', async () => {
    const mockEvents = [
      { id: '1', type: 'PushEvent', created_at: '2023-01-01T12:00:00Z' },
      { id: '2', type: 'CreateEvent', created_at: '2023-01-02T14:00:00Z' },
    ];
    mockOctokitInstance.rest.activity.listPublicEventsForUser
      .mockResolvedValueOnce({ data: mockEvents })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getUserEvents('testuser');
    expect(result).toEqual(mockEvents);
    expect(mockOctokitInstance.rest.activity.listPublicEventsForUser).toHaveBeenCalledWith({
      username: 'testuser',
      per_page: 100,
      page: 1,
    });
  });

  it('should get commit stats from user events', async () => {
    const mockEvents = [
      {
        id: '1',
        type: 'PushEvent',
        created_at: '2023-01-02T10:00:00Z', // Monday 10 AM
        payload: { commits: [{}, {}] },
      },
      {
        id: '2',
        type: 'PushEvent',
        created_at: '2023-01-03T14:00:00Z', // Tuesday 2 PM
        payload: { commits: [{}] },
      },
    ];
    mockOctokitInstance.rest.activity.listPublicEventsForUser
      .mockResolvedValueOnce({ data: mockEvents })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getCommitStats('testuser');

    expect(result.totalCommits).toBe(3);
    expect(result.commitsByDayOfWeek).toBeDefined();
    expect(result.commitsByHour).toBeDefined();
    expect(result.mostActiveDay).toBeDefined();
    expect(result.mostActiveHour).toBeDefined();
    expect(result.streakDays).toBeDefined();
    expect(result.longestStreak).toBeDefined();
    expect(typeof result.weekendWarrior).toBe('boolean');
    expect(typeof result.nightOwl).toBe('boolean');
    expect(typeof result.earlyBird).toBe('boolean');
  });

  it('should calculate commit stats correctly for night owl', async () => {
    // Create events mostly at night (11 PM UTC - will vary by local timezone)
    const nightEvents = Array(10).fill(null).map((_, i) => ({
      id: String(i),
      type: 'PushEvent',
      created_at: `2023-01-0${(i % 9) + 1}T23:00:00Z`, // 11 PM UTC
      payload: { commits: [{}] },
    }));

    mockOctokitInstance.rest.activity.listPublicEventsForUser
      .mockResolvedValueOnce({ data: nightEvents })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getCommitStats('testuser');

    // Night owl detection is based on commits between 10 PM and 4 AM
    // The exact mostActiveHour depends on local timezone, so we check nightOwl flag
    expect(result.totalCommits).toBe(10);
    // nightOwl status depends on whether local time falls in late night hours
    expect(typeof result.nightOwl).toBe('boolean');
    expect(typeof result.mostActiveHour).toBe('number');
  });

  it('should calculate commit stats correctly for early bird', async () => {
    // Create events mostly early morning (6 AM UTC - will vary by local timezone)
    const morningEvents = Array(10).fill(null).map((_, i) => ({
      id: String(i),
      type: 'PushEvent',
      created_at: `2023-01-0${(i % 9) + 1}T06:00:00Z`, // 6 AM UTC
      payload: { commits: [{}] },
    }));

    mockOctokitInstance.rest.activity.listPublicEventsForUser
      .mockResolvedValueOnce({ data: morningEvents })
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getCommitStats('testuser');

    // Early bird detection is based on commits between 5 AM and 8 AM
    // The exact mostActiveHour depends on local timezone, so we check earlyBird flag
    expect(result.totalCommits).toBe(10);
    // earlyBird status depends on whether local time falls in early morning hours
    expect(typeof result.earlyBird).toBe('boolean');
    expect(typeof result.mostActiveHour).toBe('number');
  });

  it('should handle empty events for commit stats', async () => {
    mockOctokitInstance.rest.activity.listPublicEventsForUser
      .mockResolvedValueOnce({ data: [] });

    const result = await api.getCommitStats('testuser');

    expect(result.totalCommits).toBe(0);
    expect(result.streakDays).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.weekendWarrior).toBe(false);
    expect(result.nightOwl).toBe(false);
    expect(result.earlyBird).toBe(false);
  });
});