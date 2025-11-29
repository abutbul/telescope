import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserStorage } from '../../src/lib/cache/storage';

describe('BrowserStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should store and retrieve data', () => {
    const testData = { name: 'test', value: 123 };
    BrowserStorage.set('test-key', testData);

    const retrieved = BrowserStorage.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', async () => {
    const testData = { name: 'test' };
    BrowserStorage.set('test-key', testData, 10); // 10ms TTL

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 15));
    
    const retrieved = BrowserStorage.get('test-key');
    expect(retrieved).toBeNull();
  });

  it('should remove expired entries on clearOldEntries', async () => {
    BrowserStorage.set('fresh', 'data', 1000000);
    BrowserStorage.set('stale', 'data', 10); // 10ms TTL

    // Wait for stale entry to expire
    await new Promise((resolve) => setTimeout(resolve, 15));

    BrowserStorage.clearOldEntries();

    expect(BrowserStorage.get('fresh')).not.toBeNull();
    expect(BrowserStorage.get('stale')).toBeNull();
  });

  it('should cache user data', () => {
    const userData = { login: 'testuser', id: 123 };
    BrowserStorage.cacheUser('testuser', userData);

    const retrieved = BrowserStorage.getCachedUser('testuser');
    expect(retrieved).toEqual(userData);
  });

  it('should cache commit stats data', () => {
    const commitStats = {
      totalCommits: 100,
      commitsByDayOfWeek: { Monday: 20, Tuesday: 15 },
      commitsByHour: { 9: 10, 10: 15 },
      mostActiveDay: 'Monday',
      mostActiveHour: 10,
      streakDays: 5,
      longestStreak: 10,
      commitDates: ['2023-01-01', '2023-01-02'],
      averageCommitsPerDay: 2.5,
      weekendWarrior: false,
      nightOwl: false,
      earlyBird: true,
    };
    BrowserStorage.cacheCommitStats('testuser', commitStats);

    const retrieved = BrowserStorage.getCachedCommitStats('testuser');
    expect(retrieved).toEqual(commitStats);
  });

  it('should return null for non-existent commit stats', () => {
    const retrieved = BrowserStorage.getCachedCommitStats('nonexistent');
    expect(retrieved).toBeNull();
  });

  it('should clear all cached data', () => {
    BrowserStorage.set('key1', 'value1');
    BrowserStorage.set('key2', 'value2');

    BrowserStorage.clear();

    expect(BrowserStorage.get('key1')).toBeNull();
    expect(BrowserStorage.get('key2')).toBeNull();
  });

  it('should return true when set succeeds', () => {
    const result = BrowserStorage.set('test-key', { data: 'test' });
    expect(result).toBe(true);
  });

  it('should handle quota exceeded by clearing old entries and retrying', () => {
    // Setup: add some entries first
    BrowserStorage.set('telescope_old1', 'data1');
    BrowserStorage.set('telescope_old2', 'data2');
    
    let callCount = 0;
    const originalSetItem = localStorage.setItem.bind(localStorage);
    
    // Mock setItem to fail on first call with QuotaExceededError, then succeed
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      callCount++;
      if (callCount === 1) {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      }
      return originalSetItem(key, value);
    });

    const result = BrowserStorage.set('telescope_new', 'new-data');
    
    // Should succeed after retry
    expect(result).toBe(true);
    // Should have called setItem at least twice (initial + retry)
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('should return false after all retries fail', () => {
    // Mock setItem to always fail with QuotaExceededError
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw error;
    });

    const result = BrowserStorage.set('telescope_key', 'data');
    
    // Should return false after exhausting retries
    expect(result).toBe(false);
  });

  it('should clear entries aggressively on repeated quota errors', () => {
    // Add several entries
    BrowserStorage.set('telescope_a', 'data-a');
    BrowserStorage.set('telescope_b', 'data-b');
    BrowserStorage.set('telescope_c', 'data-c');
    BrowserStorage.set('telescope_d', 'data-d');
    
    let callCount = 0;
    const originalSetItem = localStorage.setItem.bind(localStorage);
    
    // Fail first 2 calls, succeed on third
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      callCount++;
      if (callCount <= 2) {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      }
      return originalSetItem(key, value);
    });

    const result = BrowserStorage.set('telescope_new', 'new-data');
    
    // Should succeed after aggressive clearing
    expect(result).toBe(true);
    expect(callCount).toBe(3);
  });
});
