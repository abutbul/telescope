// Browser Storage Utilities

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

// Check if localStorage is available and working
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__telescope_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export class BrowserStorage {
  private static readonly PREFIX = 'telescope_';
  private static readonly MAX_RETRIES = 2;
  private static readonly MAX_ITEM_SIZE = 500 * 1024; // 500KB max per item to prevent storage bloat
  private static storageAvailable: boolean | null = null;

  // Check storage availability (cached)
  private static isAvailable(): boolean {
    if (this.storageAvailable === null) {
      this.storageAvailable = isLocalStorageAvailable();
      if (!this.storageAvailable) {
        console.warn('localStorage is not available. Caching will be disabled.');
      }
    }
    return this.storageAvailable;
  }

  // Clear entries more aggressively - oldest first, then by size
  private static clearEntriesAggressively(): void {
    if (!this.isAvailable()) return;

    try {
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
    } catch (error) {
      console.error('Failed to clear entries aggressively:', error);
    }
  }

  // Generic cache operations
  static set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): boolean {
    // Check if storage is available
    if (!this.isAvailable()) {
      return false;
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    const fullKey = this.PREFIX + key;
    
    let serialized: string;
    try {
      serialized = JSON.stringify(entry);
    } catch (error) {
      console.warn(`Failed to serialize data for key ${key}:`, error);
      return false;
    }

    // Skip caching if data is too large (prevents storage bloat from large datasets)
    if (serialized.length > this.MAX_ITEM_SIZE) {
      console.warn(`Data for key ${key} is too large (${(serialized.length / 1024).toFixed(1)}KB), skipping cache`);
      return false;
    }

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
    // Check if storage is available
    if (!this.isAvailable()) {
      return null;
    }

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
      // Remove corrupted entry
      this.remove(key);
      return null;
    }
  }

  static remove(key: string): void {
    if (!this.isAvailable()) return;
    
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch {
      // Ignore errors when removing
    }
  }

  static clear(): void {
    if (!this.isAvailable()) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static clearOldEntries(): void {
    if (!this.isAvailable()) return;

    try {
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
    } catch (error) {
      console.error('Failed to clear old entries:', error);
    }
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
