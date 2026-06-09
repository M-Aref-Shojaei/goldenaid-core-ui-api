'use client';

import React, { useState } from 'react';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ items, defaultKey, onChange, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key);

  const select = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  const activeItem = items.find((t) => t.key === active);

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {items.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && select(tab.key)}
            disabled={tab.disabled}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${active === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              ${tab.disabled ? 'opacity-40 pointer-events-none' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{activeItem?.content}</div>
    </div>
  );
}
