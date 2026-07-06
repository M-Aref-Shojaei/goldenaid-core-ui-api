"use client";

import React from 'react';

/** Props for the {@link BackButton} component. */
export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/** Back navigation button rendered as `<a>` when `href` is provided, otherwise `<button>`. */
export function BackButton({ label = 'Back', onClick, href, className = '' }: BackButtonProps) {
  const cls = `inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-dark transition-colors ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        <span aria-hidden>←</span>
        {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
