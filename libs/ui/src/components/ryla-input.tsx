'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface RylaInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  error?: boolean;
  success?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RylaInput = React.forwardRef<HTMLInputElement, RylaInputProps>(
  (
    {
      id,
      type,
      placeholder,
      value,
      onChange,
      onBlur,
      onKeyDown,
      disabled,
      error,
      success,
      className,
      autoFocus,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        className={cn(
          'w-full h-14 px-5 rounded-2xl',
          'bg-white/[0.03] backdrop-blur-sm',
          'border-2 transition-all duration-300',
          'text-white placeholder:text-white/30',
          'focus:outline-none focus:ring-0',
          'font-medium text-[15px]',
          disabled && 'opacity-50 cursor-not-allowed',
          error
            ? 'border-red-500/50 focus:border-red-500'
            : success
            ? 'border-emerald-500/50 focus:border-emerald-500'
            : 'border-white/10 focus:border-purple-500/70 hover:border-white/20',
          className
        )}
        {...props}
      />
    );
  }
);

RylaInput.displayName = 'RylaInput';

