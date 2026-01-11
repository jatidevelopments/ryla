'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader as UISidebarHeader,
  SidebarContent,
  SidebarFooter as UISidebarFooter,
  useSidebar,
} from '@ryla/ui';
import { motion } from 'framer-motion';
import { cn } from '@ryla/ui';
import { useSubscription } from '../../lib/hooks';
import { useAuth } from '../../lib/auth-context';
import { BugReportModal } from '../bug-report';
import { BugIcon } from './sidebar-icons';
import { menuItems, SidebarNavigation } from './sidebar-navigation';
import { SidebarHeader } from './sidebar-header';
import { SidebarFooter } from './sidebar-footer';
import { MobileNavigationSheet } from './MobileNavigationSheet';
import { trpc } from '../../lib/trpc';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { open, setOpen, openMobile, isMobile, setOpenMobile } = useSidebar();
  const { isPro, tier } = useSubscription();
  const { user } = useAuth();
  const isExpanded = isMobile ? openMobile : open;
  const isSettingsActive = pathname === '/settings';
  const [isBugReportOpen, setIsBugReportOpen] = React.useState(false);

  // Check if user has any influencers
  const { data: charactersData } = trpc.character.list.useQuery();
  const hasInfluencers = (charactersData?.items?.length ?? 0) > 0;

  // Add lock status to menu items
  const itemsWithLocks = menuItems.map((item) => {
    if (item.url === '/studio' || item.url === '/templates') {
      return { ...item, isLocked: !hasInfluencers };
    }
    return item;
  });

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setOpen(!open);
    }
  };

  const handleCloseMobile = React.useCallback(() => {
    setOpenMobile(false);
  }, [setOpenMobile]);

  // When on mobile, we don't render the Sidebar component at all.
  // Instead, we render our custom Bottom Sheet triggered by the same state.
  if (isMobile) {
    return (
      <MobileNavigationSheet isOpen={openMobile} onClose={handleCloseMobile} />
    );
  }

  return (
    <Sidebar>
      {/* Header with Logo */}
      <UISidebarHeader className="!p-0 h-16 border-b border-white/5 overflow-hidden">
        <SidebarHeader
          isExpanded={isExpanded}
          isMobile={isMobile}
          onLinkClick={handleLinkClick}
          onToggleSidebar={toggleSidebar}
        />
      </UISidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-4 py-4 flex flex-col">
        <SidebarNavigation
          items={itemsWithLocks}
          pathname={pathname || ''}
          isExpanded={isExpanded}
          onLinkClick={handleLinkClick}
        />

        {/* Report Bug - navigation item style */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => setIsBugReportOpen(true)}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 w-full',
              'text-white/60 hover:text-white focus:outline-none',
              !isExpanded && 'justify-center px-0'
            )}
          >
            {/* Hover Lift for consistency */}
            <motion.div
              className="absolute inset-0 bg-white/[0.03] rounded-xl opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              className="relative z-10 shrink-0"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <BugIcon className="text-white/60 group-hover:text-white transition-colors duration-300" />
            </motion.div>

            {isExpanded && (
              <span className="relative z-10 truncate transition-transform duration-300 group-hover:translate-x-0.5">
                Report Bug
              </span>
            )}
          </button>
        </div>
      </SidebarContent>

      {/* Footer */}
      <UISidebarFooter className="px-4 pb-5 border-t border-white/5">
        <SidebarFooter
          isExpanded={isExpanded}
          isMobile={isMobile}
          isPro={isPro}
          tier={tier as 'free' | 'starter' | 'pro' | 'unlimited'}
          isSettingsActive={isSettingsActive}
          user={user}
          onLinkClick={handleLinkClick}
          onToggleSidebar={toggleSidebar}
        />
      </UISidebarFooter>

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        userEmail={user?.email}
      />
    </Sidebar>
  );
}
