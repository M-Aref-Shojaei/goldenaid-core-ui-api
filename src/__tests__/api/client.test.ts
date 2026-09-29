import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError } from '../../api/errors';

const captureException = vi.fn();
vi.mock('@sentry/browser', () => ({ captureException }));

const { apiFetch, apiFetchFormData } = await import('../../api/client');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(body: unknown, status = 200) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
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

describe('error reporting to Sentry/GlitchTip', () => {
  it('reports 5xx responses (real backend bugs)', async () => {
    mockFetch.mockResolvedValue(mockResponse('Internal Server Error', 500));

    await expect(apiFetch('/error')).rejects.toBeInstanceOf(ApiError);

    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('reports network failures', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    await expect(apiFetch('/test')).rejects.toBeInstanceOf(ApiError);

    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('reports timeouts', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

    await expect(apiFetch('/slow')).rejects.toBeInstanceOf(ApiError);

    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('keeps the real cause (endpoint, status, code, request id) on the GlitchTip event', async () => {
    // Backends answer every unhandled failure with one generic message, so
    // without this all broken endpoints grouped into a single vague issue.
    mockFetch.mockResolvedValue(
      mockResponse({ detail: { error_code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }, 500),
    );

    const err = await apiFetch<never>('/products/fc088bc1-a727-4dee-be94-c26190a3a20e?x=1').catch((e: ApiError) => e);

    expect(err.message).toBe('An unexpected error occurred.');
    expect(err.name).toBe('ApiError 500 GET /products/{id}');
    const [reported, context] = captureException.mock.calls[0];
    expect(reported).toBe(err);
    expect(context.fingerprint).toEqual(['api-error', 'GET /products/{id}', '500', 'INTERNAL_ERROR']);
    const sentId = mockFetch.mock.calls[0][1].headers['X-Request-ID'];
    expect(context.tags).toEqual({
      'api.endpoint': 'GET /products/{id}',
      'api.status': '500',
      'api.code': 'INTERNAL_ERROR',
      request_id: sentId,
    });
  });

  it('groups network failures per endpoint and method', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    await apiFetch('/admin/orders/42/items', { method: 'patch' }).catch(() => {});

    expect(captureException.mock.calls[0][1].tags['api.endpoint']).toBe('PATCH /admin/orders/{id}/items');
    expect(captureException.mock.calls[0][1].tags['api.code']).toBe('NETWORK_ERROR');
  });

  it('does not report expected 4xx validation/auth errors', async () => {
    mockFetch.mockResolvedValue(mockResponse({ detail: 'Not found' }, 404));

    await expect(apiFetch('/missing')).rejects.toBeInstanceOf(ApiError);

    expect(captureException).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('apiFetch', () => {
  describe('auth header', () => {
    it('injects Authorization header when token in localStorage', async () => {
      localStorage.setItem('token', 'test-jwt');
      mockFetch.mockResolvedValue(mockResponse({ ok: true }));

      await apiFetch('/test');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-jwt');
    });

    it('does not inject Authorization header when no token', async () => {
      mockFetch.mockResolvedValue(mockResponse({ ok: true }));

      await apiFetch('/test');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBeUndefined();
    });
  });

  describe('request id header', () => {
    it('sends a fresh X-Request-ID header on every call', async () => {
      mockFetch.mockResolvedValue(mockResponse({ ok: true }));

      await apiFetch('/some-path');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['X-Request-ID']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('success', () => {
    it('returns parsed JSON on 2xx', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: 1, name: 'test' }));

      const result = await apiFetch<{ id: number; name: string }>('/items/1');

      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('passes method and body through to fetch', async () => {
      mockFetch.mockResolvedValue(mockResponse({ created: true }));

      await apiFetch('/items', { method: 'POST', body: JSON.stringify({ name: 'x' }) });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify({ name: 'x' }));
    });

    it('does not throw on a 204 No Content response (e.g. DELETE endpoints)', async () => {
      // A real 204 response has no body -- res.json() throws "Unexpected
      // end of JSON input" on it, which every DELETE call (variants,
      // batches, images, ...) hit in production every single time.
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
        text: () => Promise.resolve(''),
      });

      await expect(apiFetch('/items/1', { method: 'DELETE' })).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws ApiError with status and JSON detail on non-2xx', async () => {
      mockFetch.mockResolvedValue(mockResponse({ detail: 'Not found' }, 404));

      await expect(apiFetch('/missing')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 404 && e.message === 'Not found',
      );
    });

    it('throws ApiError with status and JSON message on non-2xx', async () => {
      mockFetch.mockResolvedValue(mockResponse({ message: 'Bad input' }, 422));

      await expect(apiFetch('/bad')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 422 && e.message === 'Bad input',
      );
    });

    it('uses detail.message from a core-bff {error_code, message} body', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ detail: { error_code: 'VALIDATION_ERROR', message: 'محصول پیدا نشد.' } }, 422),
      );

      await expect(apiFetch('/bad')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 422 && e.message === 'محصول پیدا نشد.',
      );
    });

    it('reads error_code and retry_after_seconds from a rate-limited body', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(
          {
            detail: {
              error_code: 'RATE_LIMITED',
              message: 'لطفاً ۴۲ ثانیه دیگر دوباره تلاش کنید.',
              details: { retry_after_seconds: 42 },
            },
          },
          429,
        ),
      );

      await expect(apiFetch('/auth/request-otp')).rejects.toSatisfy(
        (e: ApiError) =>
          e.status === 429 && e.code === 'RATE_LIMITED' && e.retryAfter === 42 &&
          e.message === 'لطفاً ۴۲ ثانیه دیگر دوباره تلاش کنید.',
      );
    });

    it('keeps detail.details (per-line 409/422 info) on the ApiError', async () => {
      const lines = [{ line_id: 'l1', requested_reduction: 3, max_reducible: 1, reason: 'SOLD' }];
      mockFetch.mockResolvedValue(
        mockResponse(
          { detail: { error_code: 'SUPPLIER_INVOICE_STOCK_CONFLICT', message: 'conflict', details: { lines } } },
          409,
        ),
      );

      await expect(apiFetch('/admin/supplier-invoices/i1')).rejects.toSatisfy(
        (e: ApiError) =>
          e.status === 409 && e.code === 'SUPPLIER_INVOICE_STOCK_CONFLICT' &&
          JSON.stringify(e.details) === JSON.stringify({ lines }),
      );
    });

    it('leaves details undefined when the body has none', async () => {
      mockFetch.mockResolvedValue(mockResponse({ detail: 'Bad request' }, 400));

      await expect(apiFetch('/x')).rejects.toSatisfy((e: ApiError) => e.details === undefined);
    });

    it('throws ApiError with raw text when response is not JSON', async () => {
      mockFetch.mockResolvedValue(mockResponse('Internal Server Error', 500));

      await expect(apiFetch('/error')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 500,
      );
    });

    it('throws ApiError with code=NETWORK_ERROR on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      await expect(apiFetch('/test')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 0 && e.code === 'NETWORK_ERROR',
      );
    });

    it('throws ApiError with code=TIMEOUT on AbortError', async () => {
      mockFetch.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

      await expect(apiFetch('/slow')).rejects.toSatisfy(
        (e: ApiError) => e instanceof ApiError && e.status === 408 && e.code === 'TIMEOUT',
      );
    });
  });
});

describe('apiFetchFormData', () => {
  it('does not set Content-Type header (lets browser set boundary)', async () => {
    mockFetch.mockResolvedValue(mockResponse({ uploaded: true }));
    localStorage.setItem('token', 'test-jwt');

    const fd = new FormData();
    fd.append('file', new Blob(['data']), 'test.txt');
    await apiFetchFormData('/upload', fd);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBeUndefined();
  });

  it('injects Authorization header when token present', async () => {
    mockFetch.mockResolvedValue(mockResponse({ uploaded: true }));
    localStorage.setItem('token', 'test-jwt');

    await apiFetchFormData('/upload', new FormData());

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer test-jwt');
  });

  it('keeps detail.details on the ApiError', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ detail: { error_code: 'PRICING_INVALID', message: 'bad', details: { lines: [{ ref: '0' }] } } }, 422),
    );

    await expect(apiFetchFormData('/upload', new FormData())).rejects.toSatisfy(
      (e: ApiError) => JSON.stringify(e.details) === JSON.stringify({ lines: [{ ref: '0' }] }),
    );
  });

  it('throws ApiError on non-2xx', async () => {
    mockFetch.mockResolvedValue(mockResponse({ detail: 'Too large' }, 413));

    await expect(apiFetchFormData('/upload', new FormData())).rejects.toSatisfy(
      (e: ApiError) => e instanceof ApiError && e.status === 413,
    );
  });
});
