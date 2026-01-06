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
import { cn } from '@ryla/ui';
import { useSubscription } from '../../lib/hooks';
import { useAuth } from '../../lib/auth-context';
import { BugReportModal } from '../bug-report';
import { BugIcon } from './sidebar-icons';
import { menuItems, SidebarNavigation } from './sidebar-navigation';
import { SidebarHeader } from './sidebar-header';
import { SidebarFooter } from './sidebar/sidebar-footer';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { open, setOpen, openMobile, isMobile, setOpenMobile } = useSidebar();
  const { isPro, tier } = useSubscription();
  const { user } = useAuth();
  const isExpanded = isMobile ? openMobile : open;
  const isSettingsActive = pathname === '/settings';
  const [isBugReportOpen, setIsBugReportOpen] = React.useState(false);

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
          items={menuItems}
          pathname={pathname || ''}
          isExpanded={isExpanded}
          onLinkClick={handleLinkClick}
        />

        {/* Report Bug - navigation item style */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => setIsBugReportOpen(true)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 w-full',
              'text-white/70 hover:bg-white/5 hover:text-white',
              !isExpanded && 'justify-center px-0'
            )}
          >
            <BugIcon className="text-white/70 shrink-0" />
            {isExpanded && <span className="truncate">Report Bug</span>}
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
