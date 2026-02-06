'use client';

import { cn } from '@/lib/utils';

interface BackgroundBeamsProps {
  className?: string;
}

/** Single soft gradient from bottom (accent tint) to transparent. */
export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{
        background:
          'linear-gradient(to top, rgba(6, 182, 212, 0.08) 0%, rgba(6, 182, 212, 0.02) 40%, transparent 70%)',
      }}
      aria-hidden
    />
  );
}
