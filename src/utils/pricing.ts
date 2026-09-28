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
 * Parses a decimal number/string into an exact `num/den` fraction, so
 * `computeDiscount` never runs a `float`/`Number` multiplication on a
 * fractional value -- the server side is Python `Decimal`, and a plain
 * `Number` multiply (e.g. `250 * 64.6`) can land one unit off of the exact
 * `x.5` half-up boundary (TASK-333 follow-up). Malformed input (not a plain
 * `-?digits(.digits)?`) falls back to `0/1`, matching `Number(x) || 0`.
 */
function toExactFraction(value: number | string): { num: bigint; den: bigint } {
  const match = /^(-)?(\d*)(?:\.(\d+))?$/.exec(String(value).trim());
  const intPart = match?.[2] ?? '';
  const fracPart = match?.[3] ?? '';
  if (!match || (!intPart && !fracPart)) return { num: 0n, den: 1n };
  const den = 10n ** BigInt(fracPart.length);
  const num = BigInt((intPart || '0') + fracPart) * (match[1] ? -1n : 1n);
  return { num, den };
}

/**
 * Computes a POS discount amount from `subtotal` and a type/value pair.
 * Faithful port of `goldenaid-sales`'s `compute_discount` (`app/discount.py`,
 * itself a Decimal port of the design prototype's `computeDiscount` in
 * `AdminPos.jsx`): an empty or zero value is "no discount"; a negative
 * value, an over-100 percent, or an amount over the subtotal are rejected
 * with the same Persian messages. All math is exact integer/BigInt
 * arithmetic -- never a `float` multiply -- so it can't round a boundary
 * value (e.g. `x.5`) the opposite way from the server's `Decimal`
 * `ROUND_HALF_UP`.
 */
export function computeDiscount(
  subtotal: number,
  discountType: 'amount' | 'percent',
  discountValue: number | string,
): DiscountResult {
  if (!discountValue) return { amount: 0, error: null };
  const { num, den } = toExactFraction(discountValue);
  if (num === 0n) return { amount: 0, error: null };
  if (num < 0n) return { amount: 0, error: 'مقدار تخفیف نمی‌تواند منفی باشد.' };
  const subtotalBig = BigInt(Math.trunc(subtotal));
  if (discountType === 'percent') {
    if (num > 100n * den) return { amount: 0, error: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.' };
    // round_half_up(subtotal * num / den / 100) via one integer division:
    // floor((subtotal*num*2 + den*100) / (den*200)); numerator is always >= 0 here.
    const amount = (subtotalBig * num * 2n + den * 100n) / (den * 200n);
    return { amount: Number(amount), error: null };
  }
  if (num > subtotalBig * den) return { amount: 0, error: 'مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.' };
  // Amount-type values are integers (Q10); truncate any stray fraction like the server's `int(Decimal)`.
  return { amount: Number(num / den), error: null };
}
