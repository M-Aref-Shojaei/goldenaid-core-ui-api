import { describe, expect, it } from 'vitest';
import { filterProducts, findExactMatch, normalizeSearchText } from '../../utils/search';

const p = (title: string, sku?: string, subtitle?: string) =>
  ({ title, sku, subtitle });

describe('normalizeSearchText', () => {
  it('maps Arabic variants, digits, drops ZWNJ and collapses spaces', () => {
    expect(normalizeSearchText('  كيف‌ ٣۴  AB ')).toBe('کیف 34 ab');
  });
});

describe('filterProducts', () => {
  const items = [
    p('کیف چرم', 'A1'),
    p('گردنبند پاکسمن', 'N1'),
    p('پاکسمن کیف'),
    p('دستبند', 'KIF'),
  ];

  it('returns everything for an empty query', () => {
    expect(filterProducts(items, '  ')).toHaveLength(4);
  });

  it('treats Arabic ي/ك like Persian ی/ک', () => {
    expect(filterProducts(items, 'كيف').map((x) => x.title)).toEqual(
      filterProducts(items, 'کیف').map((x) => x.title),
    );
  });

  it('requires every word (AND) in any field', () => {
    expect(filterProducts(items, 'پاکسمن کیف').map((x) => x.title)).toEqual(['پاکسمن کیف']);
  });

  it('ranks exact sku, then title prefix, then word start, then contains', () => {
    const list = [p('xx abc'), p('zabcz'), p('abc بند'), p('other', 'abc')];
    expect(filterProducts(list, 'abc').map((x) => x.title)).toEqual([
      'other',
      'abc بند',
      'xx abc',
      'zabcz',
    ]);
  });

  it('keeps original order among equal ranks', () => {
    expect(filterProducts([p('b x'), p('a x')], 'x').map((x) => x.title)).toEqual(['b x', 'a x']);
  });
});

describe('barcodes', () => {
  const bc = (title: string, barcodes: string[], sku?: string, variants: { id: string; sku: string }[] = []) => ({
    title,
    sku,
    barcodes,
    variants,
  });

  it('filterProducts includes an exact-barcode product and ranks it above exact sku', () => {
    const list = [bc('6260100000018 title', []), bc('by sku', [], '6260100000018'), bc('زیره', ['6260100000018'])];
    expect(filterProducts(list, '۶۲۶۰۱۰۰۰۰۰۰۱۸').map((x) => x.title)).toEqual([
      'زیره',
      'by sku',
      '6260100000018 title',
    ]);
  });

  it('filterProducts does not match a barcode prefix', () => {
    expect(filterProducts([bc('x', ['6260100000018'])], '626010')).toEqual([]);
  });

  it('findExactMatch: barcode, then variant sku, then product sku; case-insensitive', () => {
    const v = { id: 'v1', sku: 'TSH-L' };
    const a = bc('a', ['AB-12'], 'SKU-A');
    const b = bc('b', [], 'SKU-B', [v]);
    expect(findExactMatch([a, b], ' ab-12 ')).toEqual({ product: a });
    expect(findExactMatch([a, b], 'tsh-l')).toEqual({ product: b, variant: v });
    expect(findExactMatch([a, b], 'SKU-B')).toEqual({ product: b });
  });

  it('findExactMatch returns null for partial or empty input', () => {
    expect(findExactMatch([bc('a', ['6260100000018'], 'SKU-A')], '626010')).toBeNull();
    expect(findExactMatch([bc('a', [], 'SKU-A')], '   ')).toBeNull();
  });
});
