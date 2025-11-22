import type { AccountStats, GitHubUser, Repository, StarredRepo } from '../../src/lib/github/types';
import { useAuthStore } from '../../src/stores/auth-store';
import { useUserStore } from '../../src/stores/user-store';
import { useProfileBuilderStore } from '../../src/stores/profile-builder-store';
import { useStarsStore } from '../../src/stores/stars-store';

const { initAuth, startDeviceFlow, completeAuth, logout, clearError } = useAuthStore.getState();
const authActions = { initAuth, startDeviceFlow, completeAuth, logout, clearError };

const userActions = useUserStore.getState();
const { fetchUser, fetchRepos, fetchStats, clearUser } = userActions;

const profileBuilderState = useProfileBuilderStore.getState();
const profileBuilderActions = {
  selectTemplate: profileBuilderState.selectTemplate,
  setFilterCategory: profileBuilderState.setFilterCategory,
  setSearchQuery: profileBuilderState.setSearchQuery,
  updateVariable: profileBuilderState.updateVariable,
  updateWidget: profileBuilderState.updateWidget,
  toggleWidget: profileBuilderState.toggleWidget,
  setRawMarkdown: profileBuilderState.setRawMarkdown,
  setEditorMode: profileBuilderState.setEditorMode,
  generatePreview: profileBuilderState.generatePreview,
  checkProfileRepoStatus: profileBuilderState.checkProfileRepoStatus,
  createProfileRepo: profileBuilderState.createProfileRepo,
  deployToGitHub: profileBuilderState.deployToGitHub,
  loadBackups: profileBuilderState.loadBackups,
  restoreFromBackup: profileBuilderState.restoreFromBackup,
  reset: profileBuilderState.reset,
};
const initialTemplates = profileBuilderState.templates;

const starsActions = useStarsStore.getState();
const {
  fetchMyStars,
  fetchUserStars,
  copyStarsFromUser,
  starRepository,
  unstarRepository,
  clearTargetUser,
} = starsActions;

export const sampleUser: GitHubUser = {
  login: 'octocat',
  id: 1,
  avatar_url: 'https://example.com/avatar.png',
  name: 'The Octocat',
  company: 'GitHub',
  blog: 'https://github.blog',
  location: 'Internet',
  email: 'octo@example.com',
  bio: 'Just an octocat building tools.',
  public_repos: 42,
  public_gists: 7,
  followers: 9001,
  following: 1,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const sampleStats: AccountStats = {
  totalCommits: 1200,
  totalStars: 512,
  totalRepos: 50,
  accountAge: 365,
  primaryLanguage: 'TypeScript',
  languageStats: {
    TypeScript: 25,
    JavaScript: 15,
    Python: 10,
  },
  commitsByDay: [],
  reposCreatedByMonth: {},
};

export const createSampleRepo = (overrides: Partial<Repository> = {}): Repository => ({
  id: 100,
  name: 'telescope',
  full_name: 'abutbul/telescope',
  description: 'Sample repository',
  private: false,
  html_url: 'https://github.com/abutbul/telescope',
  fork: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-02-01T00:00:00Z',
  pushed_at: '2024-02-02T00:00:00Z',
  stargazers_count: 123,
  watchers_count: 123,
  language: 'TypeScript',
  forks_count: 12,
  open_issues_count: 1,
  topics: ['github', 'tools'],
  ...overrides,
});

export const createStarredRepo = (overrides: Partial<StarredRepo> = {}): StarredRepo => ({
  starred_at: '2024-02-02T00:00:00Z',
  repo: createSampleRepo(),
  ...overrides,
});

export const resetAuthStore = () => {
  useAuthStore.setState({
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    deviceCode: null,
    verificationUri: null,
    ...authActions,
  });
};

export const resetUserStore = () => {
  useUserStore.setState({
    user: null,
    repos: [],
    stats: null,
    isLoading: false,
    error: null,
    fetchUser,
    fetchRepos,
    fetchStats,
    clearUser,
  });
};

export const resetProfileBuilderStore = () => {
  useProfileBuilderStore.setState({
    templates: initialTemplates,
    selectedTemplate: null,
    filterCategory: null,
    searchQuery: '',
    customization: null,
    isDirty: false,
    previewMarkdown: '',
    editorMode: 'form',
    profileRepoStatus: null,
    backups: [],
    isDeploying: false,
    deployError: null,
    isLoadingStatus: false,
    isLoadingBackups: false,
    ...profileBuilderActions,
  });
};

export const resetStarsStore = () => {
  useStarsStore.setState({
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
    fetchMyStars,
    fetchUserStars,
    copyStarsFromUser,
    starRepository,
    unstarRepository,
    clearTargetUser,
  });
};
