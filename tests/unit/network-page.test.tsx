/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NetworkPage from '../../src/pages/NetworkPage';
import { useAuthStore } from '../../src/stores/auth-store';
import { useNetworkStore } from '../../src/stores/network-store';
import { useStarsStore } from '../../src/stores/stars-store';
import { resetAuthStore } from '../utils/store-helpers';
import type { GitHubUser } from '../../src/lib/github/types';

// Mock the stores
vi.mock('../../src/stores/auth-store', async () => {
  const actual = await vi.importActual('../../src/stores/auth-store');
  return {
    ...actual,
    useAuthStore: actual.useAuthStore,
  };
});

vi.mock('../../src/stores/network-store', async () => {
  const actual = await vi.importActual('../../src/stores/network-store');
  return {
    ...actual,
    useNetworkStore: actual.useNetworkStore,
  };
});

vi.mock('../../src/stores/stars-store', async () => {
  const actual = await vi.importActual('../../src/stores/stars-store');
  return {
    ...actual,
    useStarsStore: actual.useStarsStore,
  };
});

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.png',
  html_url: 'https://github.com/testuser',
  name: 'Test User',
  company: null,
  blog: null,
  location: null,
  email: null,
  bio: null,
  public_repos: 0,
  public_gists: 0,
  followers: 0,
  following: 0,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2020-01-01T00:00:00Z',
};

describe('NetworkPage', () => {
  beforeEach(() => {
    resetAuthStore();
    useAuthStore.setState({ token: 'test-token' });
    
    useNetworkStore.setState({
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
    });

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
    });
  });

  it('renders network page and fetches my network', () => {
    const fetchMyNetwork = vi.fn();
    useNetworkStore.setState({ fetchMyNetwork });

    render(<NetworkPage />);

    expect(screen.getByText(/Network Manager/i)).toBeInTheDocument();
    expect(fetchMyNetwork).toHaveBeenCalledWith('test-token');
  });

  it('displays my followers and following counts', () => {
    const followers = [{ ...mockUser, id: 2, login: 'follower1' }];
    const following = [{ ...mockUser, id: 3, login: 'following1' }];

    useNetworkStore.setState({
      myFollowers: followers,
      myFollowing: following,
    });

    render(<NetworkPage />);

    // Check for the labels and counts in the overview tab
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    
    // Since there are multiple "1"s (in tabs and in the overview cards), we can be more specific
    // or just check that the text is present in the document
    const overviewTab = screen.getByText('Overview');
    expect(overviewTab).toHaveClass('text-github-accent');

    // Check tabs have counts
    expect(screen.getByText('My Followers (1)')).toBeInTheDocument();
    expect(screen.getByText('My Following (1)')).toBeInTheDocument();
  });

  it('allows following back all followers', async () => {
    const followers = [{ ...mockUser, id: 2, login: 'follower1' }];
    const copyFollowingFromUser = vi.fn();

    useNetworkStore.setState({
      myFollowers: followers,
      myFollowing: [], // Not following back yet
      copyFollowingFromUser,
    });

    render(<NetworkPage />);

    // Switch to Followers tab
    fireEvent.click(screen.getByText(/My Followers/));

    const followBackButton = screen.getByRole('button', { name: /Follow Back All/i });
    fireEvent.click(followBackButton);

    await waitFor(() => {
      expect(copyFollowingFromUser).toHaveBeenCalledWith('test-token', followers);
    });
  });

  it('searches for a user', async () => {
    const fetchUserNetwork = vi.fn();
    useNetworkStore.setState({ fetchUserNetwork });

    render(<NetworkPage />);

    // Switch to Following tab where the search is now located
    fireEvent.click(screen.getByText(/My Following/));

    const input = screen.getByPlaceholderText('Enter GitHub username...');
    fireEvent.change(input, { target: { value: 'targetuser' } });
    
    // Try pressing Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(fetchUserNetwork).toHaveBeenCalledWith('test-token', 'targetuser');
    });
  });

  it('displays target user network', () => {
    const targetFollowers = [{ ...mockUser, id: 4, login: 'target-follower' }];
    const targetFollowing = [{ ...mockUser, id: 5, login: 'target-following' }];

    useNetworkStore.setState({
      targetUsername: 'targetuser',
      targetUserFollowers: targetFollowers,
      targetUserFollowing: targetFollowing,
    });

    render(<NetworkPage />);

    expect(screen.getByText(/targetuser's Network/i)).toBeInTheDocument();
    expect(screen.getByText('target-following')).toBeInTheDocument();
    
    // Switch to followers tab
    const followersTab = screen.getByText(/Followers \(1\)/);
    fireEvent.click(followersTab);
    
    expect(screen.getByText('target-follower')).toBeInTheDocument();
  });

  it('allows copying following from target user', async () => {
    const targetFollowing = [{ ...mockUser, id: 5, login: 'target-following' }];
    const copyFollowingFromUser = vi.fn();

    useNetworkStore.setState({
      targetUsername: 'targetuser',
      targetUserFollowers: [],
      targetUserFollowing: targetFollowing,
      copyFollowingFromUser,
    });

    render(<NetworkPage />);

    // Select the user to copy
    // Click the avatar image to avoid the link's stopPropagation
    fireEvent.click(screen.getByAltText('target-following'));

    const copyButton = screen.getByRole('button', { name: /Follow \(1\)/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyFollowingFromUser).toHaveBeenCalledWith('test-token', targetFollowing);
    });
  });

  it('clears target user', () => {
    const clearTargetUser = vi.fn();
    useNetworkStore.setState({
      targetUsername: 'targetuser',
      clearTargetUser,
    });

    render(<NetworkPage />);

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(clearTargetUser).toHaveBeenCalled();
  });

  it('searches for user stars and copies them', async () => {
    const fetchUserStars = vi.fn();
    const copyStarsFromUser = vi.fn();
    
    useStarsStore.setState({ 
      fetchUserStars,
      copyStarsFromUser,
      targetUserStars: [],
    });

    render(<NetworkPage />);

    // Switch to Stars tab
    fireEvent.click(screen.getByText(/My Stars/));

    const input = screen.getByPlaceholderText('Enter GitHub username...');
    fireEvent.change(input, { target: { value: 'targetuser' } });
    
    // Trigger search with Enter key
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(fetchUserStars).toHaveBeenCalledWith('test-token', 'targetuser');
    });

    // Simulate stars loaded
    const targetStars = [
      { 
        starred_at: '2023-01-01', 
        repo: { 
          id: 101, 
          name: 'awesome-repo', 
          full_name: 'targetuser/awesome-repo',
          description: 'An awesome repo',
          private: false,
          html_url: 'https://github.com/targetuser/awesome-repo',
          fork: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          pushed_at: '2023-01-01',
          stargazers_count: 100,
          watchers_count: 100,
          language: 'TypeScript',
          forks_count: 10,
          open_issues_count: 0,
          topics: []
        } 
      }
    ];

    useStarsStore.setState({
      targetUsername: 'targetuser',
      targetUserStars: targetStars,
    });

    // Re-render to show results (state change should trigger re-render, but in test we might need to wait or force update if not automatic)
    // But since we are modifying the store which the component subscribes to, it should update.
    
    await waitFor(() => {
      expect(screen.getByText('targetuser/awesome-repo')).toBeInTheDocument();
    });

    // Select the repo by clicking the description (clicking the link stops propagation)
    fireEvent.click(screen.getByText('An awesome repo'));

    // Click Copy button
    const copyButton = screen.getByRole('button', { name: /Copy \(1\)/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyStarsFromUser).toHaveBeenCalledWith('test-token', [targetStars[0].repo]);
    });
  });
});
