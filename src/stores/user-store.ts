import { create } from 'zustand';
import { GitHubAPI } from '../lib/github/api';
import { CacheManager } from '../lib/cache/cache-manager';
import type { GitHubUser, Repository, AccountStats } from '../lib/github/types';

interface UserState {
  user: GitHubUser | null;
  repos: Repository[];
  stats: AccountStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchUser: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchRepos: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchStats: (token: string, forceRefresh?: boolean) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  repos: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchUser: async (token: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const api = new GitHubAPI(token);
      const user = await CacheManager.getOrFetch(
        'user',
        'authenticated',
        () => api.getAuthenticatedUser(),
        { forceRefresh }
      );
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  fetchRepos: async (token: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const api = new GitHubAPI(token);
      const user = get().user;
      if (!user) throw new Error('User not loaded');

      const repos = await CacheManager.getOrFetch(
        'repos',
        user.login,
        () => api.getUserRepos(),
        { forceRefresh }
      );
      set({ repos, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch repositories',
        isLoading: false,
      });
    }
  },

  fetchStats: async (token: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const api = new GitHubAPI(token);
      const user = get().user;
      if (!user) throw new Error('User not loaded');

      const stats = await CacheManager.getOrFetch(
        'stats',
        user.login,
        () => api.getAccountStats(),
        { forceRefresh }
      );
      set({ stats, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false,
      });
    }
  },

  clearUser: () => {
    set({
      user: null,
      repos: [],
      stats: null,
      error: null,
    });
  },
}));
