'use client';

import { cn } from '@/lib/utils';

/** Envelope + rays – get in touch. */
export function ContactIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="contact-envelope" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--nel-accent)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--nel-accent)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* Rays */}
      <path d="M 200 150 L 200 60" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" />
      <path d="M 200 150 L 200 240" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <path d="M 200 150 L 100 150" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
      <path d="M 200 150 L 300 150" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
      <path d="M 200 150 L 130 90" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M 200 150 L 270 90" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M 200 150 L 130 210" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M 200 150 L 270 210" stroke="var(--nel-accent)" strokeWidth="1" strokeOpacity="0.2" />
      {/* Envelope shape */}
      <path
        d="M 120 100 L 200 160 L 280 100 L 280 220 L 120 220 Z"
        fill="none"
        stroke="url(#contact-envelope)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 120 100 L 200 160 L 280 100" fill="none" stroke="var(--nel-accent)" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="200" cy="150" r="16" fill="var(--nel-accent)" opacity="0.2" className="animate-pulse" />
    </svg>
  );
}
