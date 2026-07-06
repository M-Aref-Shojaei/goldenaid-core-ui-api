"use client";

import React from 'react';

/** A single crumb entry for {@link Breadcrumb}. */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Props for the {@link Breadcrumb} component. */
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Accessible breadcrumb nav; last item is rendered as plain text. */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={`flex items-center gap-1 text-sm text-neutral-400 ${className}`}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-neutral-200">/</span>}
          {item.href && i < items.length - 1 ? (
            <a href={item.href} className="hover:text-neutral-600 transition-colors">{item.label}</a>
          ) : (
            <span className={i === items.length - 1 ? 'text-dark font-medium' : ''}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
