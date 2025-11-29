import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserStore } from '../../src/stores/user-store';

// Mock the dependencies
vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn().mockImplementation(() => ({
    getAuthenticatedUser: vi.fn(),
    getUserRepos: vi.fn(),
    getAccountStats: vi.fn(),
  })),
}));

vi.mock('../../src/lib/cache/cache-manager', () => ({
  CacheManager: {
    getOrFetch: vi.fn(),
  },
}));

import { GitHubAPI } from '../../src/lib/github/api';
import { CacheManager } from '../../src/lib/cache/cache-manager';

describe('useUserStore', () => {
  const mockGitHubAPI = GitHubAPI as Mock;
  const mockCacheManagerGetOrFetch = CacheManager.getOrFetch as Mock;

  beforeEach(() => {
    useUserStore.setState({
      user: null,
      repos: [],
      stats: null,
      dashboardData: null,
      isLoading: false,
      isLoadingDashboard: false,
      error: null,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.user).toBeNull();
    expect(result.current.repos).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch user successfully', async () => {
    const mockUser = { login: 'testuser', id: 1, name: 'Test User' };
    const mockApiInstance = {
      getAuthenticatedUser: vi.fn().mockResolvedValue(mockUser),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchUser('test-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockCacheManagerGetOrFetch).toHaveBeenCalledWith(
      'user',
      'authenticated',
      expect.any(Function),
      { forceRefresh: false }
    );
  });

  it('should handle fetch user error', async () => {
    const errorMessage = 'API Error';
    mockCacheManagerGetOrFetch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchUser('test-token');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should fetch repos successfully', async () => {
    const mockUser = { login: 'testuser' };
    const mockRepos = [{ id: 1, name: 'repo1' }];
    const mockApiInstance = {
      getUserRepos: vi.fn().mockResolvedValue(mockRepos),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockResolvedValue(mockRepos);

    const { result } = renderHook(() => useUserStore());

    // Set user first (use type assertion for partial mock data)
    act(() => {
      useUserStore.setState({ user: mockUser as never });
    });

    await act(async () => {
      await result.current.fetchRepos('test-token');
    });

    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch repos without user', async () => {
    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchRepos('test-token');
    });

    expect(result.current.error).toBe('User not loaded');
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch stats successfully', async () => {
    const mockUser = { login: 'testuser' };
    const mockStats = { totalStars: 10, totalRepos: 5 };
    const mockApiInstance = {
      getAccountStats: vi.fn().mockResolvedValue(mockStats),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useUserStore());

    // Set user first (use type assertion for partial mock data)
    act(() => {
      useUserStore.setState({ user: mockUser as never });
    });

    await act(async () => {
      await result.current.fetchStats('test-token');
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should clear user data', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      useUserStore.setState({
        user: { login: 'test' } as never,
        repos: [{ id: 1 }] as never,
        stats: { totalStars: 1 } as never,
        dashboardData: { followbackRate: 50, mutualFollows: 10 } as never,
        error: 'error',
      });
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.repos).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.dashboardData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should initialize with dashboardData as null', () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.dashboardData).toBeNull();
    expect(result.current.isLoadingDashboard).toBe(false);
  });

  it('should fetch dashboard data successfully', async () => {
    const mockUser = { login: 'testuser' };
    const mockFollowers = [{ login: 'follower1' }, { login: 'follower2' }];
    const mockFollowing = [{ login: 'follower1' }, { login: 'following1' }];
    const mockStarredRepos = [{ repo: { id: 1, full_name: 'owner/repo', updated_at: '2023-01-01' }, starred_at: '2023-01-01' }];
    const mockCommitStats = {
      totalCommits: 100,
      commitsByDayOfWeek: { Monday: 20, Tuesday: 15 },
      commitsByHour: { 9: 10, 10: 15 },
      mostActiveDay: 'Monday',
      mostActiveHour: 10,
      streakDays: 5,
      longestStreak: 10,
      commitDates: ['2023-01-01'],
      averageCommitsPerDay: 2.5,
      weekendWarrior: false,
      nightOwl: false,
      earlyBird: true,
    };

    const mockApiInstance = {
      getFollowers: vi.fn().mockResolvedValue(mockFollowers),
      getFollowing: vi.fn().mockResolvedValue(mockFollowing),
      getStarredRepos: vi.fn().mockResolvedValue(mockStarredRepos),
      getGistsForUser: vi.fn().mockResolvedValue([]),
      getCommitStats: vi.fn().mockResolvedValue(mockCommitStats),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockImplementation((key, identifier, fetchFn) => fetchFn());

    const { result } = renderHook(() => useUserStore());

    // Set user first (use type assertion for partial mock data)
    act(() => {
      useUserStore.setState({ user: mockUser as never });
    });

    await act(async () => {
      await result.current.fetchDashboardData('test-token');
    });

    expect(result.current.dashboardData).not.toBeNull();
    expect(result.current.dashboardData?.mutualFollows).toBe(1); // follower1 is mutual
    expect(result.current.dashboardData?.followbackRate).toBe(50); // 1 mutual out of 2 following
    expect(result.current.isLoadingDashboard).toBe(false);
  });

  it('should handle fetchDashboardData error gracefully', async () => {
    const mockUser = { login: 'testuser' };
    mockCacheManagerGetOrFetch.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useUserStore());

    act(() => {
      useUserStore.setState({ user: mockUser as never });
    });

    await act(async () => {
      await result.current.fetchDashboardData('test-token');
    });

    // Should handle error gracefully without crashing
    expect(result.current.isLoadingDashboard).toBe(false);
  });

  it('should not fetch dashboard data without user', async () => {
    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchDashboardData('test-token');
    });

    // Should not set dashboardData if no user
    expect(result.current.dashboardData).toBeNull();
  });
});