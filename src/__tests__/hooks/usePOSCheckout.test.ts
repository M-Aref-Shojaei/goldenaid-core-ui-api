import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePOSCheckout } from '../../hooks/usePOSCheckout';
import { apiFetch, ApiError } from '../../api/client';
import type { CartItem } from '../../types/orders';

vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>();
  return { ...actual, apiFetch: vi.fn() };
});

const cart: CartItem[] = [
  { product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null },
];

describe('usePOSCheckout', () => {
  it('shows the receipt on success', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(result.current.showReceipt).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('surfaces an error message instead of failing silently (BUG-032)', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new ApiError(422, 'Stock reservation failed', 'ORDER_REJECTED'));
    const { result } = renderHook(() => usePOSCheckout());

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.checkout(cart, 1000);
    });

    expect(outcome).toBe(false);
    expect(result.current.showReceipt).toBe(false);
    expect(result.current.error).not.toBe('');
    await waitFor(() => expect(result.current.submitting).toBe(false));
  });

  it('clears a previous error on a new checkout attempt', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new ApiError(500, 'boom')).mockResolvedValueOnce({ order_id: 'o2' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });
    expect(result.current.error).not.toBe('');

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });
    expect(result.current.error).toBe('');
    expect(result.current.showReceipt).toBe(true);
  });
});
