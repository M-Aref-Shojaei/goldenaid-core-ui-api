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

/** Returns true if value is null, undefined, empty string, empty array, or empty object. */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}
