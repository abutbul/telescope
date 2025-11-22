/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginButton from '../../src/components/auth/LoginButton';
import HomePage from '../../src/pages/HomePage';
import AuthCallback from '../../src/components/auth/AuthCallback';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import Layout from '../../src/components/layout/Layout';
import App from '../../src/App';
import { useAuthStore } from '../../src/stores/auth-store';
import { useUserStore } from '../../src/stores/user-store';
import { resetAuthStore, resetUserStore, sampleUser, sampleStats, createSampleRepo } from '../utils/store-helpers';

describe('Auth UI flows', () => {
  beforeEach(() => {
    resetAuthStore();
    resetUserStore();
  });

  afterEach(() => {
    window.location.hash = '';
  });

  it('starts device flow when login button is clicked', async () => {
    const startDeviceFlow = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ startDeviceFlow, isAuthenticated: false, isLoading: false });

    render(<LoginButton />);

    fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }));

    await waitFor(() => {
      expect(startDeviceFlow).toHaveBeenCalled();
    });
  });

  it('shows device instructions when verification details are available', () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      deviceCode: 'ABCD-1234',
      verificationUri: 'https://github.com/login/device',
    });

    render(<LoginButton />);

    expect(screen.getByText(/complete authentication/i)).toBeInTheDocument();
    expect(screen.getByText('https://github.com/login/device')).toBeInTheDocument();
    expect(screen.getByText('ABCD-1234')).toBeInTheDocument();
  });

  it('renders nothing when already authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true });

    const { container } = render(<LoginButton />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows login button on the home page for guests', () => {
    useAuthStore.setState({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });

  it('shows dashboard link on the home page for authenticated users', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('completes auth callback when token exists', async () => {
    const completeAuth = vi.fn();
    useAuthStore.setState({ completeAuth });
    window.location.hash = '#access_token=test-token';

    render(
      <MemoryRouter initialEntries={['/callback']}>
        <Routes>
          <Route path="/" element={<div>Home Route</div>} />
          <Route path="/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<div>Dashboard Route</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(completeAuth).toHaveBeenCalledWith('test-token');
      expect(screen.getByText('Dashboard Route')).toBeInTheDocument();
    });
  });

  it('shows error state when callback lacks token', async () => {
    window.location.hash = '';

    render(
      <MemoryRouter initialEntries={['/callback']}>
        <Routes>
          <Route path="/" element={<div>Home Route</div>} />
          <Route path="/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/authentication error/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /return home/i }));
    expect(screen.getByText('Home Route')).toBeInTheDocument();
  });

  it('redirects to home when protected route is blocked', () => {
    useAuthStore.setState({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Public Home</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Public Home')).toBeInTheDocument();
  });

  it('renders children when protected route is allowed', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Public Home</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Private Dashboard')).toBeInTheDocument();
  });

  it('shows navigation links and triggers logout inside Layout', () => {
    const logout = vi.fn();
    useAuthStore.setState({ isAuthenticated: true, logout });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /telescope/i })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(logout).toHaveBeenCalled();
  });

  it('initializes auth on app mount and renders home route', () => {
    const initAuth = vi.fn();
    useAuthStore.setState({ initAuth, isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(initAuth).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });

  it('renders dashboard route when user is authenticated', () => {
    const initAuth = vi.fn();
    useAuthStore.setState({ initAuth, isAuthenticated: true, token: 'token-123' });

    const fetchUser = vi.fn();
    const fetchRepos = vi.fn();
    const fetchStats = vi.fn();

    useUserStore.setState({
      user: sampleUser,
      repos: [
        createSampleRepo({ id: 1, name: 'alpha', updated_at: '2024-03-01T00:00:00Z' }),
        createSampleRepo({ id: 2, name: 'beta', updated_at: '2024-02-01T00:00:00Z', language: 'Go' }),
      ],
      stats: sampleStats,
      isLoading: false,
      fetchUser,
      fetchRepos,
      fetchStats,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/the octocat/i)).toBeInTheDocument();
    expect(screen.getByText('@octocat')).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith('token-123');
    expect(fetchRepos).toHaveBeenCalledWith('token-123');
    expect(fetchStats).toHaveBeenCalledWith('token-123');
  });
});
