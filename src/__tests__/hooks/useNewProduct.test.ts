import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNewProduct } from '../../hooks/useNewProduct';
import { adminCreateProduct } from '../../api/catalog';
import { adminUploadProductImage, adminAttachProductImage } from '../../api/admin';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('../../api/catalog', () => ({
  adminCreateProduct: vi.fn(),
}));

vi.mock('../../api/admin', () => ({
  adminUploadProductImage: vi.fn(),
  adminAttachProductImage: vi.fn(),
}));

describe('useNewProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminCreateProduct).mockResolvedValue({ product_id: 'prod-1' });
  });

  it('creates the product without ever sending a blob: URL', async () => {
    const { result } = renderHook(() => useNewProduct());
    act(() => result.current.setField('title', 'Test'));

    await act(async () => result.current.submit());

    const payload = vi.mocked(adminCreateProduct).mock.calls[0][0];
    expect(payload).not.toHaveProperty('image_url');
  });

  it('defers the upload+attach until after the product exists, then uses the real URL', async () => {
    vi.mocked(adminUploadProductImage).mockResolvedValue({
      success: true,
      image_url: '/media/real.jpg',
      filename: 'real.jpg',
      size: 10,
    });
    vi.mocked(adminAttachProductImage).mockResolvedValue({
      id: 'img-1',
      url: '/media/real.jpg',
      alt: null,
      sort_order: 0,
    });

    const { result } = renderHook(() => useNewProduct());
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    act(() => result.current.handleImageUpload(file));
    expect(adminUploadProductImage).not.toHaveBeenCalled();

    await act(async () => result.current.submit());

    expect(adminUploadProductImage).toHaveBeenCalledWith('prod-1', file);
    expect(adminAttachProductImage).toHaveBeenCalledWith('prod-1', { url: '/media/real.jpg' });
    expect(push).toHaveBeenCalledWith('/products');
  });

  it('still navigates away if the image attach fails after product creation succeeds', async () => {
    vi.mocked(adminUploadProductImage).mockRejectedValue(new Error('upload failed'));

    const { result } = renderHook(() => useNewProduct());
    act(() => result.current.handleImageUpload(new File(['data'], 'photo.jpg', { type: 'image/jpeg' })));

    await act(async () => result.current.submit());

    expect(push).toHaveBeenCalledWith('/products');
  });
});
