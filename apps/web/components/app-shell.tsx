"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, BottomNav, SidebarMobileTrigger } from "@ryla/ui";
import { DesktopSidebar } from "./desktop-sidebar";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that should NOT show the app shell (header/nav)
const excludedRoutes = ["/login", "/wizard"];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Check if current route should have the app shell
  const showShell = !excludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden md:flex h-16 items-center justify-between border-b border-white/10 bg-[#161619]/95 backdrop-blur-sm px-6">
          {/* Breadcrumb or page title could go here */}
          <div />

          {/* Right side - Credits & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-sm text-white/60">Credits:</span>
              <span className="text-sm font-semibold text-white">250</span>
            </div>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between border-b border-white/10 bg-[#161619]/95 backdrop-blur-sm px-4">
          <SidebarMobileTrigger />
          <Link
            href="/dashboard"
            className="text-xl font-bold bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] bg-clip-text text-transparent"
          >
            RYLA
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
