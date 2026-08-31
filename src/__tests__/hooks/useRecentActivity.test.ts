import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>();
  return { ...actual, apiFetch: vi.fn() };
});

describe('useRecentActivity', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('fetches /admin/activity/recent and returns the parsed items', async () => {
    const items = [
      { type: 'product_updated', id: 'p1', title: 'Product 1', timestamp: '2026-08-30T00:00:00Z' },
      { type: 'order_created', id: 'o1', title: 'Order 1', timestamp: '2026-08-30T00:01:00Z' },
    ];
    vi.mocked(apiFetch).mockResolvedValue({ items });
    const { result } = renderHook(() => useRecentActivity());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiFetch).toHaveBeenCalledWith('/admin/activity/recent?limit=10');
    expect(result.current.items).toEqual(items);
    expect(result.current.error).toBe('');
  });

  it('surfaces a Farsi error message on failure', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useRecentActivity());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBe('');
    expect(result.current.items).toEqual([]);
  });

  it('reload() re-fetches', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useRecentActivity());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(apiFetch).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2));
  });
});
