'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-zinc-500 bg-white/5 border-white/10 flex h-10 w-full min-w-0 rounded-md border px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-white/30 focus-visible:ring-white/20 focus-visible:ring-[1px]',
        'text-base md:text-sm leading-5 text-white',
        className
      )}
      {...props}
    />
  );
}

export { Input };

