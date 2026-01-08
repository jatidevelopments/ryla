'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface NavItemProps {
  href: string;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
  hidden?: boolean;
}

export function NavItem({
  href,
  isActive,
  icon: Icon,
  activeIcon: ActiveIcon,
  label,
  highlight = false,
  hidden = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center min-w-0 h-14"
      style={{
        flex: '1 1 0%',
        display: hidden ? 'none' : 'flex',
        textDecoration: 'none',
      }}
      aria-label={label}
    >
      <div
        className={cn(
          'transition-colors duration-200 flex flex-col items-center'
        )}
      >
        {isActive ? (
          <ActiveIcon className={cn('w-6 h-6 text-[var(--purple-400)]')} />
        ) : (
          <Icon className={cn('w-6 h-6 text-white/50')} />
        )}

        {/* Subtle pill indicator below icon */}
        <div
          className={cn(
            'mt-1 h-1 rounded-full transition-all duration-300 ease-out',
            isActive ? 'w-4 bg-[var(--purple-500)]' : 'w-0 bg-transparent'
          )}
        />
      </div>
    </Link>
  );
}
