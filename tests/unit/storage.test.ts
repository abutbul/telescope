import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserStorage } from '../../src/lib/cache/storage';

describe('BrowserStorage', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('should clear all cached data', () => {
    BrowserStorage.set('key1', 'value1');
    BrowserStorage.set('key2', 'value2');

    BrowserStorage.clear();

    expect(BrowserStorage.get('key1')).toBeNull();
    expect(BrowserStorage.get('key2')).toBeNull();
  });
});
