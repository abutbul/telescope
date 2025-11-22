import { describe, it, expect, beforeEach } from 'vitest';
import { GitHubAuth } from '../../src/lib/github/auth';

describe('GitHubAuth', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should save token to sessionStorage', () => {
    const token = 'test-token-123';
    GitHubAuth.saveToken(token);

    expect(GitHubAuth.getToken()).toBe(token);
  });

  it('should retrieve token from sessionStorage', () => {
    const token = 'test-token-456';
    sessionStorage.setItem('github_token', token);

    expect(GitHubAuth.getToken()).toBe(token);
  });

  it('should clear token from sessionStorage', () => {
    GitHubAuth.saveToken('test-token');
    GitHubAuth.clearToken();

    expect(GitHubAuth.getToken()).toBeNull();
  });

  it('should check authentication status', () => {
    expect(GitHubAuth.isAuthenticated()).toBe(false);

    GitHubAuth.saveToken('test-token');
    expect(GitHubAuth.isAuthenticated()).toBe(true);
  });

  it('should create Octokit instance', () => {
    const octokit = GitHubAuth.createOctokit('test-token');
    expect(octokit).toBeDefined();
  });
});
