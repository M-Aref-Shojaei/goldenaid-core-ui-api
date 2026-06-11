import { API_CONFIG, STORAGE_KEYS } from './config';
import { ApiError } from './errors';
export { ApiError, getErrorMessage } from './errors';
export { API_CONFIG, STORAGE_KEYS } from './config';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/** Authenticated JSON fetch wrapper — attaches Bearer token, handles errors, and times out after 30 s. */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
        message = parsed.detail || parsed.message || text;
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
      message = parsed.detail || parsed.message || text;
    } catch {
      // text is already the message
    }
    throw new ApiError(res.status, message);
  }

  return res.json();
}
