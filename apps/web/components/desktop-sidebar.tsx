'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@ryla/ui';
import { cn } from '@ryla/ui';
import { CreditsBadge } from './credits';
import { useSubscription } from '../lib/hooks';
import { useAuth } from '../lib/auth-context';
import { BugReportModal } from './bug-report';

// Icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

const PlusCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PhotoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn('h-4 w-4 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn('h-4 w-4 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

const BugIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146M8.683 5a6.032 6.032 0 01-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0112 3.75a3.75 3.75 0 013.317 1.998m-.581-2.749A4.49 4.49 0 0116.472 2.2M9.268 5.249c.256.424.564.815.918 1.163m5.647-.412a6.032 6.032 0 001.155-1.002 4.49 4.49 0 00-.574-1.747M14.732 5.25a5.99 5.99 0 01-.918 1.163"
    />
  </svg>
);

const menuItems = [
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
    title: 'Activity',
    url: '/activity',
    icon: ClockIcon,
    isActive: (pathname: string) => pathname === '/activity',
  },
];

// Helper to get tier badge styling
type SubscriptionTier = 'free' | 'starter' | 'pro' | 'unlimited';

const getTierBadgeStyle = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'pro':
    case 'unlimited':
      return 'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] text-white';
    case 'starter':
      return 'bg-[var(--purple-500)]/20 text-[var(--purple-400)]';
    default:
      return 'bg-white/10 text-white/60';
  }
};

// Helper to get tier display name
const getTierDisplayName = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'pro':
      return 'Pro';
    case 'unlimited':
      return 'Pro+';
    case 'starter':
      return 'Starter';
    default:
      return 'Free';
  }
};

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
      {/* Header with Logo - h-16 to match main content header */}
      <SidebarHeader className="!p-0 h-16 border-b border-white/5 overflow-hidden">
        <div className="flex items-center justify-between w-full h-full px-5">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center overflow-hidden"
          >
            <Image
              src="/logos/Ryla_Logo_white.png"
              alt="RYLA"
              width={100}
              height={32}
              className="h-8 w-auto shrink-0"
            />
          </Link>

          {/* Collapse toggle - desktop only */}
          {!isMobile && isExpanded && (
            <button
              onClick={toggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <ChevronLeftIcon />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-4 py-4 flex flex-col">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = item.isActive(pathname || '');
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={handleLinkClick}
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
                <item.icon
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
      <SidebarFooter className="px-4 pb-5 border-t border-white/5">
        {/* Expand button when collapsed */}
        {!isMobile && !isExpanded && (
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all mb-3"
          >
            <ChevronRightIcon />
          </button>
        )}

        {/* Premium CTA - Only show for non-Pro users */}
        {!isPro && (
          <Link
            href="/pricing"
            onClick={handleLinkClick}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              'bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15',
              'hover:from-[var(--purple-600)]/25 hover:to-[var(--pink-500)]/25',
              'border border-white/5 hover:border-white/10',
              !isExpanded && 'justify-center px-0'
            )}
          >
            <SparklesIcon className="text-[var(--purple-400)] shrink-0" />
            {isExpanded && (
              <span className="bg-gradient-to-r from-[var(--purple-400)] to-[var(--pink-400)] bg-clip-text text-transparent font-semibold">
                Upgrade to Pro
              </span>
            )}
          </Link>
        )}

        {/* Credits display - Real balance from API */}
        {isExpanded && (
          <CreditsBadge size="md" className="mt-3" />
        )}

        {/* User Profile Card - Links to Settings */}
        <Link
          href="/settings"
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-3 mt-3 transition-all duration-200',
            isSettingsActive
              ? 'bg-white/10 shadow-sm'
              : 'hover:bg-white/5',
            !isExpanded && 'justify-center px-0'
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={cn(
              'rounded-full overflow-hidden bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center',
              isExpanded ? 'h-10 w-10' : 'h-8 w-8'
            )}>
              <span className={cn(
                'font-bold text-white',
                isExpanded ? 'text-sm' : 'text-xs'
              )}>
                {user?.publicName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Name and Tier - Only when expanded */}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate max-w-[120px]">
                  {user?.publicName || user?.name || 'User'}
                </span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0',
                  getTierBadgeStyle(tier as SubscriptionTier)
                )}>
                  {getTierDisplayName(tier as SubscriptionTier)}
                </span>
              </div>
              <span className="text-xs text-white/50">Settings</span>
            </div>
          )}

          {/* Chevron - Only when expanded */}
          {isExpanded && (
            <ChevronRightIcon className="text-white/30 shrink-0" />
          )}
        </Link>

        {/* Divider before legal links */}
        {isExpanded && (
          <div className="mt-4 border-t border-white/5" />
        )}

        {/* Legal links - only when expanded */}
        {isExpanded && (
          <div className="mt-4 flex justify-center gap-3 text-[11px] text-white/50">
            <Link
              href="/legal"
              className="hover:text-white/70 transition-colors"
            >
              Terms
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/legal"
              className="hover:text-white/70 transition-colors"
            >
              Privacy
            </Link>
          </div>
        )}
      </SidebarFooter>

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        userEmail={user?.email}
      />
    </Sidebar>
  );
}
