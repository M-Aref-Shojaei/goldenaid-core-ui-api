import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductNameCheck } from '../../hooks/useProductNameCheck';
import { adminCheckProductName } from '../../api/catalog';

vi.mock('../../api/catalog', () => ({ adminCheckProductName: vi.fn() }));

const match = (id: string, title: string) => ({ product_id: id, title, sku: null, group: null, base_price: 1, pending_invoice: false, is_active: true, thumbnail_url: null });

describe('useProductNameCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('checks the name 400ms after typing stops, not on every keystroke', async () => {
    vi.mocked(adminCheckProductName).mockResolvedValue({ duplicate: true, matches: [match('p1', 'کرم')] });
    const { result, rerender } = renderHook(({ t }) => useProductNameCheck(t), { initialProps: { t: 'کر' } });
    rerender({ t: 'کرم' });
    await act(() => vi.advanceTimersByTimeAsync(399));
    expect(adminCheckProductName).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(adminCheckProductName).toHaveBeenCalledTimes(1);
    expect(adminCheckProductName).toHaveBeenCalledWith('کرم', undefined);
    expect(result.current.matches).toHaveLength(1);
  });

  it('never calls the server for a blank name and clears matches', async () => {
    vi.mocked(adminCheckProductName).mockResolvedValue({ duplicate: true, matches: [match('p1', 'a')] });
    const { result, rerender } = renderHook(({ t }) => useProductNameCheck(t), { initialProps: { t: 'a' } });
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(result.current.matches).toHaveLength(1);
    rerender({ t: '   ' });
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(adminCheckProductName).toHaveBeenCalledTimes(1);
    expect(result.current.matches).toEqual([]);
  });

  it('ignores a slow response for a name the admin already changed', async () => {
    let resolveOld: (v: unknown) => void = () => {};
    vi.mocked(adminCheckProductName)
      .mockImplementationOnce(() => new Promise((r) => { resolveOld = r as never; }))
      .mockResolvedValueOnce({ duplicate: false, matches: [] });
    const { result, rerender } = renderHook(({ t }) => useProductNameCheck(t), { initialProps: { t: 'old' } });
    await act(() => vi.advanceTimersByTimeAsync(400));
    rerender({ t: 'new' });
    await act(() => vi.advanceTimersByTimeAsync(400));
    await act(async () => { resolveOld({ duplicate: true, matches: [match('p1', 'old')] }); });
    expect(result.current.matches).toEqual([]);
  });

  it('check() runs immediately (on save) and returns the matches', async () => {
    vi.mocked(adminCheckProductName).mockResolvedValue({ duplicate: true, matches: [match('p2', 'x')] });
    const { result } = renderHook(() => useProductNameCheck('x', { excludeId: 'p9' }));
    let got: unknown[] = [];
    await act(async () => { got = await result.current.check('x'); });
    expect(got).toHaveLength(1);
    expect(adminCheckProductName).toHaveBeenCalledWith('x', 'p9');
    expect(result.current.matches).toHaveLength(1);
  });

  it('fails open: a failed check shows no duplicate (the server repeats it on create)', async () => {
    vi.mocked(adminCheckProductName).mockRejectedValue(new Error('down'));
    const { result } = renderHook(() => useProductNameCheck('x'));
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(result.current.matches).toEqual([]);
    let got: unknown[] = ['sentinel'];
    await act(async () => { got = await result.current.check('x'); });
    expect(got).toEqual([]);
  });
});
