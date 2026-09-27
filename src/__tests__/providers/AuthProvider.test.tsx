import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@sentry/browser', () => ({ captureException: vi.fn() }));

const { AuthProvider, useAuth } = await import('../../providers/AuthProvider');
const { STORAGE_KEYS } = await import('../../api/config');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function loggedIn() {
  const hook = renderHook(() => useAuth(), { wrapper: AuthProvider });
  act(() => hook.result.current.login('tok-123', 'u1', '09120000000'));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthProvider.logout', () => {
  it('POSTs /auth/logout with the current token, then clears the session', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, text: () => Promise.resolve('') });
    const { result } = loggedIn();

    await act(() => result.current.logout());

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/logout$/);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('still clears the session when the server call fails', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));
    const { result } = loggedIn();

    await act(() => result.current.logout());

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('makes no request when there is no token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() => result.current.logout());

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
