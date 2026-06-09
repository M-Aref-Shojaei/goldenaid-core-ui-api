import React from 'react';

export interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const styles = {
  error:   { wrap: 'bg-red-50 border-red-200 text-red-700',   icon: '✕' },
  success: { wrap: 'bg-green-50 border-green-200 text-green-700', icon: '✓' },
  warning: { wrap: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: '!' },
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-700', icon: 'i' },
};

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
