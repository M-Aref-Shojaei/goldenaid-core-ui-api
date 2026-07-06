"use client";

import React from 'react';

/** Props for the {@link Badge} component. */
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-neutral-75 text-neutral-600',
  success: 'bg-semantic-green-extralight text-semantic-green-dark',
  warning: 'bg-semantic-yellow-extralight text-semantic-yellow-dark',
  danger:  'bg-semantic-red-extralight text-semantic-red-dark',
  info:    'bg-primary-50 text-primary-700',
  purple:  'bg-purple-100 text-purple-700',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-3 py-1',
};

/** Small status/label pill with color variants. */
export function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
