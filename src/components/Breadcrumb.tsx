import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-gray-300">/</span>}
          {item.href && i < items.length - 1 ? (
            <a href={item.href} className="hover:text-gray-700 transition-colors">{item.label}</a>
          ) : (
            <span className={i === items.length - 1 ? 'text-gray-900 font-medium' : ''}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
