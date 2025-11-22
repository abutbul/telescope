import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../../src/stores/auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      deviceCode: null,
      verificationUri: null,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should complete auth with token', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.completeAuth('test-token-123');
    });

    expect(result.current.token).toBe('test-token-123');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear token', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.completeAuth('test-token');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({ error: 'Test error' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
