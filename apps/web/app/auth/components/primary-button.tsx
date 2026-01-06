'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

interface PrimaryButtonProps {
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function PrimaryButton({
  type = 'button',
  onClick,
  disabled,
  loading,
  children,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative w-full h-14 rounded-2xl font-bold text-[15px]',
        'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500',
        'text-white shadow-lg shadow-purple-500/25',
        'transition-all duration-300 overflow-hidden',
        'hover:shadow-purple-500/40 hover:scale-[1.02]',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

