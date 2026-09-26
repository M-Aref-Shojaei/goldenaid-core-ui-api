import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  usePurchaseList,
  usePurchaseListInvoiceOptions,
  usePurchaseListSuppliers,
} from '../../hooks/usePurchaseList';
import {
  createPurchaseItem,
  deletePurchaseItem,
  getPurchaseList,
  getPurchaseListInvoiceOptions,
  getPurchaseListSuppliers,
  transitionPurchaseItems,
  updatePurchaseItem,
} from '../../api/admin';
import type { PurchaseListItem } from '../../types/admin';

vi.mock('../../api/admin', () => ({
  getPurchaseList: vi.fn(),
  createPurchaseItem: vi.fn(),
  updatePurchaseItem: vi.fn(),
  transitionPurchaseItems: vi.fn(),
  deletePurchaseItem: vi.fn(),
  getPurchaseListSuppliers: vi.fn(),
  getPurchaseListInvoiceOptions: vi.fn(),
}));

const item = (over: Partial<PurchaseListItem> = {}): PurchaseListItem => ({
  id: 'i1',
  product_id: 'p1',
  variant_id: null,
  free_text: null,
  variety_text: null,
  quantity: 1,
  supplier_name: null,
  compare_price: true,
  winning_supplier_name: null,
  winning_unit_price: null,
  status: 'todo',
  invoice_id: null,
  invoice_number: null,
  invoice_supplier_name: null,
  invoice_date: null,
  invoice_deleted: false,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ordered_at: null,
  received_at: null,
  created_by: 'u1',
  updated_by: 'u1',
  ordered_by: null,
  received_by: null,
  product_title: 'کالا',
  variant_label: null,
  ...over,
});

describe('usePurchaseList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the list on mount', async () => {
    vi.mocked(getPurchaseList).mockResolvedValue([item()]);

    const { result } = renderHook(() => usePurchaseList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([item()]);
    expect(result.current.error).toBe('');
  });

  it('surfaces a Farsi error message and an empty list on a failed load', async () => {
    vi.mocked(getPurchaseList).mockRejectedValue({ status: 500 });

    const { result } = renderHook(() => usePurchaseList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([]);
    expect(result.current.error).not.toBe('');
  });

  it('createItem calls the API and reloads the list on success', async () => {
    vi.mocked(getPurchaseList).mockResolvedValueOnce([]).mockResolvedValueOnce([item()]);
    vi.mocked(createPurchaseItem).mockResolvedValue(item());

    const { result } = renderHook(() => usePurchaseList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = false;
    await act(async () => {
      ok = await result.current.createItem({ product_id: 'p1', quantity: 1 });
    });

    expect(ok).toBe(true);
    expect(createPurchaseItem).toHaveBeenCalledWith({ product_id: 'p1', quantity: 1 });
    expect(getPurchaseList).toHaveBeenCalledTimes(2);
    expect(result.current.items).toEqual([item()]);
  });

  it('a failed mutation sets the error and does not reload', async () => {
    vi.mocked(getPurchaseList).mockResolvedValue([]);
    vi.mocked(updatePurchaseItem).mockRejectedValue({ status: 409, code: 'PURCHASE_INVALID_TRANSITION' });

    const { result } = renderHook(() => usePurchaseList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = true;
    await act(async () => {
      ok = await result.current.updateItem('i1', { quantity: 2 });
    });

    expect(ok).toBe(false);
    expect(result.current.error).not.toBe('');
    expect(getPurchaseList).toHaveBeenCalledTimes(1);
  });

  it('transitionItems and deleteItem both go through the mutation runner', async () => {
    vi.mocked(getPurchaseList).mockResolvedValue([]);
    vi.mocked(transitionPurchaseItems).mockResolvedValue([item({ status: 'ordered' })]);
    vi.mocked(deletePurchaseItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePurchaseList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.transitionItems({ ids: ['i1'], to: 'ordered' });
    });
    expect(transitionPurchaseItems).toHaveBeenCalledWith({ ids: ['i1'], to: 'ordered' });

    await act(async () => {
      await result.current.deleteItem('i1');
    });
    expect(deletePurchaseItem).toHaveBeenCalledWith('i1');
  });
});

describe('usePurchaseListSuppliers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads supplier-name suggestions', async () => {
    vi.mocked(getPurchaseListSuppliers).mockResolvedValue(['تامین‌کننده الف']);

    const { result } = renderHook(() => usePurchaseListSuppliers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suppliers).toEqual(['تامین‌کننده الف']);
  });
});

describe('usePurchaseListInvoiceOptions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refetches when the supplier list changes', async () => {
    vi.mocked(getPurchaseListInvoiceOptions).mockResolvedValue([]);

    const { result, rerender } = renderHook(({ suppliers }) => usePurchaseListInvoiceOptions(suppliers), {
      initialProps: { suppliers: ['A'] as string[] },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getPurchaseListInvoiceOptions).toHaveBeenCalledWith(['A']);

    rerender({ suppliers: ['A', 'B'] });
    await waitFor(() => expect(getPurchaseListInvoiceOptions).toHaveBeenCalledWith(['A', 'B']));
  });
});
