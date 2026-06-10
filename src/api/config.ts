const DEFAULT_BASE_URL = 'http://localhost:8000/api/v1';

export const API_CONFIG = {
  get BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
  },
  TIMEOUT: 30_000,
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  PHONE: 'phone',
  USER_NAME: 'userName',
  ROLE: 'role',
  CART: 'cart',
} as const;
