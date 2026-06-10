import { ROLE_NAMES_FA, ROLE_COLORS, STATUS_COLORS, USER_ROLES } from './constants';
import type { UserRole } from '../types/admin';
import type { OrderStatus } from '../types/orders';

type ArticleStatus = 'draft' | 'published';

export function formatDatePersian(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fa-IR', options);
}

export function formatNumberPersian(num: number): string {
  return num.toLocaleString('fa-IR');
}

export function formatCurrency(amount: number): string {
  return `${formatNumberPersian(amount)} ریال`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount) + ' تومان';
}

export function getRoleName(role: UserRole | string): string {
  return (ROLE_NAMES_FA as Record<string, string>)[role] || role;
}

export function getRoleBadgeColor(role: UserRole | string): string {
  return (ROLE_COLORS as Record<string, string>)[role] || ROLE_COLORS[USER_ROLES.USER];
}

export function getStatusBadgeColor(status: ArticleStatus | OrderStatus | string): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
}

export function getArticleStatusName(status: ArticleStatus): string {
  return status === 'published' ? 'منتشر شده' : 'پیش‌نویس';
}

export function getOrderStatusName(status: string): string {
  const names: Record<string, string> = {
    pending: 'در انتظار تایید',
    confirmed: 'تایید شده',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده',
  };
  return names[status] || status;
}

export function generateSlug(text: string): string {
  return text.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function isValidPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export function isValidOTP(otp: string): boolean {
  return /^\d{5,6}$/.test(otp);
}

export function getTimeRemaining(expiryTime: number): number {
  return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
}

export function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function isSessionExpired(loginTime: number, expiryMs: number): boolean {
  return Date.now() - loginTime > expiryMs;
}

export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = { admin: 3, manager: 2, user: 1 };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) return Array.from(new Set(array));
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}
