"use client";

import React from 'react';

/** Props for the {@link Alert} component. */
export interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const styles = {
  error:   { wrap: 'bg-semantic-red-extralight border-semantic-red-light text-semantic-red-dark',   icon: '✕' },
  success: { wrap: 'bg-semantic-green-extralight border-semantic-green-light text-semantic-green-dark', icon: '✓' },
  warning: { wrap: 'bg-semantic-yellow-extralight border-semantic-yellow-light text-semantic-yellow-dark', icon: '!' },
  info:    { wrap: 'bg-primary-50 border-primary-200 text-primary-700', icon: 'i' },
};

/** Inline alert banner for error, success, warning, or info messages. */
export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const s = styles[variant];

  return (
    <div className={`flex gap-3 border rounded-xl px-4 py-3 ${s.wrap} ${className}`} role="alert">
      <span className="shrink-0 font-bold text-sm mt-0.5">{s.icon}</span>
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}
