/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileRepoManager } from '../../src/lib/profile-builder/profile-repo-manager';

// Mock GitHubAPI
vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn().mockImplementation(() => ({
    octokit: {
      rest: {
        repos: {
          get: vi.fn(),
          createForAuthenticatedUser: vi.fn(),
          getContent: vi.fn(),
          createOrUpdateFileContents: vi.fn(),
          listCommits: vi.fn(),
        },
      },
    },
  })),
}));

import { GitHubAPI } from '../../src/lib/github/api';

describe('ProfileRepoManager', () => {
  let manager: ProfileRepoManager;
  let mockApi: any;

  beforeEach(() => {
    mockApi = new GitHubAPI();
    manager = new ProfileRepoManager(mockApi);
  });

  it('should check profile repo when it exists with README', async () => {
    const mockRepo = { updated_at: '2023-01-01T00:00:00Z' };
    const mockReadme = { content: 'SGVsbG8gV29ybGQ=', sha: 'abc123' }; // 'Hello World' base64

    mockApi.octokit.rest.repos.get.mockResolvedValue({ data: mockRepo });
    mockApi.octokit.rest.repos.getContent.mockResolvedValue({ data: mockReadme });

    const result = await manager.checkProfileRepo('testuser');

    expect(result.exists).toBe(true);
    expect(result.hasReadme).toBe(true);
    expect(result.readmeContent).toBe('Hello World');
    expect(result.readmeSha).toBe('abc123');
  });

  it('should check profile repo when it exists without README', async () => {
    const mockRepo = { updated_at: '2023-01-01T00:00:00Z' };

    mockApi.octokit.rest.repos.get.mockResolvedValue({ data: mockRepo });
    mockApi.octokit.rest.repos.getContent.mockRejectedValue({ status: 404 });

    const result = await manager.checkProfileRepo('testuser');

    expect(result.exists).toBe(true);
    expect(result.hasReadme).toBe(false);
  });

  it('should check profile repo when it does not exist', async () => {
    mockApi.octokit.rest.repos.get.mockRejectedValue({ status: 404 });

    const result = await manager.checkProfileRepo('testuser');

    expect(result.exists).toBe(false);
    expect(result.hasReadme).toBe(false);
  });

  it('should create profile repo', async () => {
    const mockRepo = { id: 1, name: 'testuser' };
    mockApi.octokit.rest.repos.createForAuthenticatedUser.mockResolvedValue({ data: mockRepo });

    const result = await manager.createProfileRepo('testuser', 'Test description');

    expect(result).toEqual(mockRepo);
    expect(mockApi.octokit.rest.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
      name: 'testuser',
      description: 'Test description',
      auto_init: true,
      private: false,
    });
  });

  it('should get current README', async () => {
    const mockReadme = { content: 'SGVsbG8=', sha: 'def456' };
    mockApi.octokit.rest.repos.getContent.mockResolvedValue({ data: mockReadme });

    const result = await manager.getCurrentReadme('testuser');

    expect(result?.content).toBe('Hello');
    expect(result?.sha).toBe('def456');
  });

  it('should return null when README does not exist', async () => {
    mockApi.octokit.rest.repos.getContent.mockRejectedValue({ status: 404 });

    const result = await manager.getCurrentReadme('testuser');

    expect(result).toBeNull();
  });

  it('should update README', async () => {
    mockApi.octokit.rest.repos.createOrUpdateFileContents.mockResolvedValue(undefined);

    await manager.updateReadme('testuser', 'New content', 'Update message', 'oldsha');

    expect(mockApi.octokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
      owner: 'testuser',
      repo: 'testuser',
      path: 'README.md',
      message: 'Update message',
      content: expect.any(String), // base64 encoded
      sha: 'oldsha',
    });
  });

  it('should list README history', async () => {
    const mockCommits = [
      {
        sha: 'sha1',
        commit: {
          message: 'Commit 1',
          author: { date: '2023-01-01T00:00:00Z' },
        },
      },
    ];
    mockApi.octokit.rest.repos.listCommits.mockResolvedValue({ data: mockCommits });

    const result = await manager.listReadmeHistory('testuser');

    expect(result).toHaveLength(1);
    expect(result[0].sha).toBe('sha1');
    expect(result[0].message).toBe('Commit 1');
  });

  it('should return empty array on list README history error', async () => {
    mockApi.octokit.rest.repos.listCommits.mockRejectedValue(new Error('API Error'));

    const result = await manager.listReadmeHistory('testuser');

    expect(result).toEqual([]);
  });

  it('should get README at commit', async () => {
    const mockReadme = { content: 'Q29udGVudA==' }; // 'Content' base64
    mockApi.octokit.rest.repos.getContent.mockResolvedValue({ data: mockReadme });

    const result = await manager.getReadmeAtCommit('testuser', 'commitsha');

    expect(result).toBe('Content');
  });

  it('should restore README', async () => {
    const mockReadme = { content: 'UmVzdG9yZWQgY29udGVudA==' }; // 'Restored content' base64
    mockApi.octokit.rest.repos.getContent.mockResolvedValue({ data: mockReadme });
    mockApi.octokit.rest.repos.createOrUpdateFileContents.mockResolvedValue(undefined);

    await manager.restoreReadme('testuser', 'backupsha', 'currentsha');

    expect(mockApi.octokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
      owner: 'testuser',
      repo: 'testuser',
      path: 'README.md',
      message: expect.stringContaining('Restored README from backup'),
      content: expect.any(String),
      sha: 'currentsha',
    });
  });

  it('should create backup', async () => {
    const mockReadme = { content: 'QmFja3Vw', sha: 'backupsha' };
    mockApi.octokit.rest.repos.getContent.mockResolvedValue({ data: mockReadme });

    const result = await manager.createBackup('testuser');

    expect(result).toBe('backupsha');
  });
});