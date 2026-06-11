import React from 'react';

/** Props for the {@link EmptyState} component. */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/** Centered placeholder for empty list/table states, with optional icon and CTA. */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <p className="text-gray-700 font-semibold text-lg">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center px-5 py-2.5 bg-gold text-black text-sm font-bold rounded-xl hover:bg-gold/90 transition-colors"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-5 py-2.5 bg-gold text-black text-sm font-bold rounded-xl hover:bg-gold/90 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
