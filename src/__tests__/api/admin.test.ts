import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminUploadProductImage } from '../../api/admin';

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
