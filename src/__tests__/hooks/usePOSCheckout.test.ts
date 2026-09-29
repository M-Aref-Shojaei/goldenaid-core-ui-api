import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePOSCheckout } from '../../hooks/usePOSCheckout';
import { apiFetch, ApiError } from '../../api/client';
import type { CartItem } from '../../types/orders';

vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>();
  return { ...actual, apiFetch: vi.fn() };
});

const toast = vi.fn();
vi.mock('../../components/Toast', () => ({ useToast: () => ({ toast }) }));

const cart: CartItem[] = [
  { product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null },
];

describe('usePOSCheckout', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    toast.mockReset();
  });

  it('shows a success toast on a successful checkout', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(toast).toHaveBeenCalledWith('فروش با موفقیت ثبت شد', 'success');
  });

  it('exposes the server-computed cash_tendered/change_due on the receipt (TASK-335)', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1', cash_tendered: 1500, change_due: 500 });
    const { result } = renderHook(() => usePOSCheckout());

    act(() => {
      result.current.setPaymentMethod('cash');
      result.current.setAmountPaid('1500');
    });

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(result.current.lastOrder?.cashTendered).toBe(1500);
    expect(result.current.lastOrder?.changeDue).toBe(500);
  });

  it('leaves cashTendered/changeDue undefined when the server omits them (older core-bff)', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(result.current.lastOrder?.cashTendered).toBeUndefined();
    expect(result.current.lastOrder?.changeDue).toBeUndefined();
  });

  it('shows the receipt on success', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(result.current.showReceipt).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('sends the correct request payload shape', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    act(() => {
      result.current.setCustomer({ name: 'Ali', phone: '0912', email: 'a@b.com' });
      result.current.setPaymentMethod('cash');
      result.current.setAmountPaid('1500');
    });

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(apiFetch).toHaveBeenCalledWith('/admin/pos/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'Ali',
        customer_phone: '0912',
        customer_email: 'a@b.com',
        items: [{ product_id: 'p1', quantity: 1, unit_price: 1000, is_gift: false }],
        payment_method: 'cash',
        amount_paid: 1500,
        notes: 'فروش حضوری - POS',
        total_amount: 1000,
        discount: null,
      }),
    });
  });

  it('uses total_amount as amount_paid for non-cash payment methods', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    act(() => {
      result.current.setPaymentMethod('card');
    });

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]?.body as string);
    expect(body.payment_method).toBe('card');
    expect(body.amount_paid).toBe(1000);
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

  it('short-circuits on an empty cart without calling the API', async () => {
    const { result } = renderHook(() => usePOSCheckout());

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.checkout([], 0);
    });

    expect(outcome).toBe(false);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('sends variant_id and variant_label for a cart line with a selected variant', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());
    const variantCart: CartItem[] = [
      { product_id: 'p1', title: 'Item', base_price: 1000, qty: 1, thumbnail_url: null, variant_id: 'v1', variant_label: 'L' },
    ];

    await act(async () => {
      await result.current.checkout(variantCart, 1000);
    });

    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]?.body as string);
    expect(body.items).toEqual([
      { product_id: 'p1', quantity: 1, unit_price: 1000, variant_id: 'v1', variant_label: 'L', is_gift: false },
    ]);
  });

  it('omits variant_id and variant_label for a cart line with no variant', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]?.body as string);
    expect(body.items[0]).not.toHaveProperty('variant_id');
    expect(body.items[0]).not.toHaveProperty('variant_label');
  });

  it('sends gift lines with is_gift and unit_price 0, and the discount', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ order_id: 'o1' });
    const { result } = renderHook(() => usePOSCheckout());
    const giftCart: CartItem[] = [
      ...cart,
      // unit_price must be 0 even if a stale base_price rode along
      { product_id: 'p2', title: 'Gift', base_price: 700, qty: 2, thumbnail_url: null, is_gift: true },
    ];

    await act(async () => {
      await result.current.checkout(giftCart, 875, { type: 'percent', value: 12.5 });
    });

    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]?.body as string);
    expect(body.items).toEqual([
      { product_id: 'p1', quantity: 1, unit_price: 1000, is_gift: false },
      { product_id: 'p2', quantity: 2, unit_price: 0, is_gift: true },
    ]);
    expect(body.discount).toEqual({ type: 'percent', value: 12.5 });
    expect(body.total_amount).toBe(875);
  });

  it('stores the server order verbatim on the receipt', async () => {
    const serverOrder = {
      order_id: 'o1', id: 'o1', status: 'CONFIRMED', total_amount: 875, subtotal_amount: 1000,
      discount: { type: 'percent', value: 12.5, amount: 125, given_by: 'u1', given_by_name: 'Admin', source: null },
      items: [], cash_tendered: 1000, change_due: 125,
    };
    vi.mocked(apiFetch).mockResolvedValue(serverOrder);
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 875, { type: 'percent', value: 12.5 });
    });

    expect(result.current.lastOrder?.order).toEqual(serverOrder);
    expect(result.current.lastOrder?.changeDue).toBe(125);
  });

  it('shows a generic Farsi error for a non-ApiError failure (e.g. network error)', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => usePOSCheckout());

    await act(async () => {
      await result.current.checkout(cart, 1000);
    });

    expect(result.current.error).toBe('خطا در ثبت فروش. دوباره تلاش کنید');
    expect(result.current.showReceipt).toBe(false);
  });

  it('documents current behavior for a double-submit while a request is in flight', async () => {
    let resolveFirst: (value: { order_id: string }) => void;
    const firstCall = new Promise<{ order_id: string }>((resolve) => {
      resolveFirst = resolve;
    });
    vi.mocked(apiFetch).mockReturnValueOnce(firstCall).mockResolvedValueOnce({ order_id: 'o2' });
    const { result } = renderHook(() => usePOSCheckout());

    let firstOutcome: Promise<boolean>;
    let secondOutcome: Promise<boolean>;
    act(() => {
      firstOutcome = result.current.checkout(cart, 1000);
      secondOutcome = result.current.checkout(cart, 1000);
    });

    await act(async () => {
      resolveFirst({ order_id: 'o1' });
      await Promise.all([firstOutcome, secondOutcome]);
    });

    // No in-flight guard exists today: both calls reach apiFetch.
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });
});
