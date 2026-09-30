import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

const { apiFetch } = await import('../../api/client');
const { SESSION_CONFIG } = await import('../../utils/constants');
const res = (status: number, errorCode?: string) => ({
  ok: status < 400,
  status,
  text: () => Promise.resolve(JSON.stringify({ detail: errorCode ? { error_code: errorCode, message: 'x' } : 'x' })),
});
const { apiFetchFormData } = await import('../../api/client');

describe('401 handling', () => {
  it('clears the session and resets state on a 401; parallel 401s log out once', async () => {
    const { result } = loggedIn();
    const onExpired = vi.fn();
    window.addEventListener('ga:session-expired', onExpired);
    mockFetch.mockResolvedValue(res(401, 'INVALID_TOKEN'));

    await act(async () => {
      await Promise.allSettled([apiFetch('/a'), apiFetch('/b'), apiFetch('/c')]);
    });

    window.removeEventListener('ga:session-expired', onExpired);
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(localStorage.getItem('loginTime')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('does not log out on 401 from verify-otp / request-otp', async () => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401));
    await act(async () => {
      await Promise.allSettled([apiFetch('/auth/verify-otp', { method: 'POST' }), apiFetch('/auth/request-otp')]);
    });
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('tok-123');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('does not log out on 403', async () => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(403));
    await act(async () => {
      await Promise.allSettled([apiFetch('/admin/x')]);
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('ignores a 401 for guests (no token sent)', async () => {
    const onExpired = vi.fn();
    window.addEventListener('ga:session-expired', onExpired);
    mockFetch.mockResolvedValue(res(401));
    await Promise.allSettled([apiFetch('/cart')]);
    window.removeEventListener('ga:session-expired', onExpired);
    expect(onExpired).not.toHaveBeenCalled();
  });
});

describe('401 narrowing', () => {
  it.each(['TOKEN_REVOKED', 'INVALID_TOKEN', 'MISSING_AUTH_TOKEN'])('logs out on 401 %s', async (code) => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401, code));
    await act(async () => { await Promise.allSettled([apiFetch('/x')]); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it.each([undefined, 'UPSTREAM_AUTH_FAILED'])('does not log out on 401 with code %s', async (code) => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401, code));
    await act(async () => { await Promise.allSettled([apiFetch('/admin/x')]); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('tok-123');
  });

  it('logs out on any 401 from /auth/me', async () => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401));
    await act(async () => { await Promise.allSettled([apiFetch('/auth/me')]); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('/auth/logout 401 is exempt, even with an auth code and a query string', async () => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401, 'INVALID_TOKEN'));
    await act(async () => { await Promise.allSettled([apiFetch('/auth/logout?x=1', { method: 'POST' })]); });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('apiFetchFormData: auth-coded 401 logs out, uncoded 401 does not', async () => {
    const { result } = loggedIn();
    mockFetch.mockResolvedValue(res(401));
    await act(async () => { await Promise.allSettled([apiFetchFormData('/upload', new FormData())]); });
    expect(result.current.isAuthenticated).toBe(true);
    mockFetch.mockResolvedValue(res(401, 'TOKEN_REVOKED'));
    await act(async () => { await Promise.allSettled([apiFetchFormData('/upload', new FormData())]); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('a stale 401 from an old token arriving after a new login does not log out the new session', async () => {
    const { result } = loggedIn();
    let resolveOld!: (v: unknown) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveOld = r; }));
    let pending!: Promise<unknown>;
    act(() => { pending = apiFetch('/slow').catch(() => undefined); });
    act(() => result.current.login('tok-NEW', 'u1', '09120000000'));
    await act(async () => { resolveOld(res(401, 'INVALID_TOKEN')); await pending; });
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('tok-NEW');
    expect(result.current.isAuthenticated).toBe(true);
  });
});

const jwt = (exp?: number, iat?: number) => {
  const b64u = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64u({ alg: 'HS256' })}.${b64u(exp === undefined ? { sub: 'u1' } : { sub: 'u1', exp, ...(iat ? { iat } : {}) })}.sig`;
};
const nowS = () => Math.floor(Date.now() / 1000);

describe('auto-expiry follows token exp', () => {
  beforeEach(() => { vi.useFakeTimers(); mockFetch.mockResolvedValue(res(204)); });
  afterEach(() => { vi.useRealTimers(); });

  const loginWith = (token: string) => {
    const hook = renderHook(() => useAuth(), { wrapper: AuthProvider });
    act(() => hook.result.current.login(token, 'u1', '09120000000'));
    return hook;
  };

  it('logs out ~30s before exp (not earlier), revoking with the token', async () => {
    const tok = jwt(nowS() + 3600);
    const { result } = loginWith(tok);
    await act(async () => { vi.advanceTimersByTime(3600 * 1000 - 35000); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(6000); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${tok}`);
  });

  it('is not cut off by the old fixed cap', async () => {
    const { result } = loginWith(jwt(nowS() + 24 * 3600));
    await act(async () => { vi.advanceTimersByTime(SESSION_CONFIG.EXPIRE_MS * 10); });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('re-arms across the 2^31 ms timer limit', async () => {
    const days = 40; // > 24.8 days
    const { result } = loginWith(jwt(nowS() + days * 86400));
    await act(async () => { vi.advanceTimersByTime((days * 86400 - 40) * 1000); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(15 * 1000); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('missing/invalid exp falls back to the login-time cap', async () => {
    for (const tok of ['tok-123', jwt(undefined)]) {
      localStorage.clear();
      const { result, unmount } = loginWith(tok);
      await act(async () => { vi.advanceTimersByTime(SESSION_CONFIG.EXPIRE_MS - 1000); });
      expect(result.current.isAuthenticated).toBe(true);
      await act(async () => { vi.advanceTimersByTime(2000); });
      expect(result.current.isAuthenticated).toBe(false);
      unmount();
    }
  });

  it('visibilitychange to visible logs out an already-expired token (throttled timer)', async () => {
    const { result } = loginWith(jwt(nowS() + 60));
    // clock jumps without timers firing (background throttling)
    vi.setSystemTime(Date.now() + 120 * 1000);
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('expired on load: revokes best-effort and starts logged out', async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt(nowS() - 10));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('valid token on load stays logged in', () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt(nowS() + 3600));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('client clock 5h ahead: no immediate logout, ends at login + lifetime - margin', async () => {
    const serverNow = nowS();
    vi.setSystemTime(Date.now() + 5 * 3600 * 1000); // client ahead of server
    const { result } = loginWith(jwt(serverNow + 5 * 3600, serverNow));
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(5 * 3600 * 1000 - 40 * 1000); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(15 * 1000); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('client clock behind: still logs out at login + lifetime', async () => {
    const serverNow = nowS();
    vi.setSystemTime(Date.now() - 5 * 3600 * 1000);
    const { result } = loginWith(jwt(serverNow + 3600, serverNow));
    await act(async () => { vi.advanceTimersByTime(3600 * 1000 - 40 * 1000); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(15 * 1000); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('malformed base64 payload falls back to the cap without crashing', async () => {
    const { result } = loginWith('a.!!!.c');
    await act(async () => { vi.advanceTimersByTime(SESSION_CONFIG.EXPIRE_MS - 1000); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('reload uses the stored deadline, not the token exp vs client clock', async () => {
    const serverNow = nowS();
    vi.setSystemTime(Date.now() + 5 * 3600 * 1000);
    loginWith(jwt(serverNow + 5 * 3600, serverNow)).unmount();
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider }); // "reload"
    expect(result.current.isAuthenticated).toBe(true);
    localStorage.setItem('sessionDeadline', String(Date.now() - 1));
    const again = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(again.result.current.isAuthenticated).toBe(false);
  });
});
