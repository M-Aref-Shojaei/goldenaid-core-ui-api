/**
 * Client-side ports of the server pricing/discount math (TASK-332/333).
 * The server is the authority (`goldenaid-catalog` `app/logic/pricing.py`
 * for `priceBand`, `goldenaid-sales` `app/discount.py` for `computeDiscount`,
 * itself a port of the design prototype's `AdminPos.jsx`); these exist only
 * for instant UI feedback (price-band hints, POS discount preview) before submit.
 */

/** The allowed sell-price range for one buy price at a given markup. */
export interface PriceBand {
  computed: number;
  floor: number;
  ceil: number;
}

/**
 * Returns the sell-price band for `unitCost` at `markupPercent`, rounded to
 * a multiple of `step` (10,000 toman in production). `computed` rounds
 * half-up; an exact multiple of `step` gives `floor === ceil`. Faithful
 * port of `goldenaid-catalog`'s `price_band`.
 */
export function priceBand(unitCost: number, markupPercent: number, step: number): PriceBand {
  const computed = Math.floor((unitCost * (100 + markupPercent) + 50) / 100);
  return {
    computed,
    floor: Math.floor(computed / step) * step,
    ceil: Math.ceil(computed / step) * step,
  };
}

/** Result of computing a POS discount: the resolved amount, or a Persian error message. */
export interface DiscountResult {
  amount: number;
  error: string | null;
}

/**
 * Computes a POS discount amount from `subtotal` and a type/value pair.
 * Faithful port of the design prototype's `computeDiscount` (`AdminPos.jsx`):
 * an empty or zero value is "no discount"; a negative value, an over-100
 * percent, or an amount over the subtotal are rejected with the same
 * Persian messages the prototype shows.
 */
export function computeDiscount(
  subtotal: number,
  discountType: 'amount' | 'percent',
  discountValue: number | string,
): DiscountResult {
  const n = Number(discountValue);
  if (!discountValue || n === 0) return { amount: 0, error: null };
  if (n < 0) return { amount: 0, error: 'مقدار تخفیف نمی‌تواند منفی باشد.' };
  if (discountType === 'percent') {
    if (n > 100) return { amount: 0, error: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.' };
    return { amount: Math.round((subtotal * n) / 100), error: null };
  }
  if (n > subtotal) return { amount: 0, error: 'مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.' };
  return { amount: n, error: null };
}
