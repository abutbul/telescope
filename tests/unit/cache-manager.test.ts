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
});
