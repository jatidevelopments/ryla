'use client';

import { cn } from '@/lib/utils';

/**
 * Network / collaboration: nodes and connections with depth, gradient strokes,
 * glow rings, and subtle flow animation.
 */
export function AboutIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="about-node" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent-hover)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--nel-accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="about-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--nel-accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="about-line-vert" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="var(--nel-accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Back layer: soft duplicate connections for depth */}
      <path d="M 80 150 Q 120 140 160 120" stroke="var(--nel-accent)" strokeWidth="3" strokeOpacity="0.08" fill="none" />
      <path d="M 80 150 Q 120 160 160 180" stroke="var(--nel-accent)" strokeWidth="3" strokeOpacity="0.08" fill="none" />
      <path d="M 320 150 Q 280 140 240 120" stroke="var(--nel-accent)" strokeWidth="3" strokeOpacity="0.08" fill="none" />
      <path d="M 320 150 Q 280 160 240 180" stroke="var(--nel-accent)" strokeWidth="3" strokeOpacity="0.08" fill="none" />
      <path d="M 160 120 L 240 120" stroke="var(--nel-accent)" strokeWidth="2" strokeOpacity="0.06" />
      <path d="M 160 180 L 240 180" stroke="var(--nel-accent)" strokeWidth="2" strokeOpacity="0.06" />

      {/* Main connections – curved where it helps, gradient strokes */}
      <path d="M 80 150 Q 120 140 160 120" stroke="url(#about-line)" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-pulse" />
      <path d="M 80 150 Q 120 160 160 180" stroke="url(#about-line)" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
      <path d="M 320 150 Q 280 140 240 120" stroke="url(#about-line)" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <path d="M 320 150 Q 280 160 240 180" stroke="url(#about-line)" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <path d="M 160 120 L 240 120" stroke="url(#about-line-vert)" strokeWidth="1.8" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
      <path d="M 160 180 L 240 180" stroke="url(#about-line-vert)" strokeWidth="1.8" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: '0.3s' }} />

      {/* Flow dash animation on horizontal links */}
      <path
        d="M 160 120 L 240 120"
        stroke="var(--nel-accent)"
        strokeWidth="1"
        strokeDasharray="8 12"
        strokeOpacity="0.6"
        fill="none"
        style={{ animation: 'flow-path 2.5s linear infinite' }}
      />
      <path
        d="M 160 180 L 240 180"
        stroke="var(--nel-accent)"
        strokeWidth="1"
        strokeDasharray="8 12"
        strokeOpacity="0.6"
        fill="none"
        style={{ animation: 'flow-path 2.5s linear infinite', animationDelay: '1.2s' }}
      />

      {/* Glow rings around main nodes */}
      <circle cx="80" cy="150" r="34" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" fill="none" className="animate-pulse" />
      <circle cx="320" cy="150" r="34" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" fill="none" className="animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Nodes – outer fill */}
      <circle cx="80" cy="150" r="24" fill="url(#about-node)" className="animate-pulse" />
      <circle cx="160" cy="120" r="18" fill="url(#about-node)" opacity="0.85" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <circle cx="160" cy="180" r="18" fill="url(#about-node)" opacity="0.85" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="240" cy="120" r="18" fill="url(#about-node)" opacity="0.85" className="animate-pulse" style={{ animationDelay: '0.15s' }} />
      <circle cx="240" cy="180" r="18" fill="url(#about-node)" opacity="0.85" className="animate-pulse" style={{ animationDelay: '0.45s' }} />
      <circle cx="320" cy="150" r="24" fill="url(#about-node)" className="animate-pulse" style={{ animationDelay: '0.35s' }} />

      {/* Inner highlight on each node */}
      <circle cx="80" cy="150" r="8" fill="var(--nel-accent-hover)" opacity="0.5" className="animate-pulse" />
      <circle cx="160" cy="120" r="5" fill="var(--nel-accent-hover)" opacity="0.45" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
      <circle cx="160" cy="180" r="5" fill="var(--nel-accent-hover)" opacity="0.45" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
      <circle cx="240" cy="120" r="5" fill="var(--nel-accent-hover)" opacity="0.45" className="animate-pulse" style={{ animationDelay: '0.25s' }} />
      <circle cx="240" cy="180" r="5" fill="var(--nel-accent-hover)" opacity="0.45" className="animate-pulse" style={{ animationDelay: '0.55s' }} />
      <circle cx="320" cy="150" r="8" fill="var(--nel-accent-hover)" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </svg>
  );
}
