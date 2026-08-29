import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePOSCart } from '../../hooks/usePOSCart';
import type { ProductSummary } from '../../types/catalog';

function makeProduct(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    product_id: 'p1',
    title: 'Item',
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
    variants: [],
    ...overrides,
  };
}

describe('usePOSCart', () => {
  it('adds a new product to an empty cart with qty 1', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));

    expect(result.current.cart).toEqual([
      { product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null },
    ]);
  });

  it('increments quantity instead of duplicating when adding the same product again', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.addToCart(makeProduct()));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
  });

  it('removes the item when updateQuantity is called with 0', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.updateQuantity('p1', 0));

    expect(result.current.cart).toEqual([]);
  });

  it('removes the item when updateQuantity is called with a negative value', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.updateQuantity('p1', -1));

    expect(result.current.cart).toEqual([]);
  });

  it('updates quantity in place for a positive value', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.updateQuantity('p1', 5));

    expect(result.current.cart[0].qty).toBe(5);
  });

  it('removeFromCart drops the item regardless of quantity', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.removeFromCart('p1'));

    expect(result.current.cart).toEqual([]);
  });

  it('clearCart empties the cart', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.clearCart());

    expect(result.current.cart).toEqual([]);
  });

  it('total sums base_price * qty across distinct items', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct({ product_id: 'p1', base_price: 1000 })));
    act(() => result.current.addToCart(makeProduct({ product_id: 'p1', base_price: 1000 })));
    act(() => result.current.addToCart(makeProduct({ product_id: 'p2', base_price: 500 })));

    expect(result.current.total).toBe(2500);
  });

  it('total is 0 for an empty cart', () => {
    const { result } = renderHook(() => usePOSCart());
    expect(result.current.total).toBe(0);
  });
});
