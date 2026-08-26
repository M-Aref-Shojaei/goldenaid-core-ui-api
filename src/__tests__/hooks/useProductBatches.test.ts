import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProductBatches } from '../../hooks/useProductBatches';
import * as inventoryApi from '../../api/inventory';
import type { StockBatch } from '../../types/catalog';

const baseBatch: StockBatch = {
  id: 'b1',
  product_id: 'p1',
  variant_id: null,
  quantity: 10,
  expiry_date: '2027-01-01',
  received_at: '2026-08-01T00:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useProductBatches', () => {
  it('loads the product batches on mount', async () => {
    vi.spyOn(inventoryApi, 'adminListBatches').mockResolvedValue([baseBatch]);

    const { result } = renderHook(() => useProductBatches('p1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.batches).toEqual([baseBatch]);
  });

  it('createBatch adds the created batch to state', async () => {
    vi.spyOn(inventoryApi, 'adminListBatches').mockResolvedValue([]);
    const created: StockBatch = { ...baseBatch, id: 'b2' };
    vi.spyOn(inventoryApi, 'adminCreateBatch').mockResolvedValue(created);

    const { result } = renderHook(() => useProductBatches('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createBatch({ quantity: 10, expiry_date: '2027-01-01' });
    });

    expect(result.current.batches).toEqual([created]);
  });

  it('deleteBatch removes the batch from state', async () => {
    vi.spyOn(inventoryApi, 'adminListBatches').mockResolvedValue([baseBatch]);
    vi.spyOn(inventoryApi, 'adminDeleteBatch').mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductBatches('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteBatch('b1');
    });

    expect(result.current.batches).toEqual([]);
  });
});
