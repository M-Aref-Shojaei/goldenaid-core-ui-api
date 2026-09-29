import { describe, it, expect } from 'vitest';
import { ApiError, getErrorMessage } from '../../api/errors';

describe('ApiError', () => {
  it('is an instance of Error', () => {
    const err = new ApiError(404, 'Not found');
    expect(err).toBeInstanceOf(Error);
  });

  it('stores status and message', () => {
    const err = new ApiError(422, 'Validation failed');
    expect(err.status).toBe(422);
    expect(err.message).toBe('Validation failed');
  });

  it('stores optional code', () => {
    const err = new ApiError(0, 'Network error', 'NETWORK_ERROR');
    expect(err.code).toBe('NETWORK_ERROR');
  });

  it('code is undefined when not provided', () => {
    const err = new ApiError(500, 'Server error');
    expect(err.code).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  it('returns Farsi copy for a Sales DISCOUNT_* rejection instead of the raw 422 text', () => {
    const err = new ApiError(422, 'Discount exceeds subtotal', 'DISCOUNT_EXCEEDS_SUBTOTAL');
    expect(getErrorMessage(err)).toBe('مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.');
  });

  it('returns Farsi message for NETWORK_ERROR code', () => {
    const err = new ApiError(0, 'raw', 'NETWORK_ERROR');
    expect(getErrorMessage(err)).toBe('خطا در برقراری ارتباط با سرور');
  });

  it('returns Farsi message for TIMEOUT code', () => {
    const err = new ApiError(408, 'raw', 'TIMEOUT');
    expect(getErrorMessage(err)).toBe('زمان درخواست به پایان رسید');
  });

  it('returns Farsi message for 401 status', () => {
    const err = new ApiError(401, 'Unauthorized');
    expect(getErrorMessage(err)).toBe('لطفاً دوباره وارد شوید');
  });

  it('returns Farsi message for 403 status', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(getErrorMessage(err)).toBe('شما دسترسی به این بخش ندارید');
  });

  it('returns Farsi message for 404 status', () => {
    const err = new ApiError(404, 'Not Found');
    expect(getErrorMessage(err)).toBe('اطلاعات مورد نظر یافت نشد');
  });

  it('returns Farsi server error for 500', () => {
    const err = new ApiError(500, 'Internal Server Error');
    expect(getErrorMessage(err)).toBe('خطای سرور. لطفاً بعداً تلاش کنید');
  });

  it('returns Farsi server error for any 5xx', () => {
    const err = new ApiError(503, 'Service Unavailable');
    expect(getErrorMessage(err)).toBe('خطای سرور. لطفاً بعداً تلاش کنید');
  });

  it('code takes precedence over status', () => {
    // TIMEOUT code with 401 status — code wins
    const err = new ApiError(401, 'raw', 'TIMEOUT');
    expect(getErrorMessage(err)).toBe('زمان درخواست به پایان رسید');
  });

  it('falls back to error.message for unknown status/code', () => {
    const err = new ApiError(409, 'Conflict occurred');
    expect(getErrorMessage(err)).toBe('Conflict occurred');
  });

  it('returns default Farsi for unknown status with no message', () => {
    const err = new ApiError(409, '');
    expect(getErrorMessage(err)).toBe('خطای نامشخص');
  });

  it('returns Farsi message for INVENTORY_UNAVAILABLE code', () => {
    const err = new ApiError(409, 'Inventory service unavailable', 'INVENTORY_UNAVAILABLE');
    expect(getErrorMessage(err)).toBe('سرویس انبار در دسترس نیست؛ حذف انجام نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.');
  });

  it('returns Farsi message for VARIANT_HAS_STOCK code', () => {
    const err = new ApiError(409, 'Variant has stock', 'VARIANT_HAS_STOCK');
    expect(getErrorMessage(err)).toBe('این تنوع موجودی دارد و قابل حذف نیست. ابتدا موجودی آن را صفر کنید.');
  });
});
