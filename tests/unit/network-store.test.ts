import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStore } from '../../src/stores/network-store';
import { GitHubAPI } from '../../src/lib/github/api';
import { CacheManager } from '../../src/lib/cache/cache-manager';
import type { GitHubUser } from '../../src/lib/github/types';

// Mock the dependencies
vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn().mockImplementation(() => ({
    getFollowers: vi.fn(),
    getFollowing: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
  })),
}));

vi.mock('../../src/lib/cache/cache-manager', () => ({
  CacheManager: {
    getOrFetch: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('useNetworkStore', () => {
  const mockGitHubAPI = GitHubAPI as Mock;
  const mockCacheManagerGetOrFetch = CacheManager.getOrFetch as Mock;
  const mockCacheManagerInvalidate = CacheManager.invalidate as Mock;

  beforeEach(() => {
    useNetworkStore.setState({
      myFollowers: [],
      myFollowing: [],
      targetUserFollowers: [],
      targetUserFollowing: [],
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
    const { result } = renderHook(() => useNetworkStore());

    expect(result.current.myFollowers).toEqual([]);
    expect(result.current.myFollowing).toEqual([]);
    expect(result.current.targetUserFollowers).toEqual([]);
    expect(result.current.targetUserFollowing).toEqual([]);
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

  it('should fetch my network successfully', async () => {
    const mockFollowers = [{ id: 1, login: 'follower1' }] as GitHubUser[];
    const mockFollowing = [{ id: 2, login: 'following1' }] as GitHubUser[];
    const mockApiInstance = {
      getFollowers: vi.fn().mockResolvedValue(mockFollowers),
      getFollowing: vi.fn().mockResolvedValue(mockFollowing),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    
    mockCacheManagerGetOrFetch.mockImplementation((key) => {
      if (key === 'followers') return Promise.resolve(mockFollowers);
      if (key === 'following') return Promise.resolve(mockFollowing);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() => useNetworkStore());

    await act(async () => {
      await result.current.fetchMyNetwork('test-token');
    });

    expect(result.current.myFollowers).toEqual(mockFollowers);
    expect(result.current.myFollowing).toEqual(mockFollowing);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch my network error', async () => {
    const errorMessage = 'API Error';
    mockCacheManagerGetOrFetch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNetworkStore());

    await act(async () => {
      await result.current.fetchMyNetwork('test-token');
    });

    expect(result.current.myFollowers).toEqual([]);
    expect(result.current.myFollowing).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should fetch user network successfully', async () => {
    const mockFollowers = [{ id: 3, login: 'user-follower' }] as GitHubUser[];
    const mockFollowing = [{ id: 4, login: 'user-following' }] as GitHubUser[];
    const mockApiInstance = {
      getFollowers: vi.fn().mockResolvedValue(mockFollowers),
      getFollowing: vi.fn().mockResolvedValue(mockFollowing),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);
    
    mockCacheManagerGetOrFetch.mockImplementation((key) => {
      if (key === 'followers') return Promise.resolve(mockFollowers);
      if (key === 'following') return Promise.resolve(mockFollowing);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() => useNetworkStore());

    await act(async () => {
      await result.current.fetchUserNetwork('test-token', 'otheruser');
    });

    expect(result.current.targetUserFollowers).toEqual(mockFollowers);
    expect(result.current.targetUserFollowing).toEqual(mockFollowing);
    expect(result.current.targetUsername).toBe('otheruser');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should follow user', async () => {
    const mockApiInstance = {
      followUser: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    const { result } = renderHook(() => useNetworkStore());

    await act(async () => {
      await result.current.followUser('test-token', 'user-to-follow');
    });

    expect(mockApiInstance.followUser).toHaveBeenCalledWith('user-to-follow');
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('following', 'authenticated');
  });

  it('should unfollow user', async () => {
    const mockApiInstance = {
      unfollowUser: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    const { result } = renderHook(() => useNetworkStore());

    await act(async () => {
      await result.current.unfollowUser('test-token', 'user-to-unfollow');
    });

    expect(mockApiInstance.unfollowUser).toHaveBeenCalledWith('user-to-unfollow');
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('following', 'authenticated');
  });

  it('should copy following from user', async () => {
    const usersToFollow = [
      { id: 1, login: 'user1' },
      { id: 2, login: 'user2' },
    ] as GitHubUser[];
    const mockApiInstance = {
      followUser: vi.fn().mockResolvedValue(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    vi.useFakeTimers();
    const { result } = renderHook(() => useNetworkStore());

    const copyPromise = act(async () => {
      await result.current.copyFollowingFromUser('test-token', usersToFollow);
    });

    await vi.runAllTimersAsync();
    await copyPromise;

    expect(mockApiInstance.followUser).toHaveBeenCalledTimes(2);
    expect(mockApiInstance.followUser).toHaveBeenCalledWith('user1');
    expect(mockApiInstance.followUser).toHaveBeenCalledWith('user2');
    expect(result.current.copyProgress).toEqual({
      total: 2,
      completed: 2,
      failed: 0,
      inProgress: false,
    });
    expect(mockCacheManagerInvalidate).toHaveBeenCalledWith('following', 'authenticated');

    vi.useRealTimers();
  });

  it('should handle copy following errors', async () => {
    const usersToFollow = [
      { id: 1, login: 'user1' },
      { id: 2, login: 'user2' },
    ] as GitHubUser[];
    const mockApiInstance = {
      followUser: vi.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined),
    };
    mockGitHubAPI.mockImplementation(() => mockApiInstance);

    vi.useFakeTimers();
    const { result } = renderHook(() => useNetworkStore());

    const copyPromise = act(async () => {
      await result.current.copyFollowingFromUser('test-token', usersToFollow);
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
    const { result } = renderHook(() => useNetworkStore());

    act(() => {
      useNetworkStore.setState({
        targetUserFollowers: [{ id: 1, login: 'user' } as GitHubUser],
        targetUserFollowing: [{ id: 2, login: 'user2' } as GitHubUser],
        targetUsername: 'user',
      });
    });

    act(() => {
      result.current.clearTargetUser();
    });

    expect(result.current.targetUserFollowers).toEqual([]);
    expect(result.current.targetUserFollowing).toEqual([]);
    expect(result.current.targetUsername).toBeNull();
  });
});
