'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { COMPANY, NAV_ANCHORS } from '@/lib/constants';

export function Navigation() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current <= 30 || current < lastScrollY);
      setLastScrollY(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-5 transition-transform duration-300 sm:px-6',
        !visible && '-translate-y-full'
      )}
    >
      <nav
        aria-label="Main navigation"
        className={cn(
          'flex h-14 items-center justify-between gap-6 rounded-full px-6 sm:px-8',
          'border border-[var(--nel-border)]',
          'bg-[var(--nel-bg)]/90 backdrop-blur-md shadow-lg shadow-black/20',
          'supports-[backdrop-filter]:bg-[var(--nel-bg)]/80',
          'w-full max-w-4xl'
        )}
      >
        <Link
          href="/"
          className="text-[18px] font-semibold tracking-tight text-[var(--nel-text)] transition-opacity hover:opacity-90"
        >
          {COMPANY.shortName}
        </Link>
        <div className="flex items-center gap-5 sm:gap-8">
          {NAV_ANCHORS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hidden text-[14px] text-[var(--nel-text-secondary)] transition-colors hover:text-[var(--nel-text)] sm:block"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--nel-text-secondary)] hover:bg-[var(--nel-surface-hover)] hover:text-[var(--nel-text)] sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <a
            href="#contact"
            className="shrink-0 rounded-full border border-[var(--nel-accent)] bg-[var(--nel-accent)]/10 px-5 py-2.5 text-[14px] font-medium text-[var(--nel-accent)] transition-colors hover:bg-[var(--nel-accent)]/20 hover:text-[var(--nel-accent-hover)]"
          >
            Contact
          </a>
        </div>
      </nav>
      <div
        id="mobile-nav-menu"
        role="dialog"
        aria-label="Mobile menu"
        className={cn(
          'fixed inset-0 top-[5.5rem] z-40 bg-[var(--nel-bg)]/95 backdrop-blur-md sm:hidden',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_ANCHORS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-3 text-[17px] text-[var(--nel-text-secondary)] transition-colors hover:bg-[var(--nel-surface-hover)] hover:text-[var(--nel-text)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 rounded-lg px-4 py-3 text-[17px] font-medium text-[var(--nel-accent)] hover:bg-[var(--nel-accent)]/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
