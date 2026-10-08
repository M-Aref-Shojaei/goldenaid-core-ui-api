import { describe, it, expect } from 'vitest';
import { PRODUCT_GROUPS, productGroupLabel } from '../../utils/productGroups';

describe('product groups', () => {
  it('lists the three admin-only groups in the approved order', () => {
    expect(PRODUCT_GROUPS.map((g) => g.label)).toEqual(['بهداشتی', 'مکمل', 'تجهیزات پزشکی']);
    expect(PRODUCT_GROUPS.map((g) => g.key)).toEqual(['hygiene', 'supplement', 'medical_equipment']);
  });

  it('labels a group and returns null for none/unknown', () => {
    expect(productGroupLabel('medical_equipment')).toBe('تجهیزات پزشکی');
    expect(productGroupLabel(null)).toBeNull();
    expect(productGroupLabel(undefined)).toBeNull();
  });
});
