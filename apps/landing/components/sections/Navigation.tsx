'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Navigation Component
 *
 * Mobbin-style glassy floating header.
 * Starts compact, expands on scroll.
 */
export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-6">
      <nav
        className={cn(
          'flex items-center justify-between',
          'px-6 h-14',
          'rounded-full',
          'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Transparent background
          'bg-transparent',
          'border border-white/20',
          'shadow-lg shadow-black/5',
          // Hover state
          'hover:border-white/30',
          // Width transition: compact initially, expands on scroll
          isScrolled
            ? 'w-full max-w-4xl border-white/25 shadow-xl shadow-black/10'
            : 'w-auto max-w-sm'
        )}
        style={{ willChange: 'width, background-color, border-color' }}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src="/logos/Ryla_Logo_white.png"
            alt="RYLA"
            className="h-6 w-auto"
          />
        </a>

        {/* Right side - Nav links + CTA */}
        <div className="flex items-center gap-6 ml-10">
          {/* Desktop Navigation Links - only show when expanded */}
          <div
            className={cn(
              'hidden md:flex items-center gap-6',
              'transition-all duration-700',
              isScrolled ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            )}
          >
            <a
              href="#features"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              Pricing
            </a>
          </div>

          {/* Join Waitlist link */}
          <a
            href="#waitlist"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById('waitlist')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Join Waitlist
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
