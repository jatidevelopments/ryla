'use client';

import Link from 'next/link';
import { cn } from '@ryla/ui';
import {
  UsersIcon,
  PlusCircleIcon,
  PhotoIcon,
  ClockIcon,
  TemplatesIcon,
} from './sidebar-icons';

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
  highlight?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    title: 'My Influencers',
    url: '/dashboard',
    icon: UsersIcon,
    isActive: (pathname: string) => pathname === '/dashboard',
  },
  {
    title: 'Create',
    url: '/wizard/step-0',
    icon: PlusCircleIcon,
    isActive: (pathname: string) => pathname.startsWith('/wizard'),
    highlight: true,
  },
  {
    title: 'Studio',
    url: '/studio',
    icon: PhotoIcon,
    isActive: (pathname: string) => pathname.startsWith('/studio'),
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: TemplatesIcon,
    isActive: (pathname: string) => pathname === '/templates' || pathname.startsWith('/templates'),
  },
  {
    title: 'Activity',
    url: '/activity',
    icon: ClockIcon,
    isActive: (pathname: string) => pathname === '/activity',
  },
];

interface SidebarNavigationProps {
  items: MenuItem[];
  pathname: string;
  isExpanded: boolean;
  onLinkClick: () => void;
}

export function SidebarNavigation({
  items,
  pathname,
  isExpanded,
  onLinkClick,
}: SidebarNavigationProps) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const isActive = item.isActive(pathname || '');
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.url}
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/5 hover:text-white',
              item.highlight &&
                !isActive &&
                'bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15 text-[var(--purple-300)] hover:from-[var(--purple-600)]/25 hover:to-[var(--pink-500)]/25',
              !isExpanded && 'justify-center px-0'
            )}
          >
            <Icon
              className={cn(
                'transition-colors shrink-0',
                isActive
                  ? 'text-[var(--purple-400)]'
                  : item.highlight
                  ? 'text-[var(--purple-400)]'
                  : 'text-white/70'
              )}
            />
            {isExpanded && <span className="truncate">{item.title}</span>}
          </Link>
        );
      })}
    </div>
  );
}

