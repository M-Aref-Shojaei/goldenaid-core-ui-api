const DEFAULT_BASE_URL = 'http://localhost:8000/api/v1';

/** API base URL and request timeout (30 s). Reads `NEXT_PUBLIC_API_BASE_URL` at runtime. */
export const API_CONFIG = {
  get BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
  },
  TIMEOUT: 30_000,
} as const;

/** localStorage key names used across the auth and cart systems. */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  PHONE: 'phone',
  USER_NAME: 'userName',
  ROLE: 'role',
  CART: 'cart',
} as const;
