import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckout } from '../../hooks/useCheckout';
import { createOrder } from '../../api/orders';
import { createPayment } from '../../api/payments';
import { listAddresses } from '../../api/addresses';
import type { CartItem } from '../../types/orders';

const clearCart = vi.fn();

let items: CartItem[] = [];

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('../../providers/CartProvider', () => ({
  useCart: () => ({ items, totalPrice: 100000, clearCart }),
}));

vi.mock('../../api/addresses', () => ({
  listAddresses: vi.fn(),
}));

vi.mock('../../api/orders', () => ({
  createOrder: vi.fn(),
}));

vi.mock('../../api/payments', () => ({
  createPayment: vi.fn(),
}));

describe('useCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    items = [];
    vi.mocked(listAddresses).mockResolvedValue([
      { id: 1, title: 'Home', recipient_name: 'A', line1: 'x', city: 'y', postal_code: 'z', phone: '09120000000' },
    ] as never);
    vi.mocked(createOrder).mockResolvedValue({ order_id: 'o1', status: 'SUBMITTED' });
    vi.mocked(createPayment).mockResolvedValue({
      payment_id: 'pay1',
      payment_url: 'https://pay.example/x',
      authority: 'auth1',
    });
  });

  it('omits variant_id/variant_label entirely for a simple product', async () => {
    items = [
      { product_id: 'p1', title: 'Simple', base_price: 1000, qty: 2, thumbnail_url: null },
    ];

    const { result } = renderHook(() => useCheckout());
    await waitFor(() => expect(result.current.loadingAddresses).toBe(false));

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(createOrder).toHaveBeenCalledTimes(1);
    const [orderItems] = vi.mocked(createOrder).mock.calls[0];
    expect(orderItems[0]).toEqual({ product_id: 'p1', qty: 2 });
    expect('variant_id' in orderItems[0]).toBe(false);
    expect('variant_label' in orderItems[0]).toBe(false);
  });

  it('includes variant_id/variant_label when the cart item has them', async () => {
    items = [
      {
        product_id: 'p2',
        title: 'Sized',
        base_price: 2000,
        qty: 1,
        thumbnail_url: null,
        variant_id: 'v1',
        variant_label: 'Large',
      },
    ];

    const { result } = renderHook(() => useCheckout());
    await waitFor(() => expect(result.current.loadingAddresses).toBe(false));

    await act(async () => {
      await result.current.handleCheckout();
    });

    const [orderItems] = vi.mocked(createOrder).mock.calls[0];
    expect(orderItems[0]).toEqual({
      product_id: 'p2',
      qty: 1,
      variant_id: 'v1',
      variant_label: 'Large',
    });
  });
});
