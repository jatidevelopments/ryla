'use client';

import { cn } from '@/lib/utils';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = '#06b6d4' }: SpotlightProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
    >
      <div
        className="absolute h-[150%] w-[150%] opacity-0"
        style={{
          background: `radial-gradient(ellipse at center, ${fill}40 0%, transparent 70%)`,
          animation: 'spotlight 2s ease 0.75s 1 forwards',
        }}
      />
    </div>
  );
}
