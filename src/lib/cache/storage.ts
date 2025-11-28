// Browser Storage Utilities

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

export class BrowserStorage {
  private static readonly PREFIX = 'telescope_';
  private static readonly MAX_RETRIES = 2;

  // Clear entries more aggressively - oldest first, then by size
  private static clearEntriesAggressively(): void {
    const entries: { key: string; timestamp: number; size: number }[] = [];
    
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(this.PREFIX)) continue;
      
      try {
        const item = localStorage.getItem(key);
        if (!item) continue;
        
        const parsed = JSON.parse(item) as CacheEntry<unknown>;
        entries.push({
          key,
          timestamp: parsed.timestamp || 0,
          size: item.length,
        });
      } catch {
        // Invalid entry, remove it
        localStorage.removeItem(key);
      }
    }

    // If no entries to clear, nothing we can do
    if (entries.length === 0) {
      return;
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 50% of entries
    const toRemove = Math.max(1, Math.ceil(entries.length / 2));
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  // Generic cache operations
  static set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): boolean {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    const fullKey = this.PREFIX + key;
    const serialized = JSON.stringify(entry);

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        localStorage.setItem(fullKey, serialized);
        return true;
      } catch (error) {
        if (error instanceof DOMException && 
            (error.name === 'QuotaExceededError' || error.code === 22)) {
          console.warn(`Storage quota exceeded (attempt ${attempt + 1}), clearing old entries...`);
          
          if (attempt === 0) {
            // First attempt: clear expired entries
            this.clearOldEntries();
          } else {
            // Subsequent attempts: clear more aggressively
            this.clearEntriesAggressively();
          }
        } else {
          console.error('Failed to save to localStorage:', error);
          return false;
        }
      }
    }

    // All retries failed - this is ok, the app should still work without caching
    console.warn(`Could not cache ${key} after ${this.MAX_RETRIES + 1} attempts. Continuing without cache.`);
    return false;
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
