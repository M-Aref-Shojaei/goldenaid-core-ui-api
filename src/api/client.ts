import { API_CONFIG, STORAGE_KEYS } from './config';
import { ApiError } from './errors';
export { ApiError, getErrorMessage } from './errors';
export { API_CONFIG, STORAGE_KEYS } from './config';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Normalizes a FastAPI error body's `detail` field into a displayable string.
 *
 * FastAPI's 422 validation errors return `detail` as an *array* of
 * `{loc, msg, type}` objects, not a string — passing that straight through
 * as an `Error.message` renders as `"[object Object],[object Object]"` when
 * displayed (Array.prototype.toString on a list of plain objects).
 */
function formatErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : null))
      .filter((msg): msg is string => msg !== null);
    if (messages.length > 0) return messages.join('، ');
  }
  return fallback;
}

/** Authenticated JSON fetch wrapper — attaches Bearer token, handles errors, and times out after 30 s. */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let message = text;
      let code: string | undefined;
      try {
        const parsed = JSON.parse(text);
        message = formatErrorDetail(parsed.detail, parsed.message || text);
        code = parsed.code;
      } catch {
        // text is already the message
      }
      throw new ApiError(res.status, message, code);
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    if (err?.name === 'AbortError') throw new ApiError(408, 'Request timeout', 'TIMEOUT');
    throw new ApiError(0, err?.message || 'Network error', 'NETWORK_ERROR');
  } finally {
    clearTimeout(tid);
  }
}

/** Authenticated multipart/form-data fetch — used for file uploads. */
export async function apiFetchFormData<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = formatErrorDetail(parsed.detail, parsed.message || text);
    } catch {
      // text is already the message
    }
    throw new ApiError(res.status, message);
  }

  return res.json();
}
