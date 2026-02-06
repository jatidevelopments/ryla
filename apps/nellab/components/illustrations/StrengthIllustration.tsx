'use client';

import { cn } from '@/lib/utils';

type Variant = 'innovation' | 'data' | 'scale';

const variants: Record<Variant, React.ReactNode> = {
  innovation: <InnovationGraphic />,
  data: <DataGraphic />,
  scale: <ScaleGraphic />,
};

export function StrengthIllustration({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center p-6', className)} aria-hidden>
      <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full max-h-[140px]">
        {variants[variant]}
      </svg>
    </div>
  );
}

function InnovationGraphic() {
  return (
    <>
      <defs>
        <linearGradient id="str-inn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d="M 120 30 L 140 70 L 120 90 L 100 70 Z" fill="url(#str-inn)" opacity="0.9" className="animate-pulse" />
      <circle cx="120" cy="110" r="20" stroke="var(--nel-accent)" strokeWidth="3" fill="none" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
      <circle cx="120" cy="110" r="12" fill="var(--nel-accent)" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
    </>
  );
}

function DataGraphic() {
  return (
    <>
      <defs>
        <linearGradient id="str-data" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="60" y="80" width="40" height="50" rx="6" fill="url(#str-data)" opacity="0.8" className="animate-pulse" />
      <rect x="110" y="55" width="40" height="75" rx="6" fill="url(#str-data)" opacity="0.9" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <rect x="160" y="35" width="40" height="95" rx="6" fill="url(#str-data)" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </>
  );
}

function ScaleGraphic() {
  return (
    <>
      <defs>
        <linearGradient id="str-scale" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect x="80" y="100" width="80" height="20" rx="4" fill="url(#str-scale)" opacity="0.5" />
      <rect x="70" y="75" width="100" height="20" rx="4" fill="url(#str-scale)" opacity="0.7" className="animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }} />
      <rect x="60" y="50" width="120" height="20" rx="4" fill="url(#str-scale)" opacity="0.9" className="animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
      <rect x="50" y="25" width="140" height="20" rx="4" fill="url(#str-scale)" className="animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
    </>
  );
}
