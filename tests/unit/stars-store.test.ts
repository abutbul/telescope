import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStarsStore } from '../../src/stores/stars-store';

// Mock the dependencies
vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn().mockImplementation(() => ({
    getStarredRepos: vi.fn(),
    starRepository: vi.fn(),
    unstarRepository: vi.fn(),
  })),
}));

vi.mock('../../src/lib/cache/cache-manager', () => ({
  CacheManager: {
    getOrFetch: vi.fn(),
    invalidate: vi.fn(),
  },
}));

import { GitHubAPI } from '../../src/lib/github/api';
import { CacheManager } from '../../src/lib/cache/cache-manager';

describe('useStarsStore', () => {
  const mockGitHubAPI = GitHubAPI as Mock;
  const mockCacheManagerGetOrFetch = CacheManager.getOrFetch as Mock;
  const mockCacheManagerInvalidate = CacheManager.invalidate as Mock;

  beforeEach(() => {
    useStarsStore.setState({
      myStars: [],
      targetUserStars: [],
      targetUsername: null,
      isLoading: false,
      error: null,
      copyProgress: {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: false,
      },
    });

    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useStarsStore());

    expect(result.current.myStars).toEqual([]);
    expect(result.current.targetUserStars).toEqual([]);
    expect(result.current.targetUsername).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.copyProgress).toEqual({
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false,
    });
  });

  it('should fetch my stars successfully', async () => {
    const mockStars = [{ repo: { id: 1, name: 'repo1' }, starred_at: '2023-01-01' }];
    const mockApiInstance = {
      getStarredRepos: vi.fn().mockResolvedValue(mockStars),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockResolvedValue(mockStars);

    const { result } = renderHook(() => useStarsStore());

    await act(async () => {
      await result.current.fetchMyStars('test-token');
    });

    expect(result.current.myStars).toEqual(mockStars);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch my stars error', async () => {
    const errorMessage = 'API Error';
    mockCacheManagerGetOrFetch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useStarsStore());

    await act(async () => {
      await result.current.fetchMyStars('test-token');
    });

    expect(result.current.myStars).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should fetch user stars successfully', async () => {
    const mockStars = [{ repo: { id: 2, name: 'repo2' }, starred_at: '2023-01-02' }];
    const mockApiInstance = {
      getStarredRepos: vi.fn().mockResolvedValue(mockStars),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    mockCacheManagerGetOrFetch.mockResolvedValue(mockStars);

    const { result } = renderHook(() => useStarsStore());

    await act(async () => {
      await result.current.fetchUserStars('test-token', 'otheruser');
    });

    expect(result.current.targetUserStars).toEqual(mockStars);
    expect(result.current.targetUsername).toBe('otheruser');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should star repository', async () => {
    const mockApiInstance = {
      starRepository: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    const { result } = renderHook(() => useStarsStore());

    await act(async () => {
      await result.current.starRepository('test-token', 'owner', 'repo');
    });

    expect(mockApiInstance.starRepository).toHaveBeenCalledWith('owner', 'repo');
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('stars', 'authenticated');
  });

  it('should unstar repository', async () => {
    const mockApiInstance = {
      unstarRepository: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    const { result } = renderHook(() => useStarsStore());

    await act(async () => {
      await result.current.unstarRepository('test-token', 'owner', 'repo');
    });

    expect(mockApiInstance.unstarRepository).toHaveBeenCalledWith('owner', 'repo');
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('stars', 'authenticated');
  });

  it('should copy stars from user', async () => {
    const reposToCopy = [
      { id: 1, full_name: 'owner1/repo1' },
      { id: 2, full_name: 'owner2/repo2' },
    ];
    const mockApiInstance = {
      starRepository: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    // Mock setTimeout to resolve immediately
    vi.useFakeTimers();
    const { result } = renderHook(() => useStarsStore());

    const copyPromise = act(async () => {
      await result.current.copyStarsFromUser('test-token', reposToCopy);
    });

    // Fast-forward timers
    await vi.runAllTimersAsync();
    await copyPromise;

    expect(mockApiInstance.starRepository).toHaveBeenCalledTimes(2);
    expect(mockApiInstance.starRepository).toHaveBeenCalledWith('owner1', 'repo1');
    expect(mockApiInstance.starRepository).toHaveBeenCalledWith('owner2', 'repo2');
    expect(result.current.copyProgress).toEqual({
      total: 2,
      completed: 2,
      failed: 0,
      inProgress: false,
    });
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('stars', 'authenticated');

    vi.useRealTimers();
  });

  it('should handle copy stars errors', async () => {
    const reposToCopy = [
      { id: 1, full_name: 'owner1/repo1' },
      { id: 2, full_name: 'owner2/repo2' },
    ];
    const mockApiInstance = {
      starRepository: vi.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    vi.useFakeTimers();
    const { result } = renderHook(() => useStarsStore());

    const copyPromise = act(async () => {
      await result.current.copyStarsFromUser('test-token', reposToCopy);
    });

    await vi.runAllTimersAsync();
    await copyPromise;

    expect(result.current.copyProgress).toEqual({
      total: 2,
      completed: 1,
      failed: 1,
      inProgress: false,
    });

    vi.useRealTimers();
  });

  it('should clear target user', () => {
    const { result } = renderHook(() => useStarsStore());

    act(() => {
      useStarsStore.setState({
        targetUserStars: [{ repo: { id: 1 } }],
        targetUsername: 'user',
      });
    });

    act(() => {
      result.current.clearTargetUser();
    });

    expect(result.current.targetUserStars).toEqual([]);
    expect(result.current.targetUsername).toBeNull();
  });
});