'use client';

import { cn } from '@/lib/utils';

/**
 * Hero graphic: layered orbital system with core, rings, orbiting nodes, and radial rays.
 * More distinctive than a single arc – suggests AI, systems, and scale.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const cx = 200;
  const cy = 150;

  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.5" />
          <stop offset="70%" stopColor="var(--nel-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-ring-bright" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent-hover)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="hero-ring-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hero-ring-soft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="hero-ray" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Radial rays – subtle burst */}
      <g opacity="0.9">
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x2 = cx + 140 * Math.cos(angle);
          const y2 = cy + 140 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="var(--nel-accent)"
              strokeWidth="0.5"
              strokeOpacity="0.12"
            />
          );
        })}
      </g>

      {/* Outer ring – dashed, slow spin */}
      <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle
          cx={cx}
          cy={cy}
          r="115"
          stroke="url(#hero-ring-soft)"
          strokeWidth="2"
          strokeDasharray="8 12"
          fill="none"
          style={{ animation: 'spin 35s linear infinite' }}
        />
      </g>

      {/* Middle ring – solid segments (3 segments with gaps) */}
      <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <path
          d={`M ${cx + 85} ${cy} A 85 85 0 0 1 ${cx + 59} ${cy + 59}`}
          stroke="url(#hero-ring-bright)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          style={{ animation: 'spin 18s linear infinite' }}
        />
        <path
          d={`M ${cx - 59} ${cy + 59} A 85 85 0 0 1 ${cx - 85} ${cy}`}
          stroke="url(#hero-ring-mid)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          style={{ animation: 'spin 18s linear infinite' }}
        />
        <path
          d={`M ${cx - 85} ${cy} A 85 85 0 0 1 ${cx - 59} ${cy - 59}`}
          stroke="url(#hero-ring-soft)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          style={{ animation: 'spin 18s linear infinite' }}
        />
      </g>

      {/* Orbiting nodes on the middle ring */}
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'spin 18s linear infinite' }}>
        <circle cx={cx + 85} cy={cy} r="4" fill="var(--nel-accent)" opacity="0.9" className="animate-pulse" />
        <circle cx={cx - 59} cy={cy + 59} r="3" fill="var(--nel-accent-hover)" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <circle cx={cx - 85} cy={cy} r="3" fill="var(--nel-accent)" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </g>

      {/* Inner dashed ring – reverse spin */}
      <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle
          cx={cx}
          cy={cy}
          r="48"
          stroke="url(#hero-ring-mid)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          fill="none"
          style={{ animation: 'spin 22s linear infinite reverse' }}
        />
      </g>

      {/* Central core – gradient + pulse */}
      <circle cx={cx} cy={cy} r="32" fill="url(#hero-core)" className="animate-pulse" />
      <circle cx={cx} cy={cy} r="12" fill="var(--nel-accent)" opacity="0.5" className="animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
    </svg>
  );
}
