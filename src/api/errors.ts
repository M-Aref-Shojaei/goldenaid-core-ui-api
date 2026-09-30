/**
 * Typed HTTP error thrown by `apiFetch` — carries HTTP status, optional backend
 * error code and, for rate-limited responses (429/503), the seconds to wait
 * (`details.retry_after_seconds` from the body; the `Retry-After` header is not
 * readable cross-origin), plus the body's `details` object as-is (e.g. the
 * per-line `lines` of a 422 `PRICING_INVALID` or 409 stock conflict).
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfter?: number;
  details?: Record<string, unknown>;
  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfter?: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
    this.details = details;
  }
}

const ERROR_MESSAGES_FA: Record<string, string> = {
  NETWORK_ERROR: 'خطا در برقراری ارتباط با سرور',
  TIMEOUT: 'زمان درخواست به پایان رسید',
  UNAUTHORIZED: 'لطفاً دوباره وارد شوید',
  FORBIDDEN: 'شما دسترسی به این بخش ندارید',
  NOT_FOUND: 'اطلاعات مورد نظر یافت نشد',
  SERVER_ERROR: 'خطای سرور. لطفاً بعداً تلاش کنید',
  // POS discount rejections from Sales (same copy as `computeDiscount`).
  DISCOUNT_INVALID: 'مقدار تخفیف معتبر نیست.',
  DISCOUNT_NEGATIVE: 'مقدار تخفیف نمی‌تواند منفی باشد.',
  DISCOUNT_PERCENT_OVER_100: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.',
  DISCOUNT_EXCEEDS_SUBTOTAL: 'مبلغ تخفیف نمی‌تواند از جمع کل سبد بیشتر باشد.',
  // Catalog rejections.
  INVENTORY_UNAVAILABLE: 'سرویس انبار در دسترس نیست؛ حذف انجام نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.',
  VARIANT_HAS_STOCK: 'این تنوع موجودی دارد و قابل حذف نیست. ابتدا موجودی آن را صفر کنید.',
  // Supplier-invoice edit/delete rejections (inventory 409s, forwarded by the BFF).
  SUPPLIER_INVOICE_STOCK_CONFLICT: 'موجودی فعلی کالا از تعداد این فاکتور کمتر است (بخشی از آن فروخته شده)؛ تغییر ممکن نیست.',
  SUPPLIER_INVOICE_DELETED: 'این فاکتور حذف شده و قابل ویرایش نیست.',
};

/** Translates an `ApiError` to a user-facing Persian string. */
export function getErrorMessage(error: ApiError): string {
  if (error.code && ERROR_MESSAGES_FA[error.code]) return ERROR_MESSAGES_FA[error.code];
  // Rate limits / SMS circuit breaker: the backend's Persian text already says
  // how long to wait — don't flatten a 503 into the generic server error.
  if (error.retryAfter && error.message) return error.message;
  if (error.status === 401) return ERROR_MESSAGES_FA.UNAUTHORIZED;
  if (error.status === 403) return ERROR_MESSAGES_FA.FORBIDDEN;
  if (error.status === 404) return ERROR_MESSAGES_FA.NOT_FOUND;
  if (error.status >= 500) return ERROR_MESSAGES_FA.SERVER_ERROR;
  return error.message || 'خطای نامشخص';
}
