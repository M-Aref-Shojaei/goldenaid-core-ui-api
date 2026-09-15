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

describe('usePaymentResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = {};
    vi.mocked(getOrder).mockResolvedValue({
      id: 'o1',
      total_amount: 100000,
      items: [],
    } as never);
  });

  it('clears the cart only when the callback status is VERIFIED', async () => {
    params = { order_id: 'o1', status: 'VERIFIED', ref_id: '123' };

    const { result } = renderHook(() => usePaymentResult());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(clearCart).toHaveBeenCalledTimes(1);
    expect(result.current.statusType).toBe('success');
  });

  it('never clears the cart on a failed or cancelled payment', async () => {
    params = { order_id: 'o1', status: 'FAILED' };

    const { result } = renderHook(() => usePaymentResult());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(clearCart).not.toHaveBeenCalled();
    expect(result.current.statusType).toBe('failed');
  });

  it('never clears the cart on an unknown/missing status', async () => {
    params = {};

    const { result } = renderHook(() => usePaymentResult());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(clearCart).not.toHaveBeenCalled();
  });
});
