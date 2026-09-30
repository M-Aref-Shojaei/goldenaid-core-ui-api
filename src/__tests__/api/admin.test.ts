import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminUploadProductImage,
  adminAttachProductImage,
  adminRemoveProductImage,
  updateAdminOrderItems,
  applySupplierInvoicePrices,
  updateSupplierInvoice,
} from '../../api/admin';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(text),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('adminUploadProductImage', () => {
  it('POSTs the file as multipart form data to /admin/products/{productId}/upload-image', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ success: true, image_url: '/media/x.jpg', filename: 'x.jpg', size: 123 }),
    );

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await adminUploadProductImage('prod-1', file);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/products/prod-1/upload-image');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get('file')).toBe(file);
    expect(result).toEqual({ success: true, image_url: '/media/x.jpg', filename: 'x.jpg', size: 123 });
  });
});

describe('adminAttachProductImage', () => {
  it('POSTs {url, alt, sort_order} to /admin/products/{productId}/images', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ id: 'img-1', url: '/media/x.jpg', alt: 'x', sort_order: 0 }, 201),
    );

    const result = await adminAttachProductImage('prod-1', { url: '/media/x.jpg', alt: 'x', sort_order: 0 });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/products/prod-1/images');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ url: '/media/x.jpg', alt: 'x', sort_order: 0 });
    expect(result).toEqual({ id: 'img-1', url: '/media/x.jpg', alt: 'x', sort_order: 0 });
  });
});

describe('adminRemoveProductImage', () => {
  it('DELETEs /admin/products/{productId}/images/{imageId}', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(undefined), text: () => Promise.resolve('') });

    await adminRemoveProductImage('prod-1', 'img-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/products/prod-1/images/img-1');
    expect(options.method).toBe('DELETE');
  });
});

describe('updateAdminOrderItems', () => {
  it('PATCHes the full desired item list to /admin/pos/orders/{orderId}/items', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ id: 'order-1', status: 'CONFIRMED', total_amount: 150000, items: [] }),
    );

    const result = await updateAdminOrderItems('order-1', [
      { product_id: 'p1', quantity: 3, unit_price: 50000 },
    ]);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/pos/orders/order-1/items');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({
      items: [{ product_id: 'p1', quantity: 3, unit_price: 50000 }],
    });
    expect(result.total_amount).toBe(150000);
  });
});

describe('applySupplierInvoicePrices', () => {
  it('POSTs the required {item_ids} to /admin/supplier-invoices/{id}/apply-prices', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'inv-1', pricing_applied: true, items: [] }));

    await applySupplierInvoicePrices('inv-1', ['l1', 'l2']);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/supplier-invoices/inv-1/apply-prices');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ item_ids: ['l1', 'l2'] });
  });
});

describe('updateSupplierInvoice', () => {
  it('PATCHes items: [] and returns the soft-deleted invoice (deleted_at set)', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'inv-1', items: [], deleted_at: '2026-09-30T10:00:00Z' }));

    const res = await updateSupplierInvoice('inv-1', { items: [] });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/supplier-invoices/inv-1');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ items: [] });
    expect(res.deleted_at).toBe('2026-09-30T10:00:00Z');
  });

  it('rejects with the 409 code and details.lines on a stock conflict', async () => {
    mockFetch.mockResolvedValue(mockResponse(
      { detail: { error_code: 'SUPPLIER_INVOICE_STOCK_CONFLICT', message: 'm', details: { lines: [{ line_id: 'l1', max_reducible: 5 }] } } }, 409));

    await expect(updateSupplierInvoice('inv-1', { items: [] })).rejects.toMatchObject({
      status: 409,
      code: 'SUPPLIER_INVOICE_STOCK_CONFLICT',
      details: { lines: [{ line_id: 'l1', max_reducible: 5 }] },
    });
  });
});
