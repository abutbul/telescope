import { create } from 'zustand';
import { GitHubAPI } from '../lib/github/api';
import { CacheManager } from '../lib/cache/cache-manager';
import type { StarredRepo, Repository } from '../lib/github/types';

interface StarsState {
  myStars: StarredRepo[];
  targetUserStars: StarredRepo[];
  targetUsername: string | null;
  isLoading: boolean;
  error: string | null;
  copyProgress: {
    total: number;
    completed: number;
    failed: number;
    inProgress: boolean;
  };
}

interface StarsActions {
  fetchMyStars: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchUserStars: (token: string, username: string) => Promise<void>;
  copyStarsFromUser: (token: string, reposToCopy: Repository[]) => Promise<void>;
  starRepository: (token: string, owner: string, repo: string) => Promise<void>;
  unstarRepository: (token: string, owner: string, repo: string) => Promise<void>;
  clearTargetUser: () => void;
}

export const useStarsStore = create<StarsState & StarsActions>((set) => ({
  myStars: [],
  targetUserStars: [],
  targetUsername: null,
  isLoading: false,
  error: null,
  copyProgress: {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  },

  fetchMyStars: async (token: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const api = new GitHubAPI(token);
      const stars = await CacheManager.getOrFetch(
        'stars',
        'authenticated',
        () => api.getStarredRepos(),
        { forceRefresh }
      );
      set({ myStars: stars, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stars',
        isLoading: false,
      });
    }
  },

  fetchUserStars: async (token: string, username: string) => {
    set({ isLoading: true, error: null, targetUsername: username });
    try {
      const api = new GitHubAPI(token);
      const stars = await CacheManager.getOrFetch(
        'stars',
        username,
        () => api.getStarredRepos(username),
        { ttl: 60 * 60 * 1000 } // 1 hour cache for other users
      );
      set({ targetUserStars: stars, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user stars',
        isLoading: false,
      });
    }
  },

  copyStarsFromUser: async (token: string, reposToCopy: Repository[]) => {
    const api = new GitHubAPI(token);
    
    set({
      copyProgress: {
        total: reposToCopy.length,
        completed: 0,
        failed: 0,
        inProgress: true,
      },
    });

    let completed = 0;
    let failed = 0;

    for (const repo of reposToCopy) {
      try {
        const [owner, name] = repo.full_name.split('/');
        await api.starRepository(owner, name);
        completed++;
        
        // Rate limiting: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to star ${repo.full_name}:`, error);
        failed++;
      }

      set({
        copyProgress: {
          total: reposToCopy.length,
          completed,
          failed,
          inProgress: true,
        },
      });
    }

    set({
      copyProgress: {
        total: reposToCopy.length,
        completed,
        failed,
        inProgress: false,
      },
    });

    // Invalidate cache after copying
    CacheManager.invalidate('stars', 'authenticated');
  },

  starRepository: async (token: string, owner: string, repo: string) => {
    const api = new GitHubAPI(token);
    await api.starRepository(owner, repo);
    CacheManager.invalidate('stars', 'authenticated');
  },

  unstarRepository: async (token: string, owner: string, repo: string) => {
    const api = new GitHubAPI(token);
    await api.unstarRepository(owner, repo);
    CacheManager.invalidate('stars', 'authenticated');
  },

  clearTargetUser: () => {
    set({
      targetUserStars: [],
      targetUsername: null,
    });
  },
}));
