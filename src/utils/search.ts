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
}

/** Multi-word AND search over title/subtitle/sku, ranked like the server:
 *  exact sku → title prefix → word-start → contains. Stable within a rank. */
export function filterProducts<T extends Searchable>(items: T[], query: string): T[] {
  const q = normalizeSearchText(query);
  if (!q) return items;
  const tokens = q.split(' ');
  const ranked: [number, number, T][] = [];
  items.forEach((item, i) => {
    const title = normalizeSearchText(item.title ?? '');
    const sku = normalizeSearchText(item.sku ?? '');
    const fields = [title, sku, normalizeSearchText(item.subtitle ?? '')];
    if (!tokens.every((t) => fields.some((f) => f.includes(t)))) return;
    const spaced = ` ${title}`;
    const rank =
      sku === q ? 0 : title.startsWith(q) ? 1 : tokens.every((t) => spaced.includes(` ${t}`)) ? 2 : 3;
    ranked.push([rank, i, item]);
  });
  return ranked.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((r) => r[2]);
}
