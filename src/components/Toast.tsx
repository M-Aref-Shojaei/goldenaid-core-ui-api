"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';

/** Severity level for a toast notification. */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/** An individual toast notification entry managed by {@link ToastProvider}. */
export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastVariant, string> = {
  success: 'bg-semantic-green-extralight border-semantic-green-light text-semantic-green-dark',
  error:   'bg-semantic-red-extralight border-semantic-red-light text-semantic-red-dark',
  warning: 'bg-semantic-yellow-extralight border-semantic-yellow-light text-semantic-yellow-dark',
  info:    'bg-primary-50 border-primary-200 text-primary-700',
};

const icons: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  warning: '!',
  info:    'i',
};

/** Provides the toast context and renders auto-dismissing toast stack. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-20 inset-x-4 z-[60] flex flex-col items-center gap-2 pointer-events-none"
        role="region"
        aria-label="اعلان‌ها"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border rounded-xl px-4 py-3 shadow-lg ${styles[t.variant]}`}
          >
            <span className="font-bold text-sm shrink-0 mt-0.5">{icons[t.variant]}</span>
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns the toast trigger function from the nearest {@link ToastProvider}. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
