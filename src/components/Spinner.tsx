import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
const colors = { primary: 'text-gold', white: 'text-white', gray: 'text-gray-400' };

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

export function SectionSpinner() {
  return (
    <div className="py-12 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
