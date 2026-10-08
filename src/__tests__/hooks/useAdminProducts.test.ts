import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { adminListProducts } from '../../api/catalog';

vi.mock('../../api/catalog', () => ({
  adminListProducts: vi.fn(),
}));

describe('useAdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the server-reported total alongside the fetched page', async () => {
    vi.mocked(adminListProducts).mockResolvedValue({
      total: 1203,
      skip: 0,
      limit: 40,
      products: [{ product_id: 'p1', title: 'A', variants: [] } as never],
    });

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(1203);
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);
  });

  it('resets total to 0 on a failed fetch', async () => {
    vi.mocked(adminListProducts).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(0);
    expect(result.current.filteredProducts).toHaveLength(0);
  });

  it('searches the server (debounced) and resets back to the first page instead of filtering only what is already loaded', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(adminListProducts)
      .mockResolvedValueOnce({ total: 1203, skip: 0, limit: 40, products: [] })
      .mockResolvedValueOnce({
        total: 1,
        skip: 0,
        limit: 40,
        products: [{ product_id: 'p600', title: 'Product Beyond First Page', variants: [] } as never],
      });

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(adminListProducts).toHaveBeenCalledWith({ skip: 0, limit: 40, search: undefined });

    act(() => result.current.setSearchQuery('Product Beyond First Page'));
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(adminListProducts).toHaveBeenLastCalledWith({
      skip: 0,
      limit: 40,
      search: 'Product Beyond First Page',
    });
    await waitFor(() => expect(result.current.filteredProducts).toHaveLength(1));
    vi.useRealTimers();
  });

  it('loadMore appends the next page instead of replacing what is loaded', async () => {
    vi.mocked(adminListProducts)
      .mockResolvedValueOnce({
        total: 3,
        skip: 0,
        limit: 40,
        products: [{ product_id: 'p1', title: 'A', variants: [] } as never],
      })
      .mockResolvedValueOnce({
        total: 3,
        skip: 1,
        limit: 40,
        products: [{ product_id: 'p2', title: 'B', variants: [] } as never],
      });

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.loadingMore).toBe(false));

    expect(adminListProducts).toHaveBeenLastCalledWith({ skip: 1, limit: 40, search: undefined });
    expect(result.current.filteredProducts.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('loadMore does nothing once every product has been loaded', async () => {
    vi.mocked(adminListProducts).mockResolvedValue({
      total: 1,
      skip: 0,
      limit: 40,
      products: [{ product_id: 'p1', title: 'A', variants: [] } as never],
    });

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(false);

    act(() => result.current.loadMore());

    expect(adminListProducts).toHaveBeenCalledTimes(1);
  });

  it('filters by group and status tab server-side, immediately, and exposes status counts', async () => {
    vi.mocked(adminListProducts).mockResolvedValue({
      total: 1,
      skip: 0,
      limit: 40,
      products: [{ product_id: 'p1', title: 'A', variants: [], group: 'supplement', pending_invoice: true, incomplete: true, missing: ['image'], created_from_invoice_id: 'inv' } as never],
      status_counts: { all: 9, active: 5, hidden: 4, incomplete: 3, imported: 2 },
    });

    const { result } = renderHook(() => useAdminProducts(true, { withCounts: true, initialStatus: 'active' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(adminListProducts).toHaveBeenLastCalledWith({ skip: 0, limit: 40, search: undefined, group: undefined, status: 'active', counts: true });
    expect(result.current.statusCounts).toEqual({ all: 9, active: 5, hidden: 4, incomplete: 3, imported: 2 });
    const row = result.current.filteredProducts[0];
    expect(row.group).toBe('supplement');
    expect(row.pending_invoice).toBe(true);
    expect(row.incomplete).toBe(true);
    expect(row.missing).toEqual(['image']);
    expect(row.created_from_invoice_id).toBe('inv');

    act(() => result.current.setGroup('hygiene'));
    await waitFor(() => expect(adminListProducts).toHaveBeenLastCalledWith(expect.objectContaining({ group: 'hygiene', status: 'active', skip: 0 })));
    act(() => result.current.setStatus('incomplete'));
    await waitFor(() => expect(adminListProducts).toHaveBeenLastCalledWith(expect.objectContaining({ group: 'hygiene', status: 'incomplete' })));
  });
});
