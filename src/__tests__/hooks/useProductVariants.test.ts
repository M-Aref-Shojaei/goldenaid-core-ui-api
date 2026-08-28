import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProductVariants } from '../../hooks/useProductVariants';
import * as catalogApi from '../../api/catalog';
import type { ProductDetail, ProductVariant } from '../../types/catalog';

const baseProduct: ProductDetail = {
  product_id: 'p1',
  title: 'Test Product',
  subtitle: null,
  sku: null,
  base_price: 1000,
  currency: 'IRT',
  short_description: null,
  description: null,
  is_active: true,
  brand_id: null,
  category_id: null,
  thumbnail_url: null,
  variants: [{ id: 'v1', label: 'Small', sort_order: 0, attributes: { size: 'Small' }, sku: null }],
  images: [],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useProductVariants', () => {
  it('loads the product variants on mount', async () => {
    vi.spyOn(catalogApi, 'adminGetProduct').mockResolvedValue(baseProduct);

    const { result } = renderHook(() => useProductVariants('p1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.variants).toEqual([{ id: 'v1', label: 'Small', sort_order: 0, attributes: { size: 'Small' }, sku: null }]);
  });

  it('createVariant adds the created variant to state', async () => {
    vi.spyOn(catalogApi, 'adminGetProduct').mockResolvedValue(baseProduct);
    const created: ProductVariant = { id: 'v2', label: 'Large', sort_order: 1, attributes: { size: 'Large' }, sku: null };
    const createVariantSpy = vi.spyOn(catalogApi, 'adminCreateVariant').mockResolvedValue(created);

    const { result } = renderHook(() => useProductVariants('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createVariant({ size: 'Large' }, 1);
    });

    expect(createVariantSpy).toHaveBeenCalledWith('p1', { attributes: { size: 'Large' }, sort_order: 1 });
    expect(result.current.variants).toHaveLength(2);
    expect(result.current.variants).toContainEqual(created);
  });

  it('updateVariant updates the variant in state', async () => {
    vi.spyOn(catalogApi, 'adminGetProduct').mockResolvedValue(baseProduct);
    const updated: ProductVariant = { id: 'v1', label: 'Small', sort_order: 2, attributes: { size: 'Small' }, sku: null };
    const updateVariantSpy = vi.spyOn(catalogApi, 'adminUpdateVariant').mockResolvedValue(updated);

    const { result } = renderHook(() => useProductVariants('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateVariant('v1', { sort_order: 2 });
    });

    expect(updateVariantSpy).toHaveBeenCalledWith('p1', 'v1', { sort_order: 2 });
    expect(result.current.variants).toHaveLength(1);
    expect(result.current.variants[0]).toEqual(updated);
  });

  it('deleteVariant removes the variant from state', async () => {
    vi.spyOn(catalogApi, 'adminGetProduct').mockResolvedValue(baseProduct);
    vi.spyOn(catalogApi, 'adminDeleteVariant').mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductVariants('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteVariant('v1');
    });

    expect(result.current.variants).toEqual([]);
  });
});
