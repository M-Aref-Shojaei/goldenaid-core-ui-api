import { describe, expect, it } from 'vitest';
import { filterProducts, normalizeSearchText } from '../../utils/search';

const p = (title: string, sku?: string, subtitle?: string) =>
  ({ title, sku, subtitle }) as never;

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
