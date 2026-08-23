"use client";

import React from 'react';

/** Props for the {@link Skeleton} component. */
export interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundeds = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full' };

/** Animated grey placeholder block for loading states. */
export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-neutral-100 dark:bg-neutral-700 ${roundeds[rounded]} ${className}`} />
  );
}

/** Props for the {@link SkeletonText} component. */
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** Multi-line text skeleton with a shorter last line. */
export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** Props for the {@link SkeletonCard} component. */
export interface SkeletonCardProps {
  className?: string;
}

/** Skeleton placeholder matching the shape of a product card. */
export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-neutral-0 dark:bg-dark-card rounded-2xl border border-neutral-75 dark:border-neutral-700 p-4 space-y-3 ${className}`}>
      <Skeleton className="h-40 w-full" rounded="lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/** Props for the {@link SkeletonTable} component. */
export interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

/** Grid-based skeleton matching a table layout. */
export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}
