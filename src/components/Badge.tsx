"use client";

import React from 'react';

/** Props for the {@link Badge} component. */
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'accent';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-neutral-75 dark:bg-dark-card text-neutral-600 dark:text-neutral-300',
  success: 'bg-semantic-green-extralight text-semantic-green-dark',
  warning: 'bg-semantic-yellow-extralight text-semantic-yellow-dark',
  danger:  'bg-semantic-red-extralight text-semantic-red-dark',
  info:    'bg-primary-50 text-primary-700',
  purple:  'bg-purple-100 text-purple-700',
  /** DS Badge tone "accent" (secondary), e.g. the POS «هدیه» gift badge.
   *  Deliberate deviation: the DS pairs secondary-100 with secondary-700
   *  (3.74:1, below AA; known DS debt); 800 gives 4.76:1. */
  accent:  'bg-secondary-100 text-secondary-800',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-3 py-1',
};

/** Small status/label pill with color variants. */
export function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-badge ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
