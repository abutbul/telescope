import { Octokit } from '@octokit/rest';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liJcyMYGxJz8jRAZ'; // Default for development

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export class GitHubAuth {
  private static TOKEN_KEY = 'github_token';

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
    this.saveToken(token);
    return token;
  }

  static saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
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
