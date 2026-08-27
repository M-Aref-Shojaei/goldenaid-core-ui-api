import { renderHook, waitFor } from '@testing-library/react';
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
      limit: 500,
      products: [{ product_id: 'p1', title: 'A', variants: [] } as never],
    });

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(1203);
    expect(result.current.filteredProducts).toHaveLength(1);
  });

  it('resets total to 0 on a failed fetch', async () => {
    vi.mocked(adminListProducts).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useAdminProducts(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.total).toBe(0);
    expect(result.current.filteredProducts).toHaveLength(0);
  });
});
