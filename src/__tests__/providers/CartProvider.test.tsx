import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../providers/CartProvider';

const product = {
  product_id: 'p1',
  title: 'کفش چرمی',
  base_price: 1_200_000,
  thumbnail_url: null,
};

beforeEach(() => {
  localStorage.clear();
});

describe('CartProvider', () => {
  it('adds a new product with the given quantity, not a hardcoded 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => result.current.addItem(product, 3));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].qty).toBe(3);
  });

  it('increments an existing line by the given quantity, not a hardcoded +1', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => result.current.addItem(product, 3));
    act(() => result.current.addItem(product, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].qty).toBe(5);
  });
});
