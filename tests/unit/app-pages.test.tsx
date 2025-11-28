/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard';
import StarsPage from '../../src/pages/StarsPage';
import ForkManagement from '../../src/pages/ForkManagement';
import { useAuthStore } from '../../src/stores/auth-store';
import { useUserStore } from '../../src/stores/user-store';
import { useStarsStore } from '../../src/stores/stars-store';
import {
  resetAuthStore,
  resetUserStore,
  resetStarsStore,
  sampleUser,
  sampleStats,
  createSampleRepo,
  createStarredRepo,
} from '../utils/store-helpers';

const forkRepository = vi.fn();
const getAuthenticatedUser = vi.fn().mockResolvedValue({ login: 'octocat' });
const syncFork = vi.fn();

vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn(() => ({
    forkRepository,
    getAuthenticatedUser,
    syncFork,
  })),
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    resetAuthStore();
    resetUserStore();
    useAuthStore.setState({ token: 'token-xyz' });
  });

  it('renders user analytics and triggers data fetch', () => {
    const fetchUser = vi.fn();
    const fetchRepos = vi.fn();
    const fetchStats = vi.fn();

    useUserStore.setState({
      user: sampleUser,
      repos: [
        createSampleRepo({ id: 1, name: 'alpha', updated_at: '2024-04-01T00:00:00Z' }),
        createSampleRepo({ id: 2, name: 'beta', updated_at: '2024-03-01T00:00:00Z', description: 'Beta repo' }),
      ],
      stats: sampleStats,
      isLoading: false,
      fetchUser,
      fetchRepos,
      fetchStats,
    });

    render(<Dashboard />);

    expect(screen.getByText(sampleUser.name!)).toBeInTheDocument();
    expect(screen.getByText(`@${sampleUser.login}`)).toBeInTheDocument();
    expect(screen.getByText(/Account Age/i)).toBeInTheDocument();
    expect(screen.getByText(/Languages/)).toBeInTheDocument();
    expect(screen.getByText(/Recent Repositories/)).toBeInTheDocument();

    expect(fetchUser).toHaveBeenCalledWith('token-xyz');
    expect(fetchRepos).toHaveBeenCalledWith('token-xyz');
    expect(fetchStats).toHaveBeenCalledWith('token-xyz');
  });

  it('shows loading indicator before user data arrives', async () => {
    useUserStore.setState({
      user: null,
      repos: [],
      stats: null,
      isLoading: true,
      fetchUser: vi.fn(),
      fetchRepos: vi.fn(),
      fetchStats: vi.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
    });
  });

  it('shows fallback when user data cannot be loaded', () => {
    useUserStore.setState({
      user: null,
      repos: [],
      stats: null,
      isLoading: false,
      error: 'boom',
      fetchUser: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText(/failed to load user data/i)).toBeInTheDocument();
  });
});

describe('Stars page', () => {
  beforeEach(() => {
    resetAuthStore();
    resetStarsStore();
    useAuthStore.setState({ token: 'token-stars' });
  });

  it('allows searching, selecting, copying and clearing stars', async () => {
    const fetchMyStars = vi.fn();
    const fetchUserStars = vi.fn();
    const copyStarsFromUser = vi.fn().mockResolvedValue(undefined);
    const clearTargetUser = vi.fn();

    const myStar = createStarredRepo({
      repo: createSampleRepo({ id: 1, full_name: 'abutbul/alpha' }),
    });
    const otherStar = createStarredRepo({
      repo: createSampleRepo({ id: 2, full_name: 'another/new-repo' }),
    });
    const alreadyStarred = createStarredRepo({
      repo: createSampleRepo({ id: 3, full_name: 'abutbul/alpha' }),
    });

    useStarsStore.setState({
      myStars: [myStar],
      targetUserStars: [otherStar, alreadyStarred],
      targetUsername: 'another',
      isLoading: false,
      copyProgress: { total: 2, completed: 1, failed: 0, inProgress: false },
      fetchMyStars,
      fetchUserStars,
      copyStarsFromUser,
      clearTargetUser,
    });

    render(<StarsPage />);

    const searchInput = screen.getByPlaceholderText(/enter github username/i);
    fireEvent.change(searchInput, { target: { value: 'spacecowboy' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(fetchUserStars).toHaveBeenCalledWith('token-stars', 'spacecowboy');

    const selectableCard = screen.getByText('another/new-repo').closest('div');
    expect(selectableCard).not.toBeNull();
    fireEvent.click(selectableCard!);

    const copyButton = screen.getByRole('button', { name: /copy 1 selected/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyStarsFromUser).toHaveBeenCalled();
      const [tokenArg, reposArg] = copyStarsFromUser.mock.calls[0];
      expect(tokenArg).toBe('token-stars');
      expect(reposArg).toHaveLength(1);
      expect(reposArg[0].full_name).toBe('another/new-repo');
      expect(fetchMyStars).toHaveBeenCalledWith('token-stars', true);
    });

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(clearTargetUser).toHaveBeenCalled();
  });
});

describe('Fork management', () => {
  beforeEach(() => {
    resetAuthStore();
    resetUserStore();
    useAuthStore.setState({ token: 'token-fork' });
    forkRepository.mockClear();
    syncFork.mockClear();
    getAuthenticatedUser.mockClear();
  });

  it('forks the repository and shows a success message', async () => {
    forkRepository.mockResolvedValue({ full_name: 'octocat/telescope' });

    render(<ForkManagement />);

    fireEvent.click(screen.getByRole('button', { name: /fork to my account/i }));

    await waitFor(() => {
      expect(forkRepository).toHaveBeenCalledWith('yourusername', 'telescope');
      expect(screen.getByText(/successfully forked/i)).toBeInTheDocument();
    });
  });

  it('syncs fork with upstream and shows confirmation', async () => {
    syncFork.mockResolvedValue(undefined);

    render(<ForkManagement />);

    fireEvent.click(screen.getByRole('button', { name: /sync with upstream/i }));

    await waitFor(() => {
      expect(getAuthenticatedUser).toHaveBeenCalled();
      expect(syncFork).toHaveBeenCalledWith('octocat', 'telescope');
      expect(screen.getByText(/successfully synced/i)).toBeInTheDocument();
    });
  });
});
