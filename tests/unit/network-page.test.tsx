/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NetworkPage from '../../src/pages/NetworkPage';
import { useAuthStore } from '../../src/stores/auth-store';
import { useNetworkStore } from '../../src/stores/network-store';
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

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.png',
  html_url: 'https://github.com/testuser',
  type: 'User',
  site_admin: false,
  name: 'Test User',
  company: null,
  blog: null,
  location: null,
  email: null,
  hireable: null,
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
  });

  it('renders network page and fetches my network', () => {
    const fetchMyNetwork = vi.fn();
    useNetworkStore.setState({ fetchMyNetwork });

    render(<NetworkPage />);

    expect(screen.getByText(/Network Management/i)).toBeInTheDocument();
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

    const input = screen.getByPlaceholderText(/Enter GitHub username/i);
    fireEvent.change(input, { target: { value: 'targetuser' } });
    
    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    expect(fetchUserNetwork).toHaveBeenCalledWith('test-token', 'targetuser');
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

    expect(screen.getByText(/targetuser follows/i)).toBeInTheDocument();
    expect(screen.getByText('target-following')).toBeInTheDocument();
    // Note: target-follower is not displayed in the list, only target-following (users the target follows)
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
    const userCard = screen.getByText('target-following').closest('div');
    fireEvent.click(userCard!);

    const copyButton = screen.getByRole('button', { name: /Follow 1 Selected/i });
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
});
