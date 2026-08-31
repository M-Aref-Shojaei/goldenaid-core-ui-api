import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProductStock } from '../../hooks/useProductStock';
import * as inventoryApi from '../../api/inventory';
import type { StockItem } from '../../types/catalog';

const baseItem: StockItem = {
  product_id: 'p1',
  variant_id: null,
  available_qty: 12,
  unit_label: 'عدد',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useProductStock', () => {
  it('loads current stock items on mount', async () => {
    vi.spyOn(inventoryApi, 'adminGetStockItems').mockResolvedValue([baseItem]);

    const { result } = renderHook(() => useProductStock('p1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([baseItem]);
  });

  it('reload re-fetches so a caller can pick up a just-recorded sale/restock', async () => {
    vi.spyOn(inventoryApi, 'adminGetStockItems')
      .mockResolvedValueOnce([baseItem])
      .mockResolvedValueOnce([{ ...baseItem, available_qty: 5 }]);

    const { result } = renderHook(() => useProductStock('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items[0].available_qty).toBe(12);

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.items[0].available_qty).toBe(5);
  });

  it('surfaces a fetch error', async () => {
    vi.spyOn(inventoryApi, 'adminGetStockItems').mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useProductStock('p1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.items).toEqual([]);
  });
});
