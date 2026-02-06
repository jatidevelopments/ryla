'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}

export function BackgroundGradientAnimation({
  gradientBackgroundStart = 'rgb(0, 0, 0)',
  gradientBackgroundEnd = 'rgb(0, 10, 30)',
  firstColor = '18, 113, 255',
  secondColor = '6, 182, 212',
  thirdColor = '100, 220, 255',
  fourthColor = '200, 50, 50',
  fifthColor = '180, 180, 50',
  pointerColor = '140, 100, 255',
  size = '80%',
  blendingValue = 'hard-light',
  children,
  className,
  interactive = true,
  containerClassName,
}: BackgroundGradientAnimationProps) {
  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', containerClassName)}
    >
      <div
        className={cn('absolute inset-0 h-full w-full', className)}
        style={{
          background: `linear-gradient(to bottom, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
        }}
      >
        <div
          className="absolute opacity-40"
          style={{
            width: size,
            height: size,
            top: '20%',
            left: '20%',
            background: `radial-gradient(circle at 50% 50%, rgba(${firstColor}, 0.3), transparent 50%)`,
            mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            animation: 'var(--animate-first)',
          }}
        />
        <div
          className="absolute opacity-40"
          style={{
            width: size,
            height: size,
            top: '60%',
            left: '60%',
            background: `radial-gradient(circle at 50% 50%, rgba(${secondColor}, 0.3), transparent 50%)`,
            mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            animation: 'var(--animate-second)',
          }}
        />
        <div
          className="absolute opacity-40"
          style={{
            width: size,
            height: size,
            top: '40%',
            left: '70%',
            background: `radial-gradient(circle at 50% 50%, rgba(${thirdColor}, 0.25), transparent 50%)`,
            mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            animation: 'var(--animate-third)',
          }}
        />
        <div
          className="absolute opacity-40"
          style={{
            width: size,
            height: size,
            top: '70%',
            left: '20%',
            background: `radial-gradient(circle at 50% 50%, rgba(${fourthColor}, 0.2), transparent 50%)`,
            mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            animation: 'var(--animate-fourth)',
          }}
        />
        <div
          className="absolute opacity-40"
          style={{
            width: size,
            height: size,
            top: '30%',
            left: '50%',
            background: `radial-gradient(circle at 50% 50%, rgba(${fifthColor}, 0.2), transparent 50%)`,
            mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            animation: 'var(--animate-fifth)',
          }}
        />
        {interactive && (
          <div
            className="pointer-events-none absolute size-64 opacity-30"
            style={{
              background: `radial-gradient(circle, rgba(${pointerColor}, 0.4) 0%, transparent 70%)`,
              mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
            }}
          />
        )}
      </div>
      {children && (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
