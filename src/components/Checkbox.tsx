"use client";

import React from 'react';

/** Props for the {@link Checkbox} component. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/** Labeled checkbox with optional error message. */
export function Checkbox({ label, error, id, className = '', ...props }: CheckboxProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer">
        <input
          {...props}
          type="checkbox"
          id={inputId}
          className={`w-4 h-4 rounded border-neutral-200 dark:border-neutral-600 text-gold focus:ring-gold ${className}`}
        />
        {label && <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>}
      </label>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
