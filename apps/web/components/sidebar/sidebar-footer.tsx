'use client';

import Link from 'next/link';
import { cn } from '@ryla/ui';
import { CreditsBadge } from '../credits';
import { ChevronRightIcon, SparklesIcon } from './sidebar-icons';

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

interface SidebarFooterProps {
  isExpanded: boolean;
  isMobile: boolean;
  isPro: boolean;
  tier: SubscriptionTier;
  isSettingsActive: boolean;
  user: { publicName?: string | null; name?: string | null } | null;
  onLinkClick: () => void;
  onToggleSidebar: () => void;
}

export function SidebarFooter({
  isExpanded,
  isMobile,
  isPro,
  tier,
  isSettingsActive,
  user,
  onLinkClick,
  onToggleSidebar,
}: SidebarFooterProps) {
  return (
    <>
      {/* Expand button when collapsed */}
      {!isMobile && !isExpanded && (
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all mb-3"
        >
          <ChevronRightIcon />
        </button>
      )}

      {/* Premium CTA - Only show for non-Pro users */}
      {!isPro && (
        <Link
          href="/pricing"
          onClick={onLinkClick}
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
        onClick={onLinkClick}
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
                getTierBadgeStyle(tier)
              )}>
                {getTierDisplayName(tier)}
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
    </>
  );
}

