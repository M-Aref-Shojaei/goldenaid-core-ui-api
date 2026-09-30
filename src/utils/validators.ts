/** Input validation utilities for phone numbers, OTP codes, and session state. */

/** Returns true if phone matches the Iranian mobile format (09xxxxxxxxx). */
export function isValidPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

/** Returns true if OTP is a 5- or 6-digit numeric string. */
export function isValidOTP(otp: string): boolean {
  return /^\d{5,6}$/.test(otp);
}

/** Returns true if the session started at loginTime has exceeded expiryMs milliseconds. */
export function isSessionExpired(loginTime: number, expiryMs: number): boolean {
  return Date.now() - loginTime > expiryMs;
}

function tokenClaimMs(token: string, claim: 'exp' | 'iat'): number | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const v = JSON.parse(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')))[claim];
    return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v * 1000 : null;
  } catch {
    return null;
  }
}

/** Reads the `exp` claim (ms epoch) from a JWT payload without verifying it; null if absent or malformed. */
export function getTokenExpiryMs(token: string): number | null {
  return tokenClaimMs(token, 'exp');
}

/** Log out this long before the token's end to avoid in-flight 401s. */
export const SESSION_SAFETY_MARGIN_MS = 30 * 1000;

/**
 * Local session deadline (ms epoch), immune to client clock skew when the token has `iat`:
 * nowMs + (exp - iat) - margin. Without `iat` it uses `exp` against the client clock; without
 * `exp` it uses nowMs + fallbackMs (legacy client cap). Margin is capped at half the lifetime.
 */
export function getSessionDeadlineMs(token: string, nowMs: number, fallbackMs: number): number {
  const exp = tokenClaimMs(token, 'exp');
  if (exp === null) return nowMs + fallbackMs;
  const iat = tokenClaimMs(token, 'iat');
  const end = iat !== null && exp > iat ? nowMs + (exp - iat) : exp;
  const life = end - nowMs;
  return end - Math.min(SESSION_SAFETY_MARGIN_MS, Math.max(life, 0) / 2);
}

/** Returns true if value is null, undefined, empty string, empty array, or empty object. */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}
