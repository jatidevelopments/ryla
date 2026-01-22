'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  BottomNav,
  SidebarMobileTrigger,
  useSidebar,
  cn,
  PageTransition,
} from '@ryla/ui';
import { DesktopSidebar } from '../sidebar/DesktopSidebar';
import { CreditsBadge, LowBalanceWarning } from '../credits';
import { NotificationsMenu } from '../notifications/NotificationsMenu';
import { BugReportModal } from '../bug-report';
import { useAuth } from '../../lib/auth-context';
import { routes } from '../../lib/routes';
import Link from 'next/link';
import Image from 'next/image';
import { Toaster } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that should NOT show the app shell (header/nav)
const excludedRoutes = [
  '/login',
  '/register',
  '/auth',
  '/forgot-password',
  '/reset-password',
];

// Scroll threshold for hiding header
const SCROLL_THRESHOLD = 50;

// Inner component that uses sidebar context
function AppShellContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();
  const { user } = useAuth();
  const [bugReportModalOpen, setBugReportModalOpen] = React.useState(false);

  // Scroll-to-hide header state (like MDC)
  const [showMobileHeader, setShowMobileHeader] = React.useState(true);
  const lastScrollRef = React.useRef(0);
  const tickingRef = React.useRef(false);

  // Calculate left offset for main content based on sidebar state (desktop only)
  // Matches Tailwind: w-64 = 256px, w-20 = 80px
  const sidebarWidth = isMobile ? 0 : open ? 256 : 80;

  // Scroll detection for mobile header hide/show
  React.useEffect(() => {
    if (!isMobile) return;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const curr = window.scrollY;
        const last = lastScrollRef.current;

        // Hide on scroll down, show on scroll up
        if (curr > last && curr > SCROLL_THRESHOLD) {
          setShowMobileHeader(false);
        } else {
          setShowMobileHeader(true);
        }

        lastScrollRef.current = curr;
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    lastScrollRef.current = window.scrollY;

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-[#121214] overflow-x-hidden">
      <Toaster richColors position="top-right" />
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Bottom Nav - outside container to ensure proper positioning */}
      <BottomNav />

      {/* Main Content - positioned next to fixed sidebar */}
      <div
        className="flex flex-col min-h-screen transition-all duration-200"
        style={{
          marginLeft: sidebarWidth,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
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
              href={routes.settings}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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

        {/* Mobile Header - with curved notch design (like modern phones) */}
        <header
          className={cn(
            'fixed top-0 left-0 right-0 z-30 md:hidden transition-transform duration-300',
            showMobileHeader ? 'translate-y-0' : '-translate-y-full'
          )}
        >
          <div className="relative h-14">
            {/* Background with Curved Notch at Top Center */}
            <div className="absolute inset-0 pointer-events-none">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                {/* Main shape with curved notch at top center and elegant curved bottom */}
                <path
                  d="M 0,100 C 8,98 20,97 30,97.2 C 40,97 45,97.3 50,97.3 C 55,97.3 60,97 70,97.2 C 80,97 92,98 100,100 L 100,0 L 60,0 C 56,0 55,0 54,6 C 53,12 52,18 50,18 C 48,18 47,12 46,6 C 45,0 44,0 40,0 L 0,0 Z"
                  fill="var(--bg-elevated)"
                  className="transition-all duration-500 ease-in-out"
                />
                {/* Top border with notch */}
                <path
                  d="M 0,0 L 40,0 C 44,0 45,0 46,6 C 47,12 48,18 50,18 C 52,18 53,12 54,6 C 55,0 56,0 60,0 L 100,0"
                  fill="none"
                  stroke="var(--border-default)"
                  strokeWidth="0.5"
                  className="transition-all duration-500 ease-in-out"
                />
                {/* Bottom border with elegant flowing curve */}
                <path
                  d="M 0,100 C 8,98 20,97 30,97.2 C 40,97 45,97.3 50,97.3 C 55,97.3 60,97 70,97.2 C 80,97 92,98 100,100"
                  fill="none"
                  stroke="var(--border-default)"
                  strokeWidth="0.5"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>
            </div>

            {/* Content - Logo on left, Actions on right, nothing in center (avoids phone notches) */}
            <div className="relative h-full flex items-center justify-between px-4">
              {/* Left: Menu + Logo */}
              <div className="flex items-center gap-3">
                <SidebarMobileTrigger />
                <Link href={routes.dashboard} className="flex items-center">
                  <Image
                    src="/logos/ryla_small_logo.png"
                    alt="RYLA"
                    width={32}
                    height={32}
                    className="h-7 w-7"
                  />
                </Link>
              </div>

              {/* Right: Notifications + Credits */}
              <div className="flex items-center gap-1">
                <NotificationsMenu />
                <CreditsBadge size="sm" showLabel={false} />
              </div>
            </div>
          </div>
        </header>

        {/* Spacer for fixed mobile header */}
        <div className="h-14 md:hidden" />

        {/* Low Balance Warning */}
        <LowBalanceWarning className="mx-4 mt-4 md:mx-6" />

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>

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
