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

  it('throws ApiError on non-2xx', async () => {
    mockFetch.mockResolvedValue(mockResponse({ detail: 'Too large' }, 413));

    await expect(apiFetchFormData('/upload', new FormData())).rejects.toSatisfy(
      (e: ApiError) => e instanceof ApiError && e.status === 413,
    );
  });
});
