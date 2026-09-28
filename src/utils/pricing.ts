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
 * Splits a decimal literal (optionally scientific, e.g. `"1e3"`) into plain
 * sign/integer/fraction digit strings -- mirrors Python `Decimal(str(x))`
 * without ever running `float`/`BigInt` arithmetic on the value itself. A
 * `BigInt` port broke the design prototype (in-browser Babel rewrites
 * `10n ** x` to `Math.pow`, which throws on a BigInt operand) and risked
 * older Safari in the admin app (TASK-333 follow-up). Trailing fractional
 * zeros are stripped, so `"12.50"` reads as 1 decimal place, matching
 * `Decimal` value-equality. Returns `null` for anything that isn't a plain
 * decimal or scientific literal.
 */
function normalizeDecimal(value: number | string): { negative: boolean; intPart: string; fracPart: string } | null {
  const match = /^(-)?(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(String(value).trim());
  if (!match) return null;
  const [, sign, intDigits, fracDigits = '', expStr] = match;
  let digits = intDigits + fracDigits;
  let point = intDigits.length + (expStr ? parseInt(expStr, 10) : 0);
  while (point > digits.length) digits += '0';
  while (point < 0) {
    digits = '0' + digits;
    point += 1;
  }
  const intPart = digits.slice(0, point).replace(/^0+(?=\d)/, '') || '0';
  const fracPart = digits.slice(point).replace(/0+$/, '');
  return { negative: sign === '-', intPart, fracPart };
}

/**
 * Computes a POS discount amount from `subtotal` and a type/value pair.
 * Faithful port of `goldenaid-sales`'s `compute_discount` plus its
 * `DISCOUNT_INVALID` precision rule (`app/discount.py`, `app/api/v1/orders.py`
 * `_resolve_discount`), itself a Decimal port of the design prototype's
 * `computeDiscount` in `AdminPos.jsx`: an empty or zero value is "no
 * discount"; a negative value, a non-integer amount, a percent with more
 * than 2 decimal places, an over-100 percent, or an amount over the
 * subtotal are all rejected with a Persian message.
 *
 * All math is plain-integer (percent is scaled to basis points, `value *
 * 100`, before multiplying) -- never a `float` multiply on the raw value --
 * so it can't round a boundary value (e.g. `x.5`) the opposite way from the
 * server's `Decimal` `ROUND_HALF_UP`. `subtotal * basisPoints` stays far
 * under `Number.MAX_SAFE_INTEGER` for any realistic POS subtotal, but is
 * guarded regardless.
 */
export function computeDiscount(
  subtotal: number,
  discountType: 'amount' | 'percent',
  discountValue: number | string,
): DiscountResult {
  if (!discountValue) return { amount: 0, error: null };
  const parsed = normalizeDecimal(discountValue);
  if (!parsed) return { amount: 0, error: null };
  const { negative, intPart, fracPart } = parsed;
  if (intPart === '0' && fracPart === '') return { amount: 0, error: null };
  if (negative) return { amount: 0, error: 'مقدار تخفیف نمی‌تواند منفی باشد.' };
  if (discountType === 'amount') {
    if (fracPart !== '') return { amount: 0, error: 'مبلغ تخفیف باید عدد صحیح باشد.' };
    const value = Number(intPart);
    if (value > subtotal) return { amount: 0, error: 'مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.' };
    return { amount: value, error: null };
  }
  if (fracPart.length > 2) return { amount: 0, error: 'درصد تخفیف حداکثر تا دو رقم اعشار مجاز است.' };
  // basisPoints = percent * 100, an exact integer (fracPart is <= 2 digits).
  const basisPoints = Number(intPart + (fracPart + '00').slice(0, 2));
  if (basisPoints > 10000) return { amount: 0, error: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.' };
  const product = subtotal * basisPoints;
  if (!Number.isSafeInteger(product)) return { amount: 0, error: 'مقدار تخفیف قابل محاسبه نیست.' };
  // round_half_up(subtotal * basisPoints / 10000) via one integer division.
  return { amount: Math.floor((product + 5000) / 10000), error: null };
}
