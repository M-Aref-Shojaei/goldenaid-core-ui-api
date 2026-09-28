import { describe, expect, it } from 'vitest';
import { computeDiscount, priceBand } from '../../utils/pricing';

const STEP = 10000;

describe('priceBand', () => {
  it.each([
    // Design worked example: 123,400 x 1.30 = 160,420 -> 160,000..170,000.
    [123400, 30, 160420, 160000, 170000],
    // Exact multiple: floor == ceil.
    [100000, 30, 130000, 130000, 130000],
    [0, 30, 0, 0, 0],
    // Step edges: one toman either side of a multiple.
    [10000, 0, 10000, 10000, 10000],
    [10001, 0, 10001, 10000, 20000],
    [9999, 0, 9999, 0, 10000],
    [1, 30, 1, 0, 10000],
    // Half-up rounding: 5 x 1.3 = 6.5 -> 7; 15 x 1.1 = 16.5 -> 17.
    [5, 30, 7, 0, 10000],
    [15, 10, 17, 0, 10000],
    [100000, 500, 600000, 600000, 600000],
  ])('unitCost=%i markup=%i -> computed=%i floor=%i ceil=%i', (unitCost, markup, computed, floor, ceil) => {
    expect(priceBand(unitCost, markup, STEP)).toEqual({ computed, floor, ceil });
  });
});

describe('computeDiscount', () => {
  it('treats an empty value as no discount', () => {
    expect(computeDiscount(1000, 'amount', '')).toEqual({ amount: 0, error: null });
  });

  it('treats a zero value as no discount', () => {
    expect(computeDiscount(1000, 'percent', 0)).toEqual({ amount: 0, error: null });
  });

  it('rejects a negative value', () => {
    expect(computeDiscount(1000, 'amount', -5)).toEqual({
      amount: 0,
      error: 'مقدار تخفیف نمی‌تواند منفی باشد.',
    });
  });

  it('rejects a percent over 100', () => {
    expect(computeDiscount(1000, 'percent', 101)).toEqual({
      amount: 0,
      error: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.',
    });
  });

  it('rounds a percent discount half-up', () => {
    // 1000 * 16.5 / 100 = 165 exactly; use a case that lands on .5.
    expect(computeDiscount(101, 'percent', 50)).toEqual({ amount: 51, error: null });
  });

  // Regression: a plain `Number` multiply (`subtotal * n / 100`) lands one
  // unit off of these exact `x.5` boundaries due to float rounding, while
  // the server's Decimal `ROUND_HALF_UP` doesn't. Exact basis-point integer
  // math must match `goldenaid-sales` `tests/test_discount.py` on every case here.
  it.each([
    // subtotal * n / 100 = 161.5 -> half-up 162 (was 161 under float math).
    [250, 'percent' as const, 64.6, 162],
    // 375 * 9.2 / 100 = 34.5 -> half-up 35 (was 34 under float math).
    [375, 'percent' as const, 9.2, 35],
    // Shared with goldenaid-sales test_discount.py (Q10 precision cases).
    [1004, 'percent' as const, 12.5, 126], // 125.5 -> 126
    [1003, 'percent' as const, 12.5, 125], // 125.375 -> 125
    [10000, 'percent' as const, '0.05', 5],
    [1000, 'percent' as const, 100, 1000],
    // Small subtotals, still exact.
    [1, 'percent' as const, 50, 1], // 0.5 -> half-up 1
    [3, 'percent' as const, 50, 2], // 1.5 -> half-up 2
    // Two-decimal-place percent edge case.
    [333333, 'percent' as const, 12.5, 41667], // 41666.625 -> 41667
    [100000, 'percent' as const, 0.01, 10],
  ])('subtotal=%s type=%s value=%s -> amount=%s', (subtotal, type, value, expected) => {
    expect(computeDiscount(subtotal, type, value)).toEqual({ amount: expected, error: null });
  });

  it('rejects an amount over the subtotal', () => {
    expect(computeDiscount(1000, 'amount', 1001)).toEqual({
      amount: 0,
      error: 'مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.',
    });
  });

  it('accepts an amount equal to the subtotal (total becomes 0)', () => {
    expect(computeDiscount(1000, 'amount', 1000)).toEqual({ amount: 1000, error: null });
  });

  it('accepts a string value from an input field', () => {
    expect(computeDiscount(1000, 'amount', '250')).toEqual({ amount: 250, error: null });
  });

  it('rejects an amount with a fractional value (Q10 / DISCOUNT_INVALID)', () => {
    expect(computeDiscount(1000, 'amount', 12.5)).toEqual({
      amount: 0,
      error: 'مبلغ تخفیف باید عدد صحیح باشد.',
    });
  });

  it('rejects a percent with more than 2 decimal places (Q10 / DISCOUNT_INVALID)', () => {
    expect(computeDiscount(1000, 'percent', '12.345')).toEqual({
      amount: 0,
      error: 'درصد تخفیف حداکثر تا دو رقم اعشار مجاز است.',
    });
  });

  it('parses scientific notation the same as the server (Decimal("1e3") over 100%)', () => {
    expect(computeDiscount(1000, 'percent', '1e3')).toEqual({
      amount: 0,
      error: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.',
    });
  });

  it('parses scientific notation as an integer amount', () => {
    expect(computeDiscount(2000, 'amount', '1e3')).toEqual({ amount: 1000, error: null });
  });

  it('computes a large-subtotal percent discount without float or overflow error', () => {
    expect(computeDiscount(999999999, 'percent', 99.99)).toEqual({ amount: 999899999, error: null });
  });
});
