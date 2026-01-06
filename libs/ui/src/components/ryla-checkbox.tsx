'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface RylaCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function RylaCheckbox({
  id,
  checked,
  onChange,
  disabled,
  children,
}: RylaCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3 cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded-md border-2 transition-all duration-200',
            'flex items-center justify-center',
            checked
              ? 'bg-purple-500 border-purple-500'
              : 'border-white/20 group-hover:border-white/40'
          )}
        >
          {checked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-white/60 leading-relaxed">{children}</span>
    </label>
  );
}

