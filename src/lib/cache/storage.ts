// Browser Storage Utilities

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

export class BrowserStorage {
  private static readonly PREFIX = 'telescope_';

  // Generic cache operations
  static set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Handle quota exceeded
      this.clearOldEntries();
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const age = Date.now() - entry.timestamp;

      if (age > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static clearOldEntries(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (!key.startsWith(this.PREFIX)) return;

      try {
        const item = localStorage.getItem(key);
        if (!item) return;

        const entry: CacheEntry<unknown> = JSON.parse(item);
        const age = now - entry.timestamp;

        if (age > entry.ttl) {
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid entry, remove it
        localStorage.removeItem(key);
      }
    });
  }

  // Specific cache keys
  static cacheUser(username: string, data: unknown, ttl?: number): void {
    this.set(`user_${username}`, data, ttl);
  }

  static getCachedUser(username: string): unknown | null {
    return this.get(`user_${username}`);
  }

  static cacheRepos(username: string, data: unknown, ttl?: number): void {
    this.set(`repos_${username}`, data, ttl);
  }

  static getCachedRepos(username: string): unknown | null {
    return this.get(`repos_${username}`);
  }

  static cacheStars(username: string, data: unknown, ttl?: number): void {
    this.set(`stars_${username}`, data, ttl);
  }

  static getCachedStars(username: string): unknown | null {
    return this.get(`stars_${username}`);
  }

  static cacheStats(username: string, data: unknown, ttl?: number): void {
    this.set(`stats_${username}`, data, ttl);
  }

  static getCachedStats(username: string): unknown | null {
    return this.get(`stats_${username}`);
  }

  static cacheFollowers(username: string, data: unknown, ttl?: number): void {
    this.set(`followers_${username}`, data, ttl);
  }

  static getCachedFollowers(username: string): unknown | null {
    return this.get(`followers_${username}`);
  }

  static cacheFollowing(username: string, data: unknown, ttl?: number): void {
    this.set(`following_${username}`, data, ttl);
  }

  static getCachedFollowing(username: string): unknown | null {
    return this.get(`following_${username}`);
  }
}
