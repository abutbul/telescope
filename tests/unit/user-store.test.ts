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
      isLoading: false,
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

    // Set user first
    act(() => {
      useUserStore.setState({ user: mockUser });
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

    // Set user first
    act(() => {
      useUserStore.setState({ user: mockUser });
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
        user: { login: 'test' },
        repos: [{ id: 1 }],
        stats: { totalStars: 1 },
        error: 'error',
      });
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.repos).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });
});