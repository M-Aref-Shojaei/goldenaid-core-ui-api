"use client";

import React from 'react';

/** Props for the {@link Pagination} component. */
export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Numbered page navigation bar; renders nothing when totalPages ≤ 1. */
export function Pagination({ page, totalPages, onChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-75 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
            ${p === page
              ? 'bg-gold text-black font-bold'
              : 'text-neutral-500 hover:bg-neutral-75'
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-75 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        ›
      </button>
    </div>
  );
}
