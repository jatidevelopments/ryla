'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { NavItem } from './bottom-nav/nav-item';
import { AddMenu } from './bottom-nav/add-menu';
import { CenterButton } from './bottom-nav/center-button';
import {
  UsersIcon,
  UsersIconFilled,
  PhotoIcon,
  PhotoIconFilled,
  TemplatesIcon,
  TemplatesIconFilled,
  CoinsIcon,
  CoinsIconFilled,
} from './bottom-nav/icons';

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  forceVisible?: boolean;
  userProfile?: UserProfile;
  onReportBugClick?: () => void;
}

const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ className, forceVisible = false, ...props }, ref) => {
    const pathname = usePathname();
    const [showAddMenu, setShowAddMenu] = React.useState(false);

    const shouldHide =
      pathname?.includes('/wizard') ||
      pathname?.includes('/login') ||
      pathname?.includes('/auth');

    if (shouldHide && !forceVisible) return null;

    const toggleAddMenu = () => setShowAddMenu((prev) => !prev);
    const closeAddMenu = () => setShowAddMenu(false);

    const isInfluencersActive =
      pathname === '/dashboard' || pathname?.startsWith('/dashboard');
    const isStudioActive = pathname?.startsWith('/studio');
    const isTemplatesActive = pathname?.startsWith('/templates');
    const isCreditsActive = pathname?.startsWith('/pricing');

    return (
      <nav
        ref={ref}
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          className
        )}
        {...props}
      >
        <div
          className="relative transition-all duration-500 ease-in-out"
          style={{
            paddingTop: 12,
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            paddingLeft: 16,
            paddingRight: 16,
            width: '100%',
          }}
        >
          {/* Background with Notch */}
          <div className="absolute inset-0 pointer-events-none z-[-1]">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <path
                d={
                  showAddMenu
                    ? 'M 0,0 L 100,0 L 100,100 L 0,100 Z'
                    : 'M 0,0 L 40,0 C 44,0 45,0 46,6 C 47,12 48,18 50,18 C 52,18 53,12 54,6 C 55,0 56,0 60,0 L 100,0 L 100,100 L 0,100 Z'
                }
                fill="var(--bg-elevated)"
                className="transition-all duration-500 ease-in-out"
              />
              <path
                d={
                  showAddMenu
                    ? 'M 0,0 L 100,0'
                    : 'M 0,0 L 40,0 C 44,0 45,0 46,6 C 47,12 48,18 50,18 C 52,18 53,12 54,6 C 55,0 56,0 60,0 L 100,0'
                }
                fill="none"
                stroke="var(--border-default)"
                strokeWidth="0.5"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
          </div>
          {/* Add Menu Expanded */}
          <AddMenu isOpen={showAddMenu} onItemClick={closeAddMenu} />

          {/* Main Nav - Horizontal flex row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              width: '100%',
              height: 48,
            }}
          >
            {/* 1. Influencers */}
            <NavItem
              href="/dashboard"
              isActive={isInfluencersActive}
              icon={UsersIcon}
              activeIcon={UsersIconFilled}
              label="Influencers"
              hidden={showAddMenu}
            />

            {/* 2. Studio */}
            <NavItem
              href="/studio"
              isActive={isStudioActive}
              icon={PhotoIcon}
              activeIcon={PhotoIconFilled}
              label="Studio"
              hidden={showAddMenu}
            />

            {/* 3. Center + Button */}
            <CenterButton isOpen={showAddMenu} onClick={toggleAddMenu} />

            {/* 4. Templates */}
            <NavItem
              href="/templates"
              isActive={isTemplatesActive}
              icon={TemplatesIcon}
              activeIcon={TemplatesIconFilled}
              label="Templates"
              hidden={showAddMenu}
            />

            {/* 5. Credits */}
            <NavItem
              href="/pricing"
              isActive={isCreditsActive}
              icon={CoinsIcon}
              activeIcon={CoinsIconFilled}
              label="Credits"
              hidden={showAddMenu}
            />
          </div>
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';

export { BottomNav };
