import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaymentResult } from '../../hooks/usePaymentResult';
import { getOrder } from '../../api/orders';

const push = vi.fn();
const clearCart = vi.fn();
let params: Record<string, string> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => ({ get: (key: string) => params[key] ?? null }),
}));

vi.mock('../../providers/CartProvider', () => ({
  useCart: () => ({ clearCart }),
}));

vi.mock('../../api/orders', () => ({
  getOrder: vi.fn(),
}));

function orderWith(status: string) {
  vi.mocked(getOrder).mockResolvedValue({
    id: 'o1',
    status,
    total_amount: 100000,
    items: [],
  } as never);
}

async function render() {
  const hook = renderHook(() => usePaymentResult());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook.result.current;
}

describe('usePaymentResult (order is the source of truth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = {};
  });

  it('shows success and clears the cart when the order is CONFIRMED', async () => {
    params = { order_id: 'o1', status: 'VERIFIED', ref_id: '123' };
    orderWith('CONFIRMED');

    const result = await render();

    expect(result.statusType).toBe('success');
    expect(clearCart).toHaveBeenCalledTimes(1);
  });

  it('a forged ?status=VERIFIED on an unpaid order is not success and keeps the cart', async () => {
    params = { order_id: 'o1', status: 'VERIFIED' };
    orderWith('AWAITING_PAYMENT');

    const result = await render();

    expect(result.statusType).toBe('unknown');
    expect(clearCart).not.toHaveBeenCalled();
  });

  it('a failed attempt on a still-payable order is failed (order can be paid again)', async () => {
    params = { order_id: 'o1', status: 'FAILED' };
    orderWith('AWAITING_PAYMENT');

    const result = await render();

    expect(result.statusType).toBe('failed');
    expect(clearCart).not.toHaveBeenCalled();
  });

  it.each(['PENDING', 'ERROR'])('hint %s on a payable order means still checking', async (hint) => {
    params = { order_id: 'o1', status: hint };
    orderWith('AWAITING_PAYMENT');

    expect((await render()).statusType).toBe('unknown');
  });

  it('a later-confirmed order wins over a FAILED hint', async () => {
    params = { order_id: 'o1', status: 'FAILED' };
    orderWith('CONFIRMED');

    const result = await render();

    expect(result.statusType).toBe('success');
    expect(clearCart).toHaveBeenCalledTimes(1);
  });

  it('an expired order (PAYMENT_FAILED) is failed', async () => {
    params = { order_id: 'o1', status: 'PENDING' };
    orderWith('PAYMENT_FAILED');

    expect((await render()).statusType).toBe('failed');
  });

  it('when the order cannot be loaded, VERIFIED is never trusted', async () => {
    params = { order_id: 'o1', status: 'VERIFIED' };
    vi.mocked(getOrder).mockRejectedValue(new Error('401'));

    const result = await render();

    expect(result.statusType).toBe('unknown');
    expect(clearCart).not.toHaveBeenCalled();
  });

  it('never clears the cart on an unknown/missing status', async () => {
    params = {};

    const result = await render();

    expect(result.statusType).toBe('unknown');
    expect(clearCart).not.toHaveBeenCalled();
  });
});
