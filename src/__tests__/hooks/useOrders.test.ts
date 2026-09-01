import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '../../hooks/useOrders';
import * as adminApi from '../../api/admin';

const order = (id: string, channel: 'pos' | 'online') => ({
  id,
  customer_id: 'c1',
  status: 'CONFIRMED',
  total_amount: 1000,
  created_at: '2026-09-01T09:00:00',
  updated_at: '2026-09-01T09:00:00',
  channel,
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useOrders', () => {
  it('unwraps the { orders, total } shape the admin endpoint actually returns', async () => {
    // Regression: this previously looked only for `items`, so it fell back to
    // [] on every call and every order vanished from the admin panel -- the
    // orders page and POS sales history both showed their empty state while
    // the API was returning data.
    vi.spyOn(adminApi, 'getAdminOrders').mockResolvedValue({
      orders: [order('o1', 'pos'), order('o2', 'online')],
      total: 2,
    } as never);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(2);
    expect(result.current.orders[0].id).toBe('o1');
  });

  it('preserves channel so POS history can filter on it', async () => {
    vi.spyOn(adminApi, 'getAdminOrders').mockResolvedValue({
      orders: [order('o1', 'pos'), order('o2', 'online')],
      total: 2,
    } as never);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders.filter((o) => o.channel === 'pos')).toHaveLength(1);
  });

  it('still accepts a bare array', async () => {
    vi.spyOn(adminApi, 'getAdminOrders').mockResolvedValue([order('o1', 'pos')] as never);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(1);
  });

  it('still accepts the paginated { items } shape', async () => {
    vi.spyOn(adminApi, 'getAdminOrders').mockResolvedValue({
      items: [order('o1', 'pos')],
    } as never);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(1);
  });

  it('returns an empty list for an unrecognised shape rather than throwing', async () => {
    vi.spyOn(adminApi, 'getAdminOrders').mockResolvedValue({ nope: true } as never);

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual([]);
  });

  it('returns an empty list when the request fails', async () => {
    vi.spyOn(adminApi, 'getAdminOrders').mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual([]);
  });
});
