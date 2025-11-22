import { create } from 'zustand';
import { GitHubAuth } from '../lib/github/auth';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  deviceCode: string | null;
  verificationUri: string | null;
  tokenType: 'pat' | 'oauth' | null;
}

interface AuthActions {
  initAuth: () => void;
  loginWithPAT: (token: string) => Promise<void>;
  startDeviceFlow: () => Promise<void>;
  completeAuth: (token: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  deviceCode: null,
  verificationUri: null,
  tokenType: null,

  initAuth: () => {
    const token = GitHubAuth.getToken();
    const tokenType = GitHubAuth.getTokenType();
    set({
      token,
      tokenType,
      isAuthenticated: token !== null,
    });
  },

  loginWithPAT: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      await GitHubAuth.authenticateWithPAT(token);
      set({
        token,
        tokenType: 'pat',
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Invalid token',
        isLoading: false,
      });
      throw error;
    }
  },

  startDeviceFlow: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await GitHubAuth.authenticateWithDeviceFlow((data) => {
        set({
          deviceCode: data.user_code,
          verificationUri: data.verification_uri,
        });
      });

      set({
        token,
        tokenType: 'oauth',
        isAuthenticated: true,
        isLoading: false,
        deviceCode: null,
        verificationUri: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false,
      });
    }
  },

  completeAuth: (token: string) => {
    GitHubAuth.saveToken(token);
    set({
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    GitHubAuth.clearToken();
    set({
      token: null,
      tokenType: null,
      isAuthenticated: false,
      deviceCode: null,
      verificationUri: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
