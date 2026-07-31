/** Persian-locale and currency formatting utilities. */

/** Formats a date as a Persian (Jalali) locale string. */
export function formatDatePersian(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fa-IR', options);
}

/** Formats a number using Persian (fa-IR) locale digits. */
export function formatNumberPersian(num: number): string {
  return num.toLocaleString('fa-IR');
}

/**
 * Formats an already-rial amount as a Rial currency string with Persian digits.
 *
 * Every price in the app (product, cart, checkout, admin inputs) is
 * toman-denominated — use {@link formatPrice} for those. This formatter is
 * reserved for the two spots that actually deal in rial: the payment-gateway
 * call and invoice creation. Don't call this on a toman value.
 */
export function formatCurrency(amount: number): string {
  return `${formatNumberPersian(amount)} ریال`;
}

/** Formats a toman amount (the unit every price in this app is stored/entered in) as a Toman currency string with Latin digits. */
export function formatPrice(amount: number): string {
  const numberFormatter = new Intl.NumberFormat('en-US');
  return numberFormatter.format(amount) + ' تومان';
}

/** Truncates text to maxLength characters, appending suffix if truncated. */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/** Formats a countdown in seconds as MM:SS. */
export function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Returns seconds remaining until expiryTime (epoch ms), clamped to 0. */
export function getTimeRemaining(expiryTime: number): number {
  return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
}

/** Returns the initials (up to 2 chars) from a full name. */
export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

/** Capitalises the first character of a string. */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Generates a URL-safe slug from a Persian or Latin text string. */
export function generateSlug(text: string): string {
  return text.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
