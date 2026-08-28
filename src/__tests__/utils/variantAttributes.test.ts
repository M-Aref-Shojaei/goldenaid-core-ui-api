import { describe, expect, it } from 'vitest';
import { groupVariantsByAttribute, matchVariant } from '../../utils/variantAttributes';
import type { ProductVariant } from '../../types/catalog';

function variant(id: string, attributes: Record<string, string>): ProductVariant {
  return { id, label: Object.values(attributes).join(' / '), sort_order: 0, attributes, sku: null };
}

describe('groupVariantsByAttribute', () => {
  it('returns one key with distinct values for a single-axis product', () => {
    const variants = [variant('v1', { size: 'L' }), variant('v2', { size: 'XL' })];
    expect(groupVariantsByAttribute(variants)).toEqual({ size: ['L', 'XL'] });
  });

  it('returns multiple keys for a two-axis product', () => {
    const variants = [
      variant('v1', { size: 'L', color: 'قرمز' }),
      variant('v2', { size: 'XL', color: 'آبی' }),
      variant('v3', { size: 'L', color: 'آبی' }),
    ];
    const result = groupVariantsByAttribute(variants);
    expect(result.size).toEqual(['L', 'XL']);
    expect(result.color).toEqual(['قرمز', 'آبی']);
  });

  it('returns an empty object for a product with no variants', () => {
    expect(groupVariantsByAttribute([])).toEqual({});
  });

  it('does not duplicate a value seen on more than one variant', () => {
    const variants = [
      variant('v1', { size: 'L', color: 'قرمز' }),
      variant('v2', { size: 'L', color: 'آبی' }),
    ];
    expect(groupVariantsByAttribute(variants).size).toEqual(['L']);
  });
});

describe('matchVariant', () => {
  const variants = [
    variant('v1', { size: 'L', color: 'قرمز' }),
    variant('v2', { size: 'XL', color: 'آبی' }),
  ];

  it('finds the variant whose attributes exactly match the selections', () => {
    expect(matchVariant(variants, { size: 'L', color: 'قرمز' })?.id).toBe('v1');
  });

  it('returns undefined when no variant matches', () => {
    expect(matchVariant(variants, { size: 'L', color: 'آبی' })).toBeUndefined();
  });

  it('works for single-axis variants', () => {
    const single = [variant('v1', { size: 'L' }), variant('v2', { size: 'XL' })];
    expect(matchVariant(single, { size: 'XL' })?.id).toBe('v2');
  });
});
