import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePOSProducts } from '../../hooks/usePOSProducts';
import { listProducts } from '../../api/catalog';

vi.mock('../../api/catalog', () => ({
  listProducts: vi.fn(),
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

    expect(listProducts).toHaveBeenCalledWith(200, 0, true);
    expect(listProducts).toHaveBeenCalledWith(200, 200, true);
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
});
