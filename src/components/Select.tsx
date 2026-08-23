"use client";

import React from 'react';

/** A single option entry for {@link Select}. */
export interface SelectOption {
  value: string;
  label: string;
}

/** Props for the {@link Select} component. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
}

/** Labeled native select with optional placeholder, error, and helper text. */
export function Select({ label, error, helper, options, placeholder, id, className = '', ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        id={inputId}
        className={`w-full rounded-field border px-4 py-2.5 text-sm bg-neutral-0 dark:bg-dark-card text-dark dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
            ? 'border-semantic-red-light bg-semantic-red-extralight focus:ring-semantic-red-light'
            : 'border-neutral-200 dark:border-neutral-600 focus:ring-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-500'
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {helper && !error && <p className="mt-1 text-xs text-neutral-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
