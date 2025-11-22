import { create } from 'zustand';
import { GitHubAuth } from '../lib/github/auth';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  deviceCode: string | null;
  verificationUri: string | null;
}

interface AuthActions {
  initAuth: () => void;
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

  initAuth: () => {
    const token = GitHubAuth.getToken();
    set({
      token,
      isAuthenticated: token !== null,
    });
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
      isAuthenticated: false,
      deviceCode: null,
      verificationUri: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
