import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBackendHealth } from '../../hooks/useBackendHealth';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useBackendHealth', () => {
  it('starts up (not down) while the first check is pending', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBackendHealth('/health', { intervalMs: 1000 }));

    expect(result.current.isDown).toBe(false);
  });

  it('does not flag down on a single transient failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useBackendHealth('/health', { intervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isDown).toBe(false);
  });

  it('flags down after two consecutive failed checks', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useBackendHealth('/health', { intervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0); // check 1: fails
      await vi.advanceTimersByTimeAsync(1000); // check 2: fails
    });

    expect(result.current.isDown).toBe(true);
  });

  it('recovers as soon as a check succeeds again', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useBackendHealth('/health', { intervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.isDown).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.isDown).toBe(false);
  });

  it('treats a network error the same as a non-ok response', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useBackendHealth('/health', { intervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.isDown).toBe(true);
  });
});
