import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAllProductsStock } from '../../hooks/useAllProductsStock';
import * as inventoryApi from '../../api/inventory';
import type { StockItem } from '../../types/catalog';

const rows: StockItem[] = [
  {
    product_id: 'p1',
    variant_id: null,
    available_qty: 7,
    unit_label: 'عدد',
    online_allocated_qty: null,
    effective_online_qty: 6,
  },
  {
    product_id: 'p1',
    variant_id: 'v1',
    available_qty: 3,
    unit_label: 'عدد',
    online_allocated_qty: 2,
    effective_online_qty: 2,
  },
  {
    product_id: 'p2',
    variant_id: null,
    available_qty: 99,
    unit_label: 'عدد',
    online_allocated_qty: null,
    effective_online_qty: 79,
  },
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

  it('carries the online-allocation fields through, keyed the same way as byVariant', async () => {
    vi.spyOn(inventoryApi, 'adminGetAllStockItems').mockResolvedValue(rows);

    const { result } = renderHook(() => useAllProductsStock());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // p1's own (no-variant) row.
    expect(result.current.stockByProduct['p1'].onlineAllocatedQty).toBeNull();
    expect(result.current.stockByProduct['p1'].effectiveOnlineQty).toBe(6);
    // p1's variant row.
    expect(result.current.stockByProduct['p1'].onlineAllocatedQtyByVariant).toEqual({ v1: 2 });
    expect(result.current.stockByProduct['p1'].effectiveOnlineQtyByVariant).toEqual({ v1: 2 });
    // p2 has no variants at all.
    expect(result.current.stockByProduct['p2'].onlineAllocatedQty).toBeNull();
    expect(result.current.stockByProduct['p2'].effectiveOnlineQty).toBe(79);
    expect(result.current.stockByProduct['p2'].onlineAllocatedQtyByVariant).toEqual({});
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
        {
          product_id: 'p1',
          variant_id: null,
          available_qty: 1,
          unit_label: 'عدد',
          online_allocated_qty: null,
          effective_online_qty: 1,
        },
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
