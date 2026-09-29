import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePOSCart } from '../../hooks/usePOSCart';
import type { ProductSummary, ProductVariant, StockBatch } from '../../types/catalog';
import type { CartItem } from '../../types/orders';

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return { id: 'v1', label: 'L', sort_order: 0, attributes: { size: 'L' }, sku: null, ...overrides };
}

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
      { key: 'p1--', product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null },
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
    act(() => result.current.updateQuantity('p1--', 0));

    expect(result.current.cart).toEqual([]);
  });

  it('removes the item when updateQuantity is called with a negative value', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.updateQuantity('p1--', -1));

    expect(result.current.cart).toEqual([]);
  });

  it('updates quantity in place for a positive value', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.updateQuantity('p1--', 5));

    expect(result.current.cart[0].qty).toBe(5);
  });

  it('removeFromCart drops the item regardless of quantity', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.removeFromCart('p1--'));

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

  it('carries variant_id and variant_label when adding a product with a selected variant', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct(), makeVariant({ id: 'v1', label: 'L' })));

    expect(result.current.cart).toEqual([
      { key: 'p1-v1-', product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null, variant_id: 'v1', variant_label: 'L' },
    ]);
  });

  it('keeps different variants of the same product as separate cart lines', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct(), makeVariant({ id: 'v1', label: 'L' })));
    act(() => result.current.addToCart(makeProduct(), makeVariant({ id: 'v2', label: 'XL' })));

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.cart.map((i) => i.variant_id)).toEqual(['v1', 'v2']);
  });

  it('increments qty instead of duplicating when the same variant is added again', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct(), makeVariant({ id: 'v1' })));
    act(() => result.current.addToCart(makeProduct(), makeVariant({ id: 'v1' })));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
  });

  it('seeds the cart from initialItems with derived keys (edit POS sale flow)', () => {
    const seeded: CartItem[] = [
      { product_id: 'p1', title: 'Item', base_price: 1000, qty: 3, thumbnail_url: null },
      { product_id: 'p1', title: 'Item', base_price: 0, qty: 1, thumbnail_url: null, is_gift: true },
    ];
    const { result } = renderHook(() => usePOSCart(seeded));

    expect(result.current.cart.map((i) => i.key)).toEqual(['p1--', 'gift-p1--']);
    expect(result.current.total).toBe(3000);
  });

  it('keeps a gift and a paid line of the same product separate', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.addToCart(makeProduct(), undefined, undefined, { gift: true }));
    act(() => result.current.addToCart(makeProduct(), undefined, undefined, { gift: true }));

    expect(result.current.cart).toEqual([
      expect.objectContaining({ key: 'p1--', base_price: 1000, qty: 1 }),
      expect.objectContaining({ key: 'gift-p1--', base_price: 0, qty: 2, is_gift: true }),
    ]);
    expect(result.current.cart[0]).not.toHaveProperty('is_gift');
  });

  it('updates and removes by line key, leaving the other line of the product alone', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.addToCart(makeProduct(), undefined, undefined, { gift: true }));
    act(() => result.current.updateQuantity('gift-p1--', 4));
    expect(result.current.cart.map((i) => i.qty)).toEqual([1, 4]);

    act(() => result.current.removeFromCart('p1--'));
    expect(result.current.cart.map((i) => i.key)).toEqual(['gift-p1--']);
  });

  it('total excludes gift lines', () => {
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct({ base_price: 1000 })));
    act(() => result.current.addToCart(makeProduct({ product_id: 'p2', base_price: 700 }), undefined, undefined, { gift: true }));

    expect(result.current.total).toBe(1000);
  });

  it('keeps two FEFO batches of the same product as separate lines, each updatable on its own', () => {
    const batch = (id: string) => ({ id, expiry_date: '2027-01-01' }) as StockBatch;
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct(), undefined, batch('b1')));
    act(() => result.current.addToCart(makeProduct(), undefined, batch('b2')));
    act(() => result.current.updateQuantity('p1--b2', 3));

    expect(result.current.cart.map((i) => [i.key, i.qty])).toEqual([['p1--b1', 1], ['p1--b2', 3]]);
  });

  it('warns in dev (instead of silently no-oping) when called with a product_id, not a line key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => usePOSCart());

    act(() => result.current.addToCart(makeProduct()));
    act(() => result.current.removeFromCart('p1'));

    expect(result.current.cart).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('CartItem.key'));
    warn.mockRestore();
  });
});
