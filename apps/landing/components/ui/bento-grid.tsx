'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[14rem] grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  description: string;
  href?: string;
  cta?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  background?: ReactNode;
  className?: string;
  animationDelay?: number;
}

export function BentoCard({
  name,
  description,
  href,
  cta,
  Icon,
  iconColor = 'text-purple-400',
  background,
  className,
  animationDelay = 0,
}: BentoCardProps) {
  iconColor = 'text-purple-400';
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      key={name}
      className={cn(
        'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl',
        // Dark purple theme
        'bg-[#0d0d12] border border-purple-500/20',
        // Hover effects
        'transform-gpu transition-all duration-300',
        'hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10',
        // Animation
        'transition-all duration-600',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      style={{
        transitionDelay: isVisible ? `${animationDelay}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Background element */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {background}
      </div>

      {/* Icon at top */}
      {Icon && (
        <div className="pointer-events-none z-10 absolute top-6 left-6">
          <Icon
            className={cn(
              'h-12 w-12 transition-all duration-300 ease-in-out group-hover:scale-75',
              iconColor
            )}
          />
        </div>
      )}

      {/* Content at bottom */}
      <div className="pointer-events-none z-10 absolute bottom-0 left-0 right-0 flex flex-col gap-1 p-6 transition-all duration-300">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="max-w-lg text-white/60">{description}</p>
      </div>

      {/* CTA */}
      {cta && href && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-6 left-6 right-6 translate-y-2 flex flex-row items-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'
          )}
        >
          <a
            href={href}
            className="pointer-events-auto inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            {cta}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Bottom gradient fade - purple tinted */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/80 to-transparent" />
    </div>
  );
}
