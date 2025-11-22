import { GitHubAPI } from '../github/api';
import { Repository } from '../github/types';

export interface ProfileRepoStatus {
  exists: boolean;
  hasReadme: boolean;
  readmeContent?: string;
  readmeSha?: string;
  lastUpdated?: string;
}

export interface ReadmeBackup {
  sha: string;
  message: string;
  date: string;
  content?: string;
}

export class ProfileRepoManager {
  constructor(private api: GitHubAPI) {}

  /**
   * Check if username/username repository exists
   */
  async checkProfileRepo(username: string): Promise<ProfileRepoStatus> {
    try {
      const repo = await this.api.octokit.rest.repos.get({
        owner: username,
        repo: username,
      });

      // Check for README.md
      const readme = await this.getCurrentReadme(username);

      return {
        exists: true,
        hasReadme: !!readme,
        readmeContent: readme?.content,
        readmeSha: readme?.sha,
        lastUpdated: repo.data.updated_at,
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        if ((error as { status: number }).status === 404) {
          return {
            exists: false,
            hasReadme: false,
          };
        }
      }
      throw error;
    }
  }

  /**
   * Create username/username repository
   */
  async createProfileRepo(username: string, description?: string): Promise<Repository> {
    const response = await this.api.octokit.rest.repos.createForAuthenticatedUser({
      name: username,
      description: description || `✨ Profile README for @${username}`,
      auto_init: true,
      private: false,
    });

    return response.data as Repository;
  }

  /**
   * Get current README.md content and SHA
   */
  async getCurrentReadme(
    username: string,
  ): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.api.octokit.rest.repos.getContent({
        owner: username,
        repo: username,
        path: 'README.md',
      });

      if ('content' in response.data && response.data.content) {
        // Decode base64 content
        const content = decodeURIComponent(
          escape(atob(response.data.content.replace(/\n/g, ''))),
        );
        return {
          content,
          sha: response.data.sha,
        };
      }

      return null;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        if ((error as { status: number }).status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Update or create README.md
   */
  async updateReadme(
    username: string,
    content: string,
    message: string = '✨ Updated profile via Telescope',
    sha?: string,
  ): Promise<void> {
    // Encode content to base64
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    await this.api.octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: username,
      path: 'README.md',
      message,
      content: encodedContent,
      sha, // Required for updates, omit for creates
    });
  }

  /**
   * List all commits to README.md (for backup/restore)
   */
  async listReadmeHistory(username: string): Promise<ReadmeBackup[]> {
    try {
      const response = await this.api.octokit.rest.repos.listCommits({
        owner: username,
        repo: username,
        path: 'README.md',
        per_page: 10,
      });

      return response.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author?.date || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to fetch README history:', error);
      return [];
    }
  }

  /**
   * Get README content at a specific commit
   */
  async getReadmeAtCommit(
    username: string,
    commitSha: string,
  ): Promise<string | null> {
    try {
      const response = await this.api.octokit.rest.repos.getContent({
        owner: username,
        repo: username,
        path: 'README.md',
        ref: commitSha,
      });

      if ('content' in response.data && response.data.content) {
        return decodeURIComponent(
          escape(atob(response.data.content.replace(/\n/g, ''))),
        );
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch README at commit:', error);
      return null;
    }
  }

  /**
   * Restore README from a backup (commit)
   */
  async restoreReadme(
    username: string,
    backupSha: string,
    currentSha: string,
  ): Promise<void> {
    // Get content from backup
    const content = await this.getReadmeAtCommit(username, backupSha);
    
    if (!content) {
      throw new Error('Failed to retrieve backup content');
    }

    // Update with restored content
    await this.updateReadme(
      username,
      content,
      `🔄 Restored README from backup (${backupSha.substring(0, 7)})`,
      currentSha,
    );
  }

  /**
   * Create a backup before major changes
   */
  async createBackup(username: string): Promise<string | null> {
    const readme = await this.getCurrentReadme(username);
    
    if (!readme) {
      return null;
    }

    // The current state is already backed up via Git history
    // We just return the current SHA for reference
    return readme.sha;
  }
}
