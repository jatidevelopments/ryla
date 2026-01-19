'use client';

import Link from 'next/link';
import { cn } from '@ryla/ui';
import { routes } from '@/lib/routes';
import { useCredits } from '../../lib/hooks/use-credits';

interface CreditsBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  clickable?: boolean;
}

/**
 * Credits Badge Component
 * Displays the user's current credit balance with visual feedback for low/zero balance
 */
export function CreditsBadge({
  className,
  size = 'md',
  showLabel = true,
  clickable = true,
}: CreditsBadgeProps) {
  const { balance, isLowBalance, isZeroBalance, isLoading } = useCredits();

  // Determine badge styling based on balance state
  const getBadgeStyle = () => {
    if (isZeroBalance) {
      return 'from-red-700/80 to-red-800/80 border-red-500/30';
    }
    if (isLowBalance) {
      return 'from-orange-700/80 to-orange-800/80 border-orange-500/30';
    }
    return 'from-[var(--purple-700)]/80 to-[var(--purple-800)]/80 border-[var(--purple-500)]/30';
  };

  const getIconStyle = () => {
    if (isZeroBalance) {
      return 'bg-red-500';
    }
    if (isLowBalance) {
      return 'bg-orange-500';
    }
    return 'bg-[var(--purple-500)]';
  };

  const sizeClasses = {
    sm: {
      badge: 'px-2.5 py-1 gap-1.5',
      icon: 'h-4 w-4',
      iconInner: 'h-2.5 w-2.5',
      balance: 'text-xs font-bold',
      label: 'text-[10px]',
    },
    md: {
      badge: 'px-3 py-1.5 gap-2',
      icon: 'h-5 w-5',
      iconInner: 'h-3.5 w-3.5',
      balance: 'text-sm font-bold',
      label: 'text-xs',
    },
  };

  const sizes = sizeClasses[size];

  const badgeContent = (
    <div
      className={cn(
        'flex items-center rounded-full bg-gradient-to-r border transition-all',
        getBadgeStyle(),
        sizes.badge,
        clickable && 'hover:opacity-80 cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded',
          getIconStyle(),
          sizes.icon
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn('text-white', sizes.iconInner)}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.21z" />
        </svg>
      </div>

      <span className={cn('text-white', sizes.balance)}>
        {isLoading ? '...' : balance.toLocaleString()}
      </span>

      {showLabel && (
        <span className={cn('text-white/60', sizes.label)}>credits</span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href={routes.buyCredits} title="Buy more credits">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
