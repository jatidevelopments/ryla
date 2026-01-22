'use client';

import { cn } from '../lib/utils';
import { Skeleton } from './skeleton';

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'image';
  shimmer?: boolean;
  lines?: number;
}

/**
 * EnhancedSkeleton Component
 *
 * Enhanced skeleton loading states with shimmer effects.
 * Provides multiple variants for different content types.
 *
 * @example
 * <EnhancedSkeleton variant="card" shimmer />
 * <EnhancedSkeleton variant="text" lines={3} />
 */
export function EnhancedSkeleton({
  variant = 'default',
  shimmer = true,
  lines = 1,
  className,
  ...props
}: EnhancedSkeletonProps) {
  const baseClasses = cn(
    'relative overflow-hidden',
    shimmer && 'animate-shimmer',
    className
  );

  // Shimmer overlay
  const shimmerOverlay = shimmer && (
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
      }}
    />
  );

  switch (variant) {
    case 'card':
      return (
        <div className={cn('rounded-2xl', baseClasses)} {...props}>
          <Skeleton className="h-full w-full" />
          {shimmerOverlay}
        </div>
      );

    case 'text':
      return (
        <div className={cn('space-y-2', baseClasses)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="relative">
              <Skeleton
                className={cn(
                  'h-4 w-full',
                  i === lines - 1 && 'w-3/4' // Last line shorter
                )}
              />
              {shimmer && (
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{
                    animation: 'shimmer 2s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );

    case 'avatar':
      return (
        <div className={cn('rounded-full', baseClasses)} {...props}>
          <Skeleton className="h-full w-full aspect-square" />
          {shimmerOverlay}
        </div>
      );

    case 'image':
      return (
        <div className={cn('rounded-lg', baseClasses)} {...props}>
          <Skeleton className="h-full w-full aspect-[4/5]" />
          {shimmerOverlay}
        </div>
      );

    default:
      return (
        <div className={baseClasses} {...props}>
          <Skeleton className="h-full w-full" />
          {shimmerOverlay}
        </div>
      );
  }
}
