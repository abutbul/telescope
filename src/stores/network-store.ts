import { create } from 'zustand';
import { GitHubAPI } from '../lib/github/api';
import { CacheManager } from '../lib/cache/cache-manager';
import type { GitHubUser } from '../lib/github/types';

interface NetworkState {
  myFollowers: GitHubUser[];
  myFollowing: GitHubUser[];
  targetUserFollowers: GitHubUser[];
  targetUserFollowing: GitHubUser[];
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

interface NetworkActions {
  fetchMyNetwork: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchUserNetwork: (token: string, username: string) => Promise<void>;
  copyFollowingFromUser: (token: string, usersToFollow: GitHubUser[]) => Promise<void>;
  followUser: (token: string, username: string) => Promise<void>;
  unfollowUser: (token: string, username: string) => Promise<void>;
  clearTargetUser: () => void;
}

export const useNetworkStore = create<NetworkState & NetworkActions>((set) => ({
  myFollowers: [],
  myFollowing: [],
  targetUserFollowers: [],
  targetUserFollowing: [],
  targetUsername: null,
  isLoading: false,
  error: null,
  copyProgress: {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  },

  fetchMyNetwork: async (token: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const api = new GitHubAPI(token);
      const [followers, following] = await Promise.all([
        CacheManager.getOrFetch(
          'followers',
          'authenticated',
          () => api.getFollowers(),
          { forceRefresh }
        ),
        CacheManager.getOrFetch(
          'following',
          'authenticated',
          () => api.getFollowing(),
          { forceRefresh }
        )
      ]);
      set({ myFollowers: followers, myFollowing: following, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch network',
        isLoading: false,
      });
    }
  },

  fetchUserNetwork: async (token: string, username: string) => {
    set({ isLoading: true, error: null, targetUsername: username });
    try {
      const api = new GitHubAPI(token);
      // Don't cache target user data - it's temporary and can be very large
      // (users with thousands of followers would exceed localStorage limits)
      const [followers, following] = await Promise.all([
        api.getFollowers(username),
        api.getFollowing(username),
      ]);
      set({ targetUserFollowers: followers, targetUserFollowing: following, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user network',
        isLoading: false,
      });
    }
  },

  copyFollowingFromUser: async (token: string, usersToFollow: GitHubUser[]) => {
    const api = new GitHubAPI(token);
    
    set({
      copyProgress: {
        total: usersToFollow.length,
        completed: 0,
        failed: 0,
        inProgress: true,
      },
    });

    let completed = 0;
    let failed = 0;

    for (const user of usersToFollow) {
      try {
        await api.followUser(user.login);
        completed++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
      } catch (error) {
        console.error(`Failed to follow ${user.login}:`, error);
        failed++;
      }

      set({
        copyProgress: {
          total: usersToFollow.length,
          completed,
          failed,
          inProgress: true,
        },
      });
    }

    set({
      copyProgress: {
        total: usersToFollow.length,
        completed,
        failed,
        inProgress: false,
      },
    });

    CacheManager.invalidate('following', 'authenticated');
  },

  followUser: async (token: string, username: string) => {
    const api = new GitHubAPI(token);
    await api.followUser(username);
    CacheManager.invalidate('following', 'authenticated');
  },

  unfollowUser: async (token: string, username: string) => {
    const api = new GitHubAPI(token);
    await api.unfollowUser(username);
    CacheManager.invalidate('following', 'authenticated');
  },

  clearTargetUser: () => {
    set({
      targetUserFollowers: [],
      targetUserFollowing: [],
      targetUsername: null,
    });
  },
}));
