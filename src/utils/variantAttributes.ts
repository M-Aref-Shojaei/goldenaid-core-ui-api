import type { ProductVariant } from '../types/catalog';

/** Groups a product's variants by attribute type, returning the distinct
 *  values seen for each — e.g. for a two-axis product,
 *  { size: ["L","XL"], color: ["قرمز","آبی"] }. For today's single-axis
 *  catalog this returns exactly one key. */
export function groupVariantsByAttribute(variants: ProductVariant[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const variant of variants) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (!result[key]) result[key] = [];
      if (!result[key].includes(value)) result[key].push(value);
    }
  }
  return result;
}

/** Finds the one variant whose attributes exactly match `selections`
 *  (same keys, same values) — used once a shopper has picked one value
 *  per attribute axis, to resolve back to a single purchasable variant. */
export function matchVariant(
  variants: ProductVariant[],
  selections: Record<string, string>,
): ProductVariant | undefined {
  return variants.find((v) => {
    const keys = Object.keys(selections);
    if (Object.keys(v.attributes).length !== keys.length) return false;
    return keys.every((k) => v.attributes[k] === selections[k]);
  });
}
