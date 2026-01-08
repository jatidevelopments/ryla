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
import { motion, AnimatePresence } from 'framer-motion';

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
    isActive: (pathname: string) =>
      pathname === '/templates' || pathname.startsWith('/templates'),
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
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = item.isActive(pathname || '');
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.url}
            onClick={onLinkClick}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
              isActive ? 'text-white' : 'text-white/60 hover:text-white',
              item.highlight && !isActive && 'text-[var(--purple-300)]',
              !isExpanded && 'justify-center px-0'
            )}
          >
            {/* Magnetic/Floating Background for Active Item */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Persistent Gradient for Highlighted Item (Create) */}
            {item.highlight && !isActive && (
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15 rounded-xl border border-white/5 opacity-100 transition-opacity duration-300 group-hover:from-[var(--purple-600)]/25 group-hover:to-[var(--pink-500)]/25',
                  !isExpanded && 'hidden'
                )}
              />
            )}

            {/* Hover Lift for Non-Active Items */}
            {!isActive && (
              <motion.div
                className="absolute inset-0 bg-white/[0.03] rounded-xl opacity-0 group-hover:opacity-100"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Vibrancy Indicator (Left Bar) */}
            {isActive && isExpanded && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute left-0 w-1 h-5 bg-gradient-to-b from-[var(--purple-400)] to-[var(--pink-500)] rounded-full shadow-[0_0_8px_var(--purple-500)]"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            <motion.div
              className="relative z-10 shrink-0"
              whileHover={!isActive ? { scale: 1.1, rotate: 5 } : {}}
            >
              <Icon
                className={cn(
                  'transition-all duration-300',
                  isActive
                    ? 'text-[var(--purple-400)] drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]'
                    : item.highlight
                    ? 'text-[var(--purple-400)]'
                    : 'text-white/60 group-hover:text-white'
                )}
              />
            </motion.div>

            {isExpanded && (
              <span className="relative z-10 truncate transition-transform duration-300 group-hover:translate-x-0.5">
                {item.title}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
