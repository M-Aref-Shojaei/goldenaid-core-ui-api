import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProduct } from '../../hooks/useProduct';
import { getProduct } from '../../api/catalog';
import type { ProductDetail } from '../../types/catalog';

const addItem = vi.fn();

vi.mock('../../providers/CartProvider', () => ({
  useCart: () => ({ addItem }),
}));

vi.mock('../../api/catalog', () => ({
  getProduct: vi.fn(),
}));

const baseProduct: ProductDetail = {
  product_id: 'p1',
  title: 'Sized Product',
  subtitle: null,
  sku: null,
  base_price: 1000,
  currency: 'IRR',
  short_description: null,
  description: null,
  is_active: true,
  brand_id: null,
  category_id: null,
  thumbnail_url: null,
  variants: [
    { id: 'v1', label: 'Large', sort_order: 0 },
    { id: 'v2', label: 'Small', sort_order: 1 },
  ],
  images: [],
};

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('omits variant_id/variant_label when no variantId is given', async () => {
    vi.mocked(getProduct).mockResolvedValue(baseProduct);

    const { result } = renderHook(() => useProduct('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addToCart(2);
    });

    expect(addItem).toHaveBeenCalledTimes(1);
    const [item] = addItem.mock.calls[0];
    expect('variant_id' in item).toBe(false);
    expect('variant_label' in item).toBe(false);
  });

  it('threads variant_id/variant_label when the hook was given a variantId', async () => {
    vi.mocked(getProduct).mockResolvedValue(baseProduct);

    const { result } = renderHook(() => useProduct('p1', 'v1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addToCart(1);
    });

    const [item] = addItem.mock.calls[0];
    expect(item).toMatchObject({ variant_id: 'v1', variant_label: 'Large' });
  });
});
