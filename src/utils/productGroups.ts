import type { ProductGroup } from '../types/catalog';

/** Admin-only internal product groups in the approved order (ADMIN-PRODUCT-GROUPS.md).
 *  «همه» (no filter) is not a group; filter UIs prepend it themselves. */
export const PRODUCT_GROUPS: readonly { key: ProductGroup; label: string }[] = [
  { key: 'hygiene', label: 'بهداشتی' },
  { key: 'supplement', label: 'مکمل' },
  { key: 'medical_equipment', label: 'تجهیزات پزشکی' },
];

/** Persian label of a group, or null for an ungrouped / unknown product. */
export function productGroupLabel(group: ProductGroup | null | undefined): string | null {
  return PRODUCT_GROUPS.find((g) => g.key === group)?.label ?? null;
}
