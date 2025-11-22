import { Octokit } from '@octokit/rest';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liJcyMYGxJz8jRAZ'; // Default for development

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export class GitHubAuth {
  private static TOKEN_KEY = 'github_token';
  private static TOKEN_TYPE_KEY = 'github_token_type';

  /**
   * Authenticate using a Personal Access Token (PAT)
   * This works in browser environments without CORS issues
   */
  static async authenticateWithPAT(token: string): Promise<void> {
    // Validate token by making a test API call
    const octokit = new Octokit({ auth: token });
    try {
      await octokit.users.getAuthenticated();
      this.saveToken(token, 'pat');
    } catch (error) {
      throw new Error('Invalid token or insufficient permissions');
    }
  }

  /**
   * Authenticate using OAuth Device Flow
   * NOTE: This requires a backend proxy to work in browser environments due to CORS
   */
  static async authenticateWithDeviceFlow(
    onVerification: (data: { user_code: string; verification_uri: string }) => void
  ): Promise<string> {
    const auth = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId: CLIENT_ID,
      scopes: ['user:email', 'repo', 'public_repo', 'read:org'],
      onVerification,
    });

    const { token } = await auth({ type: 'oauth' });
    this.saveToken(token, 'oauth');
    return token;
  }

  static saveToken(token: string, type: 'pat' | 'oauth' = 'pat'): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.TOKEN_TYPE_KEY, type);
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static getTokenType(): 'pat' | 'oauth' | null {
    return sessionStorage.getItem(this.TOKEN_TYPE_KEY) as 'pat' | 'oauth' | null;
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_TYPE_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static createOctokit(token?: string): Octokit {
    const authToken = token || this.getToken();
    return new Octokit({
      auth: authToken || undefined,
    });
  }
}
