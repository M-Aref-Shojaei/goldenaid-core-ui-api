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
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
            ? 'border-red-300 bg-red-50 focus:ring-red-300'
            : 'border-gray-200 focus:ring-gray-300 hover:border-gray-300'
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
