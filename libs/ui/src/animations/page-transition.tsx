'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 *
 * Provides smooth fade transitions between route changes.
 * Automatically detects pathname changes and animates content.
 *
 * @example
 * <PageTransition>
 *   {children}
 * </PageTransition>
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    // Start fade out
    setIsTransitioning(true);

    // After fade out, update content and fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150); // Half of transition duration

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-out',
        isTransitioning ? 'opacity-0' : 'opacity-100',
        className
      )}
    >
      {displayChildren}
    </div>
  );
}
