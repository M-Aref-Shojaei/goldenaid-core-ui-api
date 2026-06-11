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
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
            ? 'border-red-300 bg-red-50 focus:ring-red-300'
            : 'border-gray-200 bg-white focus:ring-gray-300 hover:border-gray-300'
          } ${className}`}
      />
      {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
