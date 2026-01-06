'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, BottomNav, SidebarMobileTrigger, useSidebar } from '@ryla/ui';
import type { UserProfile } from '@ryla/ui';
import { DesktopSidebar } from './desktop-sidebar';
import { CreditsBadge, LowBalanceWarning } from './credits';
import { NotificationsMenu } from './notifications/notifications-menu';
import { BugReportModal } from './bug-report';
import { useAuth } from '../lib/auth-context';
import { useSubscription } from '../lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import { Toaster } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that should NOT show the app shell (header/nav)
const excludedRoutes = ['/login', '/register', '/auth', '/forgot-password', '/reset-password'];

// Inner component that uses sidebar context
function AppShellContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [bugReportModalOpen, setBugReportModalOpen] = React.useState(false);
  
  // Calculate left offset for main content based on sidebar state (desktop only)
  // Matches Tailwind: w-64 = 256px, w-20 = 80px
  const sidebarWidth = isMobile ? 0 : (open ? 256 : 80);

  // Build user profile for bottom nav
  const userProfile: UserProfile | undefined = user ? {
    name: user.publicName || user.name || 'User',
    avatarUrl: undefined, // TODO: Add avatar support when available
    tier: tier as UserProfile['tier'],
  } : undefined;

  return (
    <div className="min-h-screen bg-[#121214] overflow-x-hidden">
      <Toaster richColors position="top-right" />
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content - positioned next to fixed sidebar */}
      <div 
        className="flex flex-col min-h-screen transition-all duration-200"
        style={{ 
          marginLeft: sidebarWidth,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`
        }}
      >
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden md:flex h-16 items-center justify-between border-b border-white/5 bg-[#121214]/90 backdrop-blur-md px-6">
          {/* Breadcrumb or page title could go here */}
          <div />

          {/* Right side - Credits & Actions */}
          <div className="flex items-center gap-4">
            {/* Credits Badge - Real balance from API */}
            <CreditsBadge size="md" />

            {/* Notifications */}
            <NotificationsMenu />

            {/* Settings */}
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between border-b border-white/5 bg-[#121214]/90 backdrop-blur-md px-4">
          <SidebarMobileTrigger />
          <Link href="/dashboard">
            <Image
              src="/logos/Ryla_Logo_white.png"
              alt="RYLA"
              width={80}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationsMenu />
            {/* Credits Badge - Mobile - Real balance from API */}
            <CreditsBadge size="sm" showLabel={false} />
          </div>
        </header>

        {/* Low Balance Warning */}
        <LowBalanceWarning className="mx-4 mt-4 md:mx-6" />

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Nav */}
        <BottomNav
          userProfile={userProfile}
          onReportBugClick={() => setBugReportModalOpen(true)}
        />

        {/* Bug Report Modal */}
        <BugReportModal
          isOpen={bugReportModalOpen}
          onClose={() => setBugReportModalOpen(false)}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Check if current route should have the app shell
  const showShell = !excludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
