'use client';

import React, { useEffect } from 'react';

/** Props for the {@link Drawer} component. */
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-64', md: 'w-80', lg: 'w-96' };

/** Slide-in panel from left or right with Escape-key dismiss. */
export function Drawer({ open, onClose, title, children, side = 'right', size = 'md', className = '' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`absolute top-0 bottom-0 ${side === 'right' ? 'right-0' : 'left-0'} ${sizes[size]}
          bg-white shadow-xl flex flex-col transition-transform duration-300
          ${open
            ? 'translate-x-0'
            : side === 'right' ? 'translate-x-full' : '-translate-x-full'
          } ${className}`}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
