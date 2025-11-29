import { describe, it, expect, vi } from 'vitest';
import { CacheManager } from '../../src/lib/cache/cache-manager';
import { BrowserStorage } from '../../src/lib/cache/storage';

vi.mock('../../src/lib/cache/storage');

describe('CacheManager', () => {
  it('should fetch data when cache is empty', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'fresh' });
    vi.mocked(BrowserStorage.getCachedUser).mockReturnValue(null);

    const result = await CacheManager.getOrFetch('user', 'testuser', mockFetch);

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({ data: 'fresh' });
  });

  it('should return cached data when available', async () => {
    const cachedData = { data: 'cached' };
    const mockFetch = vi.fn();
    vi.mocked(BrowserStorage.getCachedUser).mockReturnValue(cachedData);

    const result = await CacheManager.getOrFetch('user', 'testuser', mockFetch);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData);
  });

  it('should force refresh when forceRefresh is true', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'fresh' });
    vi.mocked(BrowserStorage.getCachedUser).mockReturnValue({ data: 'cached' });

    const result = await CacheManager.getOrFetch('user', 'testuser', mockFetch, {
      forceRefresh: true,
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({ data: 'fresh' });
  });

  it('should invalidate cache for specific user', () => {
    CacheManager.invalidate('user', 'testuser');
    expect(BrowserStorage.remove).toHaveBeenCalledWith('user_testuser');
  });

  it('should invalidate all caches for a user', () => {
    CacheManager.invalidateAll('testuser');
    
    expect(BrowserStorage.remove).toHaveBeenCalledWith('user_testuser');
    expect(BrowserStorage.remove).toHaveBeenCalledWith('repos_testuser');
    expect(BrowserStorage.remove).toHaveBeenCalledWith('stars_testuser');
    expect(BrowserStorage.remove).toHaveBeenCalledWith('stats_testuser');
  });

  it('should fetch and cache commit stats', async () => {
    const mockCommitStats = {
      totalCommits: 100,
      commitsByDayOfWeek: { Monday: 20 },
      commitsByHour: { 9: 10 },
      mostActiveDay: 'Monday',
      mostActiveHour: 9,
      streakDays: 5,
      longestStreak: 10,
      commitDates: ['2023-01-01'],
      averageCommitsPerDay: 2.5,
      weekendWarrior: false,
      nightOwl: false,
      earlyBird: true,
    };
    const mockFetch = vi.fn().mockResolvedValue(mockCommitStats);
    vi.mocked(BrowserStorage.getCachedCommitStats).mockReturnValue(null);

    const result = await CacheManager.getOrFetch('commitStats', 'testuser', mockFetch);

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual(mockCommitStats);
  });

  it('should return cached commit stats when available', async () => {
    const cachedCommitStats = {
      totalCommits: 50,
      commitsByDayOfWeek: { Tuesday: 10 },
      commitsByHour: { 10: 5 },
      mostActiveDay: 'Tuesday',
      mostActiveHour: 10,
      streakDays: 3,
      longestStreak: 7,
      commitDates: ['2023-02-01'],
      averageCommitsPerDay: 1.5,
      weekendWarrior: true,
      nightOwl: false,
      earlyBird: false,
    };
    const mockFetch = vi.fn();
    vi.mocked(BrowserStorage.getCachedCommitStats).mockReturnValue(cachedCommitStats);

    const result = await CacheManager.getOrFetch('commitStats', 'testuser', mockFetch);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual(cachedCommitStats);
  });

  it('should support ttlMinutes option for caching', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'fresh' });
    vi.mocked(BrowserStorage.getCachedUser).mockReturnValue(null);

    await CacheManager.getOrFetch('user', 'testuser', mockFetch, { ttlMinutes: 30 });

    expect(mockFetch).toHaveBeenCalled();
  });
});
