'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, BottomNav, SidebarMobileTrigger } from '@ryla/ui';
import { DesktopSidebar } from './desktop-sidebar';
import Link from 'next/link';
import Image from 'next/image';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that should NOT show the app shell (header/nav)
const excludedRoutes = ['/login', '/wizard'];

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
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-[#1a1a1d] via-[#16161a] to-[#121214]">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden md:flex h-16 items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#1a1a1d] via-[#16161a] to-[#121214] backdrop-blur-md px-6">
          {/* Breadcrumb or page title could go here */}
          <div />

          {/* Right side - Credits & Actions */}
          <div className="flex items-center gap-4">
            {/* Credits Badge */}
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--purple-700)]/80 to-[var(--purple-800)]/80 border border-[var(--purple-500)]/30 px-3 py-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--purple-500)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-white"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.21z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">250</span>
              <span className="text-xs text-white/60">credits</span>
            </div>

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
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#1a1a1d] via-[#16161a] to-[#121214] backdrop-blur-md px-4">
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
          {/* Credits Badge - Mobile */}
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--purple-700)]/80 to-[var(--purple-800)]/80 border border-[var(--purple-500)]/30 px-2.5 py-1">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-[var(--purple-500)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-2.5 w-2.5 text-white"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.21z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white">250</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
