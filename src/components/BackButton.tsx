import React from 'react';

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function BackButton({ label = 'Back', onClick, href, className = '' }: BackButtonProps) {
  const cls = `inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors ${className}`;

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
