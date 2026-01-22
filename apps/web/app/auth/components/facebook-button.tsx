'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

interface FacebookButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FacebookButton({ onClick, disabled }: FacebookButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-[52px] rounded-xl font-semibold text-sm',
        'bg-white/[0.04] border border-white/[0.08]',
        'text-white/90',
        'transition-all duration-200',
        'hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-0.5',
        'active:translate-y-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        'flex items-center justify-center gap-3'
      )}
    >
      <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center">
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </div>
      Continue with Facebook
    </button>
  );
}
