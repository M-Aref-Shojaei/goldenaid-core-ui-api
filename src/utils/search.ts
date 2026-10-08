const MAP: Record<string, string> = { ي: 'ی', ك: 'ک', ى: 'ی', ە: 'ه' };
'٠١٢٣٤٥٦٧٨٩'.split('').forEach((c, i) => (MAP[c] = String(i)));
'۰۱۲۳۴۵۶۷۸۹'.split('').forEach((c, i) => (MAP[c] = String(i)));

/** Persian-normalize text exactly like the catalog service (Arabic ي/ك → ی/ک, digits → ASCII,
 *  ZWNJ/tatweel/ZWJ dropped, lowercase, spaces collapsed). */
export function normalizeSearchText(text: string): string {
  return text
    .replace(/[يكىە٠-٩۰-۹]/g, (c) => MAP[c])
    .replace(/[‌‍ـ]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

interface Searchable {
  title?: string | null;
  subtitle?: string | null;
  sku?: string | null;
  barcodes?: string[] | null;
  variants?: { sku?: string | null }[] | null;
}

const hasBarcode = (item: Searchable, q: string) =>
  (item.barcodes ?? []).some((b) => normalizeSearchText(b) === q);

/** Multi-word AND search over title/subtitle/sku, ranked like the server:
 *  exact barcode → exact sku → title prefix → word-start → contains. An exact
 *  barcode match qualifies on its own. Stable within a rank. */
export function filterProducts<T extends Searchable>(items: T[], query: string): T[] {
  const q = normalizeSearchText(query);
  if (!q) return items;
  const tokens = q.split(' ');
  const ranked: [number, number, T][] = [];
  items.forEach((item, i) => {
    const title = normalizeSearchText(item.title ?? '');
    const sku = normalizeSearchText(item.sku ?? '');
    const fields = [title, sku, normalizeSearchText(item.subtitle ?? '')];
    const byBarcode = hasBarcode(item, q);
    if (!byBarcode && !tokens.every((t) => fields.some((f) => f.includes(t)))) return;
    const spaced = ` ${title}`;
    const rank = byBarcode
      ? 0
      : sku === q
        ? 1
        : title.startsWith(q)
          ? 2
          : tokens.every((t) => spaced.includes(` ${t}`))
            ? 3
            : 4;
    ranked.push([rank, i, item]);
  });
  return ranked.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((r) => r[2]);
}

/** The product (and variant, for a variant-sku hit) whose barcode, variant sku or
 *  product sku equals `query` exactly (normalized, case-insensitive) — what a
 *  barcode scanner types. Barcode wins over variant sku over product sku. */
export function findExactMatch<T extends Searchable>(
  items: T[],
  query: string,
): { product: T; variant?: NonNullable<T['variants']>[number] } | null {
  const q = normalizeSearchText(query);
  if (!q) return null;
  const same = (s?: string | null) => !!s && normalizeSearchText(s) === q;
  const byBarcode = items.find((i) => hasBarcode(i, q));
  if (byBarcode) return { product: byBarcode };
  for (const product of items) {
    const variant = (product.variants ?? []).find((v) => same(v.sku));
    if (variant) return { product, variant };
  }
  const bySku = items.find((i) => same(i.sku));
  return bySku ? { product: bySku } : null;
}
