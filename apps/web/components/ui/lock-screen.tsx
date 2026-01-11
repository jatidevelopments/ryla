'use client';

import * as React from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { FadeInUp } from '@ryla/ui';
import { cn } from '@ryla/ui';

interface LockScreenProps {
  title: string;
  description: string;
  createButtonText?: string;
  createButtonHref?: string;
  className?: string;
}

export function LockScreen({
  title,
  description,
  createButtonText = 'Create Influencer',
  createButtonHref = '/wizard/step-0',
  className,
}: LockScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] text-center px-4',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] opacity-40 shrink-0"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute -bottom-[10%] -left-[5%] h-[600px] w-[600px] opacity-30 shrink-0"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <FadeInUp>
        <div className="relative z-10 flex flex-col items-center max-w-md">
          {/* Lock Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20 shadow-lg">
            <Lock className="h-10 w-10 text-[var(--purple-400)]" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-3">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md">
            {description}
          </p>

          {/* CTA Button */}
          <Link
            href={createButtonHref}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-600)] text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-5 w-5" />
            {createButtonText}
          </Link>
        </div>
      </FadeInUp>
    </div>
  );
}

