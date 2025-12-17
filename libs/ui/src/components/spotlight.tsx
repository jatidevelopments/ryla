'use client';

import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill }: SpotlightProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute h-[169%] w-[138%] lg:-top-40 lg:-left-10',
        className
      )}
    >
      <svg
        className="absolute left-0 top-0 h-full w-full"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <defs>
          <radialGradient
            id="spotlight"
            cx="50%"
            cy="50%"
            fx="50%"
            fy="50%"
            r="50%"
          >
            <stop stopColor={fill || 'white'} stopOpacity="0" />
            <stop stopColor={fill || 'white'} stopOpacity="0.1" />
            <stop stopColor={fill || 'white'} stopOpacity="0.05" />
            <stop stopColor={fill || 'white'} stopOpacity="0.01" />
          </radialGradient>
        </defs>
        <rect width="16" height="16" fill="url(#spotlight)" fillOpacity="0" />
      </svg>
    </div>
  );
}

export default Spotlight;
