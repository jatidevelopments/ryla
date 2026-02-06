'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Lamp effect for section headers, as seen on Linear.
 * Renders a soft radial glow from the top over the content.
 * @see https://ui.aceternity.com/components/lamp-effect
 */
export function LampContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative w-full', className)}>
      {/* Lamp glow from top */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-[40%] h-[80%] w-full"
        aria-hidden
      >
        <div
          className="absolute inset-0 h-full w-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% -20%, rgba(6, 182, 212, 0.4) 0%, transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
