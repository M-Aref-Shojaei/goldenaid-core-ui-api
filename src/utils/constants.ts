import type { UserRole } from '../types/admin';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WRITER: 'writer',
  USER: 'user',
} as const;

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const SESSION_CONFIG = {
  EXPIRE_MS: 15 * 60 * 1000,
  CHECK_INTERVAL_MS: 60 * 1000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const VALIDATION = {
  ARTICLE_EXCERPT_MAX_LENGTH: 200,
  PRODUCT_NAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PHONE_PATTERN: /^09\d{9}$/,
  OTP_LENGTH: 5,
  OTP_VALIDITY_SECONDS: 120,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  ADDRESSES: '/dashboard/addresses',
  ORDERS: '/orders',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PRODUCTS: '/products',
  ARTICLES: '/articles',
  CONTACT: '/contact',
  ABOUT: '/about',
  TERMS: '/terms',
  SUPPORT: '/support',
  ADMIN: {
    HOME: '/admin',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    ARTICLES: '/admin/articles',
    USERS: '/admin/users',
    CAMPAIGNS: '/admin/campaigns',
  },
} as const;

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  writer: 'bg-purple-100 text-purple-700 border-purple-200',
  user: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const ROLE_NAMES_FA: Record<UserRole, string> = {
  admin: 'مدیر کل',
  manager: 'مدیر',
  writer: 'نویسنده',
  user: 'کاربر عادی',
};

export const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
