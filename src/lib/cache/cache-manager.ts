import { BrowserStorage } from './storage';

export type CacheKey = 'user' | 'repos' | 'stars' | 'stats' | 'followers' | 'following' | 'commitStats';

export interface CacheOptions {
  ttl?: number; // milliseconds
  ttlMinutes?: number; // convenience property
  forceRefresh?: boolean;
}

export class CacheManager {
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static async getOrFetch<T>(
    key: CacheKey,
    username: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, ttlMinutes, forceRefresh = false } = options;
    const effectiveTtl = ttlMinutes ? ttlMinutes * 60 * 1000 : ttl;

    if (!forceRefresh) {
      const cached = this.getCached<T>(key, username);
      if (cached !== null) {
        return cached;
      }
    }

    const data = await fetchFn();
    this.cache(key, username, data, effectiveTtl);
    return data;
  }

  private static getCached<T>(key: CacheKey, username: string): T | null {
    switch (key) {
      case 'user':
        return BrowserStorage.getCachedUser(username) as T | null;
      case 'repos':
        return BrowserStorage.getCachedRepos(username) as T | null;
      case 'stars':
        return BrowserStorage.getCachedStars(username) as T | null;
      case 'stats':
        return BrowserStorage.getCachedStats(username) as T | null;
      case 'followers':
        return BrowserStorage.getCachedFollowers(username) as T | null;
      case 'following':
        return BrowserStorage.getCachedFollowing(username) as T | null;
      case 'commitStats':
        return BrowserStorage.getCachedCommitStats(username) as T | null;
      default:
        return null;
    }
  }

  private static cache(key: CacheKey, username: string, data: unknown, ttl: number): void {
    switch (key) {
      case 'user':
        BrowserStorage.cacheUser(username, data, ttl);
        break;
      case 'repos':
        BrowserStorage.cacheRepos(username, data, ttl);
        break;
      case 'stars':
        BrowserStorage.cacheStars(username, data, ttl);
        break;
      case 'stats':
        BrowserStorage.cacheStats(username, data, ttl);
        break;
      case 'followers':
        BrowserStorage.cacheFollowers(username, data, ttl);
        break;
      case 'following':
        BrowserStorage.cacheFollowing(username, data, ttl);
        break;
      case 'commitStats':
        BrowserStorage.cacheCommitStats(username, data, ttl);
        break;
    }
  }

  static invalidate(key: CacheKey, username: string): void {
    BrowserStorage.remove(`${key}_${username}`);
  }

  static invalidateAll(username: string): void {
    const keys: CacheKey[] = ['user', 'repos', 'stars', 'stats', 'followers', 'following', 'commitStats'];
    keys.forEach((key) => this.invalidate(key, username));
  }

  static clearAll(): void {
    BrowserStorage.clear();
  }
}
