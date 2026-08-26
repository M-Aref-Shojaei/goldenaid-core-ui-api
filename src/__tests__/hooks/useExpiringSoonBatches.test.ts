import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExpiringSoonBatches } from '../../hooks/useExpiringSoonBatches';
import * as inventoryApi from '../../api/inventory';
import type { StockBatch } from '../../types/catalog';

const baseBatch: StockBatch = {
  id: 'b1',
  product_id: 'p1',
  variant_id: null,
  quantity: 5,
  expiry_date: '2026-09-01',
  received_at: '2026-08-01T00:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useExpiringSoonBatches', () => {
  it('loads batches expiring within the given number of days', async () => {
    const spy = vi.spyOn(inventoryApi, 'adminListExpiringSoonBatches').mockResolvedValue([baseBatch]);

    const { result } = renderHook(() => useExpiringSoonBatches(7));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(spy).toHaveBeenCalledWith(7);
    expect(result.current.batches).toEqual([baseBatch]);
  });

  it('defaults to 30 days and falls back to an empty list on failure', async () => {
    vi.spyOn(inventoryApi, 'adminListExpiringSoonBatches').mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useExpiringSoonBatches());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.batches).toEqual([]);
  });
});
