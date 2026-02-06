'use client';

import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[var(--nel-bg)]',
        className
      )}
    >
      {/* Full-width soft glow so sides don't read as empty */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 120% 70% at 50% 50%, rgba(6, 182, 212, 0.07) 0%, transparent 65%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, transparent 0%, var(--nel-accent) 20%, transparent 40%),
            linear-gradient(to bottom right, transparent 0%, rgba(6, 182, 212, 0.15) 30%, transparent 60%)
          `,
          backgroundSize: '200% 200%',
          animation: 'aurora 60s linear infinite',
        }}
        aria-hidden
      />
      {showRadialGradient && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, var(--nel-bg) 70%)',
          }}
          aria-hidden
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
