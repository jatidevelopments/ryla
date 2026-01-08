'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@ryla/ui';
import { BugIcon } from './sidebar-icons';
import { menuItems } from './sidebar-navigation';
import { useAuth } from '../../lib/auth-context';
import { useSubscription } from '../../lib/hooks';
import { CreditsBadge } from '../credits';
import { BugReportModal } from '../bug-report';

// Sidebar Footer imports logic - reused inline or imported
// Since SidebarFooter is specific to the sidebar layout (with expand/collapse),
// we might want to rebuild the footer for mobile sheet to ensure it looks good
// inside the bottom sheet structure.

interface MobileNavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigationSheet({
  isOpen,
  onClose,
}: MobileNavigationSheetProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isPro, tier } = useSubscription();
  const [isBugReportOpen, setIsBugReportOpen] = React.useState(false);

  // Close sheet when path changes (navigation)
  const lastPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (lastPathname.current !== pathname) {
      onClose();
      lastPathname.current = pathname;
    }
  }, [pathname, onClose]);

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-500"
            onClick={onClose}
          />

          {/* Bottom Sheet wrapper for proper positioning */}
          <div className="fixed inset-0 z-[70] pointer-events-none flex flex-col justify-end lg:hidden">
            {/* Bottom Sheet */}
            <div
              className={cn(
                'pointer-events-auto w-full flex flex-col',
                'bg-[#121214] rounded-t-[32px] border-t border-white/10',
                'max-h-[82vh] overflow-hidden',
                'animate-in slide-in-from-bottom duration-700 cubic-bezier(0.32, 0.72, 0, 1)',
                'shadow-[0_-8px_40px_rgba(0,0,0,0.5)]'
              )}
            >
              {/* Drag Handle */}
              <div
                className="flex justify-center pt-3 pb-2 shrink-0"
                onClick={onClose}
              >
                <div className="h-1.5 w-12 rounded-full bg-white/10" />
              </div>

              {/* Header with Logo */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <Link href="/dashboard" className="flex items-center">
                  <Image
                    src="/logos/Ryla_Logo_white.png"
                    alt="RYLA"
                    width={80}
                    height={28}
                    className="h-7 w-auto"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content Container */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Navigation Links */}
                <div className="grid grid-cols-1 gap-1.5">
                  {menuItems.map((item, index) => {
                    const isActive = item.isActive(pathname || '');
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.url}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                          isActive
                            ? 'bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-600)] text-white shadow-lg shadow-purple-500/20'
                            : 'text-white/70 hover:bg-white/5 hover:text-white',
                          item.highlight &&
                            !isActive &&
                            'bg-gradient-to-r from-[var(--purple-600)]/10 to-[var(--pink-500)]/10 text-[var(--purple-300)] border border-white/5'
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-active:scale-90',
                            isActive
                              ? 'bg-white/20'
                              : 'bg-white/5 group-hover:bg-white/10'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5 shrink-0',
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-[var(--purple-400)]'
                                : 'text-white/70'
                            )}
                          />
                        </div>
                        <span className="flex-1">{item.title}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Report Bug */}
                  <button
                    onClick={() => {
                      setIsBugReportOpen(true);
                      onClose();
                    }}
                    className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 w-full text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-transform group-active:scale-90">
                      <BugIcon className="w-5 h-5 shrink-0 text-white/70" />
                    </div>
                    <span className="flex-1 text-left">Report Bug</span>
                  </button>
                </div>

                {/* Credits Section */}
                <div className="bg-gradient-to-br from-[#1E1E20] to-[#161618] rounded-2xl p-4 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        Account Balance
                      </span>
                      <CreditsBadge
                        size="md"
                        className="!bg-transparent !border-0 !p-0 mt-1"
                        showLabel={true}
                      />
                    </div>
                    <Link
                      href="/pricing"
                      className="p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </Link>
                  </div>
                  <Link
                    href="/pricing"
                    className="block w-full py-2 rounded-xl bg-white/5 text-center text-[10px] font-bold text-white hover:bg-white/10 transition-colors border border-white/5 uppercase tracking-wider"
                  >
                    Buy Credits
                  </Link>
                </div>

                {/* User Profile / Settings */}
                <Link
                  href="/settings"
                  className="flex items-center gap-4 rounded-2xl p-4 bg-[#1E1E20] border border-white/5 hover:bg-[#252528] transition-all group active:scale-[0.98]"
                >
                  <div className="relative">
                    <div className="rounded-xl h-12 w-12 bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                      <span className="font-black text-white text-lg">
                        {user?.publicName?.charAt(0).toUpperCase() ||
                          user?.name?.charAt(0).toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-[#1E1E20] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white truncate">
                        {user?.publicName || user?.name || 'User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
                          tier === 'pro' || tier === 'unlimited'
                            ? 'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] text-white'
                            : tier === 'starter'
                            ? 'bg-[var(--purple-500)]/20 text-[var(--purple-400)]'
                            : 'bg-white/10 text-white/60'
                        )}
                      >
                        {tier === 'unlimited'
                          ? 'Pro+'
                          : tier === 'pro'
                          ? 'Pro'
                          : tier === 'starter'
                          ? 'Starter'
                          : 'Free'}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <svg
                      className="w-4 h-4 text-white/40 group-hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>

                {/* Legal Links */}
                <div className="flex flex-col items-center gap-3 pb-8 pt-2">
                  <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <Link
                      href="/legal"
                      className="hover:text-white/60 transition-colors"
                    >
                      Terms
                    </Link>
                    <span>•</span>
                    <Link
                      href="/legal"
                      className="hover:text-white/60 transition-colors"
                    >
                      Privacy
                    </Link>
                  </div>
                  <p className="text-[9px] text-white/20 font-medium">
                    © 2026 Ryla.ai - All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        userEmail={user?.email}
      />
    </>
  );
}
