import * as Sentry from '@sentry/browser';
import { API_CONFIG, STORAGE_KEYS, SESSION_KEYS, SESSION_EXPIRED_EVENT } from './config';
import { ApiError } from './errors';
export { ApiError, getErrorMessage } from './errors';
export { API_CONFIG, STORAGE_KEYS } from './config';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/** core-bff error codes that mean the user's token itself is bad. */
const SESSION_ERROR_CODES = ['TOKEN_REVOKED', 'INVALID_TOKEN', 'MISSING_AUTH_TOKEN'];

/** Endpoints whose 401 means "wrong credentials / already logged out", not "session ended". */
const AUTH_FLOW_PATHS = ['/auth/request-otp', '/auth/verify-otp', '/auth/logout'];

/**
 * A 401 on a request that carried the stored token means the session is over
 * server-side: clear it and tell AuthProvider. Single-flight by construction --
 * only the request whose token is still the stored one acts, so parallel 401s
 * (and 401s from a token replaced by a newer login) cause one logout, not a storm.
 * 403 is a permission error and is deliberately not handled.
 */
function handleUnauthorized(status: number, path: string, sentToken: string | null, code?: string): void {
  if (status !== 401 || !sentToken || typeof window === 'undefined') return;
  const bare = path.split('?')[0];
  if (AUTH_FLOW_PATHS.includes(bare)) return;
  // Only genuine token failures end the session. Any other 401 (e.g. a forwarded
  // downstream/internal-token 401) must not log the user out. /auth/me is the
  // session probe and its upstream 401 carries no code.
  if (!(code && SESSION_ERROR_CODES.includes(code)) && bare !== '/auth/me') return;
  if (getToken() !== sentToken) return;
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

/**
 * Reports unexpected failures (server errors, network drops, timeouts) to
 * Sentry/GlitchTip. Expected 4xx validation/auth errors are not reported —
 * every hook used to swallow these silently in its own try/catch, so no
 * real backend bug ever reached the error dashboard. This is the one
 * chokepoint every API call routes through.
 */
function reportUnexpectedError(err: ApiError, method: string | undefined, path: string, requestId?: string): void {
  if (err.status === 0 || err.status === 408 || err.status >= 500) {
    // Backends answer every unhandled failure with the same generic message,
    // so without this every broken endpoint landed in one vague GlitchTip
    // issue (GT-91/30: 182 events, all one catalog bug). Name + fingerprint
    // split issues per endpoint/status; tags keep the cause searchable, and
    // request_id joins the event to the backend's own logs.
    const endpoint = `${(method ?? 'GET').toUpperCase()} ${templatePath(path)}`;
    err.name = `ApiError ${err.status} ${endpoint}`;
    Sentry.captureException(err, {
      fingerprint: ['api-error', endpoint, String(err.status), err.code ?? ''],
      tags: {
        'api.endpoint': endpoint,
        'api.status': String(err.status),
        'api.code': err.code ?? 'none',
        ...(requestId ? { request_id: requestId } : {}),
      },
    });
  }
}

/** Replaces UUIDs and numeric ids in a path with `{id}` and drops the query, so one endpoint is one issue. */
function templatePath(path: string): string {
  return path
    .split('?')[0]
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{id}')
    .replace(/\/\d+(?=\/|$)/g, '/{id}');
}

/**
 * Normalizes a FastAPI error body's `detail` field into a displayable string.
 *
 * FastAPI's 422 validation errors return `detail` as an *array* of
 * `{loc, msg, type}` objects, not a string — passing that straight through
 * as an `Error.message` renders as `"[object Object],[object Object]"` when
 * displayed (Array.prototype.toString on a list of plain objects).
 * core-bff errors put `{error_code, message}` in `detail`; the message is used.
 */
function formatErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : null))
      .filter((msg): msg is string => msg !== null);
    if (messages.length > 0) return messages.join('، ');
  }
  // core-bff's own and proxied upstream errors: `{error_code, message}`.
  if (detail && typeof detail === 'object' && typeof (detail as { message?: unknown }).message === 'string') {
    return (detail as { message: string }).message;
  }
  return fallback;
}

/** A core-bff error body's `detail.details`, when it is a plain object. */
function asDetails(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Authenticated JSON fetch wrapper — attaches Bearer token, handles errors, and times out after 30 s. */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const requestId = crypto.randomUUID();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
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
      let retryAfter: number | undefined;
      let details: Record<string, unknown> | undefined;
      try {
        const parsed = JSON.parse(text);
        message = formatErrorDetail(parsed.detail, parsed.message || text);
        // core-bff errors: `{detail: {error_code, message, details}}`.
        code = parsed.code ?? parsed.detail?.error_code;
        const seconds = Number(parsed.detail?.details?.retry_after_seconds);
        if (Number.isFinite(seconds) && seconds > 0) retryAfter = Math.ceil(seconds);
        details = asDetails(parsed.detail?.details);
      } catch {
        // text is already the message
      }
      const apiErr = new ApiError(res.status, message, code, retryAfter, details);
      handleUnauthorized(res.status, path, token, code);
      reportUnexpectedError(apiErr, options?.method, path, requestId);
      throw apiErr;
    }

    // A 204 (or any empty body) has nothing for res.json() to parse -- every
    // DELETE endpoint returns this, and res.json() throws a real
    // "Unexpected end of JSON input" SyntaxError on it in a real browser.
    if (res.status === 204) return undefined as T;
    const raw = await res.text();
    return raw ? JSON.parse(raw) : (undefined as T);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    const apiErr =
      err?.name === 'AbortError'
        ? new ApiError(408, 'Request timeout', 'TIMEOUT')
        : new ApiError(0, err?.message || 'Network error', 'NETWORK_ERROR');
    reportUnexpectedError(apiErr, options?.method, path, requestId);
    throw apiErr;
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
    let code: string | undefined;
    let details: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(text);
      message = formatErrorDetail(parsed.detail, parsed.message || text);
      code = parsed.code ?? parsed.detail?.error_code;
      details = asDetails(parsed.detail?.details);
    } catch {
      // text is already the message
    }
    const apiErr = new ApiError(res.status, message, code, undefined, details);
    handleUnauthorized(res.status, path, token, code);
    reportUnexpectedError(apiErr, 'POST', path);
    throw apiErr;
  }

  if (res.status === 204) return undefined as T;
  const raw = await res.text();
  return raw ? JSON.parse(raw) : (undefined as T);
}
