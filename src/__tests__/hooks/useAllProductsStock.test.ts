import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAllProductsStock } from '../../hooks/useAllProductsStock';
import * as inventoryApi from '../../api/inventory';
import type { StockItem } from '../../types/catalog';

const rows: StockItem[] = [
  { product_id: 'p1', variant_id: null, available_qty: 7, unit_label: 'عدد' },
  { product_id: 'p1', variant_id: 'v1', available_qty: 3, unit_label: 'عدد' },
  { product_id: 'p2', variant_id: null, available_qty: 99, unit_label: 'عدد' },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useAllProductsStock', () => {
  it('reads the whole catalogue in ONE request', async () => {
    const spy = vi
      .spyOn(inventoryApi, 'adminGetAllStockItems')
      .mockResolvedValue(rows);

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // The point of the hook: POS holds the entire catalogue, so one bulk read
    // rather than one request per product.
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('totals stock per product across its variants', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems').mockResolvedValue(rows);

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stockByProduct['p1'].total).toBe(10);
    expect(result.current.stockByProduct['p2'].total).toBe(99);
  });

  it('keeps a per-variant breakdown and omits the null-variant row from it', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems').mockResolvedValue(rows);

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stockByProduct['p1'].byVariant).toEqual({ v1: 3 });
    expect(result.current.stockByProduct['p2'].byVariant).toEqual({});
  });

  it('omits products with no stock rows, so callers can treat missing as zero', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems').mockResolvedValue(rows);

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stockByProduct['never-stocked']).toBeUndefined();
  });

  it('surfaces a fetch error and leaves the map empty', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems').mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.stockByProduct).toEqual({});
  });

  it('reload re-fetches so a just-recorded sale shows up', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems')
      .mockResolvedValueOnce(rows)
      .mockResolvedValueOnce([
        { product_id: 'p1', variant_id: null, available_qty: 1, unit_label: 'عدد' },
      ]);

    const { result } = renderHook(() => useAllProductsStock());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stockByProduct['p1'].total).toBe(10);

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.stockByProduct['p1'].total).toBe(1);
    expect(result.current.stockByProduct['p2']).toBeUndefined();
  });
});
