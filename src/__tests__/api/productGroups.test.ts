import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminListProducts, adminCheckProductName, adminQuickAddProduct, listProducts } from '../../api/catalog';
import { discardSupplierInvoiceProducts } from '../../api/admin';
import { ApiError } from '../../api/errors';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body);
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body), text: () => Promise.resolve(text) };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('TASK-351 catalog API', () => {
  it('adminListProducts sends group, status tab, sellable, invoice and counts filters', async () => {
    mockFetch.mockResolvedValue(mockResponse({ total: 0, skip: 0, limit: 40, products: [], status_counts: { all: 0 } }));
    await adminListProducts({ skip: 0, limit: 40, group: 'medical_equipment', status: 'incomplete', counts: true, sellable: false, created_from_invoice_id: 'inv-1' });
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.pathname).toMatch(/\/admin\/products$/);
    expect(url.searchParams.get('group')).toBe('medical_equipment');
    expect(url.searchParams.get('status')).toBe('incomplete');
    expect(url.searchParams.get('counts')).toBe('true');
    expect(url.searchParams.get('sellable')).toBe('false');
    expect(url.searchParams.get('created_from_invoice_id')).toBe('inv-1');
  });

  it('adminCheckProductName GETs name-check with the typed title and optional exclude_id', async () => {
    mockFetch.mockResolvedValue(mockResponse({ duplicate: true, matches: [{ product_id: 'p1', title: 'کرم' }] }));
    const res = await adminCheckProductName('کرم روز', 'p9');
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.pathname).toMatch(/\/admin\/products\/name-check$/);
    expect(url.searchParams.get('title')).toBe('کرم روز');
    expect(url.searchParams.get('exclude_id')).toBe('p9');
    expect(res.matches[0].product_id).toBe('p1');
  });

  it('adminQuickAddProduct POSTs title/sku/group/created_from_invoice_id and never a base_price', async () => {
    mockFetch.mockResolvedValue(mockResponse({ product_id: 'p1', title: 'x', pending_invoice: true }));
    await adminQuickAddProduct({ title: 'x', sku: '', group: 'hygiene', created_from_invoice_id: 'draft-1' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/admin\/products$/);
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body).toEqual({ title: 'x', group: 'hygiene', created_from_invoice_id: 'draft-1' });
    expect('base_price' in body).toBe(false);
  });

  it('adminQuickAddProduct surfaces 409 DUPLICATE_NAME with its matches', async () => {
    mockFetch.mockResolvedValue(mockResponse({ detail: { error_code: 'DUPLICATE_NAME', message: 'dup', details: { matches: [{ product_id: 'p1', title: 'x' }] } } }, 409));
    const err = await adminQuickAddProduct({ title: 'x', created_from_invoice_id: 'd' }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('DUPLICATE_NAME');
    expect((err.details.matches as unknown[]).length).toBe(1);
  });

  it('listProducts adds include_pos_only only when asked (staff POS feed)', async () => {
    mockFetch.mockResolvedValue(mockResponse({ items: [], total: 0 }));
    await listProducts(200, 0, true, true);
    await listProducts(50, 0, true);
    expect(mockFetch.mock.calls[0][0]).toContain('include_pos_only=true');
    expect(mockFetch.mock.calls[1][0]).not.toContain('include_pos_only');
  });

  it('discardSupplierInvoiceProducts POSTs to the invoice discard-products route', async () => {
    mockFetch.mockResolvedValue(mockResponse({ deleted: [{ product_id: 'p1', title: 'x' }], kept: [] }));
    const res = await discardSupplierInvoiceProducts('draft-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/admin\/supplier-invoices\/draft-1\/discard-products$/);
    expect(opts.method).toBe('POST');
    expect(res.deleted).toHaveLength(1);
  });
});
