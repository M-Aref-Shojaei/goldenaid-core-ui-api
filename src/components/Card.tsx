"use client";

import React from 'react';

/** Props for the {@link Card} component. */
export interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

/** White rounded container card with optional hover effect. */
export function Card({ children, padding = 'md', hover = false, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-neutral-0 rounded-2xl border border-neutral-75 shadow-sm
        ${paddings[padding]}
        ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}
