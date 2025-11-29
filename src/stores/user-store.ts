import { create } from 'zustand';
import { GitHubAPI } from '../lib/github/api';
import { CacheManager } from '../lib/cache/cache-manager';
import type { GitHubUser, Repository, AccountStats, CommitStats, GitHubGist, StarredRepo } from '../lib/github/types';

interface DashboardData {
  followbackRate: number;
  followersNotFollowingBack: number;
  followingNotFollowedBack: number;
  mutualFollows: number;
  recentlyUpdatedStarredRepos: StarredRepo[];
  followedUsersGists: GitHubGist[];
  commitStats: CommitStats | null;
}

interface UserState {
  user: GitHubUser | null;
  repos: Repository[];
  stats: AccountStats | null;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  isLoadingDashboard: boolean;
  error: string | null;
}

interface UserActions {
  fetchUser: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchRepos: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchStats: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchDashboardData: (token: string, forceRefresh?: boolean) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  repos: [],
  stats: null,
  dashboardData: null,
  isLoading: false,
  isLoadingDashboard: false,
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

  fetchDashboardData: async (token: string, forceRefresh = false) => {
    set({ isLoadingDashboard: true });
    try {
      const api = new GitHubAPI(token);
      const user = get().user;
      if (!user) throw new Error('User not loaded');

      // Fetch followers and following for followback analysis
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
        ),
      ]);

      const followerLogins = new Set(followers.map(f => f.login));
      const followingLogins = new Set(following.map(f => f.login));
      
      const mutualFollows = followers.filter(f => followingLogins.has(f.login)).length;
      const followersNotFollowingBack = followers.filter(f => !followingLogins.has(f.login)).length;
      const followingNotFollowedBack = following.filter(f => !followerLogins.has(f.login)).length;
      
      const followbackRate = following.length > 0 
        ? (mutualFollows / following.length) * 100 
        : 0;

      // Fetch starred repos
      const stars = await CacheManager.getOrFetch(
        'stars',
        'authenticated',
        () => api.getStarredRepos(),
        { forceRefresh }
      );

      // Get recently updated starred repos (sorted by repo updated_at)
      const recentlyUpdatedStarredRepos = [...stars]
        .sort((a, b) => new Date(b.repo.updated_at).getTime() - new Date(a.repo.updated_at).getTime())
        .slice(0, 10);

      // Fetch gists from people user follows (sample a few)
      const gistsPromises = following.slice(0, 10).map(async (followedUser) => {
        try {
          const gists = await api.getGistsForUser(followedUser.login);
          return gists.slice(0, 3); // Get max 3 gists per user
        } catch {
          return [];
        }
      });

      const gistsResults = await Promise.all(gistsPromises);
      const followedUsersGists = gistsResults
        .flat()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

      // Fetch commit stats
      const commitStats = await CacheManager.getOrFetch(
        'commitStats',
        user.login,
        () => api.getCommitStats(user.login),
        { forceRefresh, ttlMinutes: 60 }
      );

      set({
        dashboardData: {
          followbackRate,
          followersNotFollowingBack,
          followingNotFollowedBack,
          mutualFollows,
          recentlyUpdatedStarredRepos,
          followedUsersGists,
          commitStats,
        },
        isLoadingDashboard: false,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ isLoadingDashboard: false });
    }
  },

  clearUser: () => {
    set({
      user: null,
      repos: [],
      stats: null,
      dashboardData: null,
      error: null,
    });
  },
}));
