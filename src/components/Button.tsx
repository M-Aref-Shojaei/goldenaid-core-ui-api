"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDirection, type Direction } from '../hooks/useDirection';

/** Props for the {@link Button} component. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  /**
   * Shows the design system's trailing directional chevron (TASK-147).
   * Points left in RTL contexts and right in LTR contexts, matching the
   * reading direction's "forward" motion. Defaults to `true` — pass
   * `false` for icon-only buttons, or actions that aren't forward
   * navigation (e.g. destructive/cancel actions).
   */
  showArrow?: boolean;
  /**
   * Overrides the auto-detected text direction used to pick the chevron.
   * When omitted, direction is read from `document.documentElement.dir`
   * (defaults to `"rtl"` during SSR, matching this project's default).
   */
  dir?: Direction;
}

const base =
  'inline-flex items-center justify-center font-bold rounded-button border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-gold border-gold text-white hover:bg-gold-dark hover:border-gold-dark focus:ring-gold',
  secondary: 'bg-dark-card border-gold text-white hover:bg-neutral-700 focus:ring-neutral-600',
  outline:   'bg-transparent border-gold text-gold hover:bg-gold/10 focus:ring-gold',
  ghost:     'bg-transparent border-transparent text-neutral-500 dark:text-neutral-300 hover:bg-neutral-75 dark:hover:bg-dark-card focus:ring-neutral-100',
  danger:    'bg-error border-error text-white hover:bg-semantic-red-dark focus:ring-semantic-red',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

const arrowSizes: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/**
 * Multi-variant button with loading spinner support and the shared
 * rounded / gold-border / directional-chevron style (TASK-147).
 *
 * The trailing chevron auto-flips between `ChevronLeft` (RTL) and
 * `ChevronRight` (LTR) so a single component works correctly regardless of
 * the page's text direction — pass `showArrow={false}` to omit it.
 *
 * @example
 * <Button variant="primary">ثبت سفارش</Button>
 * <Button variant="outline" showArrow={false}>لغو</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  showArrow = true,
  dir: dirProp,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const detectedDir = useDirection();
  const dir = dirProp ?? detectedDir;
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
      {showArrow && !loading && (
        <ArrowIcon size={arrowSizes[size]} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
