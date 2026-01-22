'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';

interface SlideTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  duration?: number;
  trigger?: unknown; // Any value that changes to trigger transition
}

/**
 * SlideTransition Component
 *
 * Slides content in/out when trigger value changes.
 * Perfect for wizard steps, tabs, or any sequential content.
 *
 * @example
 * <SlideTransition direction="left" trigger={currentStep}>
 *   <StepContent />
 * </SlideTransition>
 */
export function SlideTransition({
  children,
  direction = 'left',
  className,
  duration = 400,
  trigger,
}: SlideTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setDisplayChildren(children);
      setKey((k) => k + 1);
      return;
    }

    // Start slide out
    setIsVisible(false);

    // After slide out, update content and slide in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setKey((k) => k + 1);
      setIsVisible(true);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [trigger, children, duration]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'left':
        return 'translateX(-20px)';
      case 'right':
        return 'translateX(20px)';
      case 'up':
        return 'translateY(-20px)';
      case 'down':
        return 'translateY(20px)';
      default:
        return 'translate(0, 0)';
    }
  };

  return (
    <div
      key={key}
      className={cn('transition-all ease-out', className)}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {displayChildren}
    </div>
  );
}
