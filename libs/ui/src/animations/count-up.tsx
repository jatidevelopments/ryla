'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
  separator?: string;
}

/**
 * CountUp Animation Component
 *
 * Animates a number from 0 to the target value when scrolled into view.
 * Supports prefix, suffix, decimals, and thousand separators.
 *
 * @example
 * <CountUp value={10000} suffix="+" /> // Displays "10,000+"
 * <CountUp value={500000} prefix="$" suffix="+" /> // Displays "$500,000+"
 */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  className,
  decimals = 0,
  separator = ',',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setCount(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, hasAnimated]);

  const animateCount = () => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  return (
    <span ref={ref} className={cn('font-mono tabular-nums', className)}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default CountUp;
