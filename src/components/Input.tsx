"use client";

import React from 'react';

/** Props for the {@link Input} component. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

/** Labeled text input with optional error and helper text. */
export function Input({ label, error, helper, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-600 mb-1">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
            ? 'border-semantic-red-light bg-semantic-red-extralight focus:ring-semantic-red-light'
            : 'border-neutral-200 bg-neutral-0 focus:ring-neutral-200 hover:border-neutral-300'
          } ${className}`}
      />
      {helper && !error && <p className="mt-1 text-xs text-neutral-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
