import { ROLE_NAMES_FA, ROLE_COLORS, STATUS_COLORS, USER_ROLES } from './constants';
import type { UserRole } from '../types/admin';

type ArticleStatus = 'draft' | 'published';

/** Returns the Persian display name for a user role. */
export function getRoleName(role: UserRole | string): string {
  return (ROLE_NAMES_FA as Record<string, string>)[role] || role;
}

/** Returns the Tailwind badge colour classes for a user role. */
export function getRoleBadgeColor(role: UserRole | string): string {
  return (ROLE_COLORS as Record<string, string>)[role] || ROLE_COLORS[USER_ROLES.USER];
}

/** Returns the Tailwind badge colour classes for an article or order status value. */
export function getStatusBadgeColor(status: ArticleStatus | string): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
}

/** Returns the Persian display name for an article status. */
export function getArticleStatusName(status: ArticleStatus): string {
  return status === 'published' ? 'منتشر شده' : 'پیش‌نویس';
}

/** Maps an order status value to its Persian display name. */
export function getOrderStatusName(status: string): string {
  const names: Record<string, string> = {
    SUBMITTED: 'ثبت شده',
    RESERVED: 'موجودی رزرو شده',
    AWAITING_PAYMENT: 'در انتظار پرداخت',
    CONFIRMED: 'تأیید شده',
    REJECTED: 'رد شده',
    PAYMENT_FAILED: 'پرداخت ناموفق',
    CANCELLED: 'لغو شده',
  };
  return names[status] || status;
}

/** Returns true if userRole meets or exceeds the required role in the hierarchy. */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = { admin: 3, manager: 2, writer: 1, user: 1 };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/** Calculates what percentage value is of total, returning 0 if total is 0. */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
