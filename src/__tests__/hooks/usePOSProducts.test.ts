import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePOSProducts } from '../../hooks/usePOSProducts';
import { adminListProducts, listProducts } from '../../api/catalog';

vi.mock('../../api/catalog', () => ({
  listProducts: vi.fn(),
  adminListProducts: vi.fn().mockResolvedValue({ total: 0, skip: 0, limit: 500, products: [] }),
}));

function product(id: string) {
  return { product_id: id, title: id, variants: [] } as never;
}

describe('usePOSProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pages through the full catalog instead of stopping at the first page', async () => {
    vi.mocked(listProducts)
      .mockResolvedValueOnce({ items: [product('p1'), product('p2')], total: 3 })
      .mockResolvedValueOnce({ items: [product('p3')], total: 3 });

    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listProducts).toHaveBeenCalledWith(200, 0, true, true);
    expect(listProducts).toHaveBeenCalledWith(200, 200, true, true);
    expect(result.current.products).toHaveLength(3);
    expect(result.current.total).toBe(3);
  });

  it('stops after a single page when everything fits', async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({ items: [product('p1')], total: 1 });

    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(result.current.total).toBe(1);
  });
});

describe('usePOSProducts search', () => {
  it('filteredProducts uses normalized multi-word AND search', async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: [{ product_id: '1', title: 'کیف چرم' }, { product_id: '2', title: 'گردنبند' }] as never,
      total: 2,
    });
    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSearchQuery('كيف چرم'));
    expect(result.current.filteredProducts.map((x) => x.product_id)).toEqual(['1']);
  });
});

describe('usePOSProducts exactMatch', () => {
  it('exposes the product whose barcode equals the search input', async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: [
        { product_id: '1', title: 'a', barcodes: ['111122223333'], variants: [] },
        { product_id: '2', title: 'b', variants: [] },
      ] as never,
      total: 2,
    });
    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exactMatch).toBeNull();
    act(() => result.current.setSearchQuery('111122223333'));
    expect(result.current.exactMatch?.product.product_id).toBe('1');
  });

  it('merges admin-only groups (loaded in the background) and filters by the group chip', async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({ items: [product('p1'), product('p2'), product('p3')], total: 3 });
    vi.mocked(adminListProducts)
      .mockResolvedValueOnce({ total: 2, skip: 0, limit: 1, products: [{ product_id: 'p1', group: 'hygiene' } as never] })
      .mockResolvedValueOnce({ total: 2, skip: 1, limit: 1, products: [{ product_id: 'p2', group: 'supplement' } as never] });

    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.groupsLoaded).toBe(true));
    expect(adminListProducts).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, is_active: true }));
    expect(result.current.products.find((p) => p.product_id === 'p1')?.group).toBe('hygiene');
    expect(result.current.products.find((p) => p.product_id === 'p3')?.group ?? null).toBeNull();

    act(() => result.current.setGroup('supplement'));
    expect(result.current.filteredProducts.map((p) => p.product_id)).toEqual(['p2']);
    act(() => result.current.setGroup(null));
    expect(result.current.filteredProducts).toHaveLength(3);
  });

  it('keeps the POS usable when the group lookup fails (groups just stay unknown)', async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({ items: [product('p1')], total: 1 });
    vi.mocked(adminListProducts).mockRejectedValueOnce(new Error('403'));
    const { result } = renderHook(() => usePOSProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.groupsError).toBe(true));
    expect(result.current.filteredProducts).toHaveLength(1);
  });
});
