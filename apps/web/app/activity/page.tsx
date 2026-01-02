'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PageContainer, FadeInUp, Pagination } from '@ryla/ui';
import { ProtectedRoute } from '../../components/protected-route';
import { trpc } from '../../lib/trpc';
import { capture } from '@ryla/analytics';
import { cn } from '@ryla/ui';
import { FEATURE_CREDITS } from '../../constants/pricing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActivityType =
  | 'generation_completed'
  | 'generation_failed'
  | 'generation_started'
  | 'credits_added'
  | 'credits_spent'
  | 'credits_refunded';

interface ActivityItem {
  id: string;
  type: ActivityType;
  occurredAt: string;
  sourceType: 'generation_job' | 'credit_transaction';
  sourceId: string;
  characterId?: string | null;
  imageCount?: number | null;
  thumbnailUrl?: string | null;
  qualityMode?: string | null;
  status?: string | null;
  creditAmount?: number | null;
  balanceAfter?: number | null;
  description?: string | null;
}

type FilterType = 'all' | 'generations' | 'credits';
type TimeRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-5 w-5', className)}
    >
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-5 w-5', className)}
    >
      <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
      <path
        fillRule="evenodd"
        d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
        clipRule="evenodd"
      />
      <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-5 w-5', className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-5 w-5', className)}
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path
        fillRule="evenodd"
        d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path
        fillRule="evenodd"
        d="M12 3.75a.75.75 0 01.75.75v13.19l5.47-5.47a.75.75 0 111.06 1.06l-6.75 6.75a.75.75 0 01-1.06 0l-6.75-6.75a.75.75 0 111.06-1.06l5.47 5.47V4.5a.75.75 0 01.75-.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Estimate credit cost from quality mode
 * This is an approximation based on the shared pricing
 */
function estimateCreditCost(qualityMode: string | null | undefined, imageCount: number | null | undefined): number | null {
  if (!qualityMode) return null;
  
  const count = imageCount ?? 1;
  
  // Map quality modes to feature costs
  switch (qualityMode.toLowerCase()) {
    case 'fast':
    case 'draft':
    case 'studio_fast':
      return FEATURE_CREDITS.studio_fast.credits * count;
    case 'standard':
    case 'hq':
    case 'studio_standard':
      return FEATURE_CREDITS.studio_standard.credits * count;
    case 'profile_set_fast':
      return FEATURE_CREDITS.profile_set_fast.credits;
    case 'profile_set_quality':
      return FEATURE_CREDITS.profile_set_quality.credits;
    case 'base_images':
      return FEATURE_CREDITS.base_images.credits;
    default:
      return null;
  }
}

function getActivityMeta(item: ActivityItem) {
  switch (item.type) {
    case 'generation_completed':
      return {
        icon: <CheckCircleIcon className="text-emerald-400" />,
        label: 'Generation completed',
        detail: item.imageCount ? `${item.imageCount} image${item.imageCount > 1 ? 's' : ''}` : null,
        color: 'emerald',
      };
    case 'generation_failed':
      return {
        icon: <XCircleIcon className="text-red-400" />,
        label: 'Generation failed',
        detail: null,
        color: 'red',
      };
    case 'generation_started':
      return {
        icon: <SparklesIcon className="text-purple-400" />,
        label: 'Generation started',
        detail: item.qualityMode ? item.qualityMode.toUpperCase() : null,
        color: 'purple',
      };
    case 'credits_added':
      return {
        icon: <ArrowUpIcon className="text-emerald-400" />,
        label: 'Credits added',
        detail: item.creditAmount ? `+${item.creditAmount}` : null,
        color: 'emerald',
      };
    case 'credits_spent':
      return {
        icon: <ArrowDownIcon className="text-orange-400" />,
        label: 'Credits used',
        detail: null, // Credit amount shown in orange badge instead
        color: 'orange',
      };
    case 'credits_refunded':
      return {
        icon: <ArrowUpIcon className="text-blue-400" />,
        label: 'Credits refunded',
        detail: item.creditAmount ? `+${item.creditAmount}` : null,
        color: 'blue',
      };
    default:
      return {
        icon: <CoinIcon className="text-gray-400" />,
        label: 'Activity',
        detail: null,
        color: 'gray',
      };
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function FilterTabs({
  value,
  onChange,
}: {
  value: FilterType;
  onChange: (v: FilterType) => void;
}) {
  const tabs: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'generations', label: 'Generations' },
    { value: 'credits', label: 'Credits' },
  ];

  return (
    <div className="flex gap-2 p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all',
            value === tab.value
              ? 'bg-[var(--purple-600)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function TimeRangeFilter({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
}: {
  value: TimeRangeType;
  onChange: (v: TimeRangeType) => void;
  customRange: { start: string; end: string };
  onCustomRangeChange: (range: { start: string; end: string }) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position when dropdown opens
  useEffect(() => {
    if (showDatePicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 260; // min-w-[260px]
      let left = rect.right - dropdownWidth;
      
      // Ensure dropdown doesn't go off-screen to the left
      if (left < 8) {
        left = 8; // 8px margin from screen edge
      }
      
      // Ensure dropdown doesn't go off-screen to the right
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      
      setPosition({
        top: rect.bottom + 8, // 8px = mt-2 equivalent
        left,
      });
    }
  }, [showDatePicker]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDatePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const presetOptions: { value: Exclude<TimeRangeType, 'custom'>; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const customLabel = value === 'custom' && customRange.start && customRange.end
    ? `${formatDate(customRange.start)} – ${formatDate(customRange.end)}`
    : 'Custom';

  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
      {presetOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            onChange(option.value);
            setShowDatePicker(false);
          }}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
            value === option.value
              ? 'bg-purple-500/20 text-purple-300'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          )}
        >
          {option.label}
        </button>
      ))}

      {/* Custom date range with dropdown */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (value !== 'custom') {
            onChange('custom');
          }
          setShowDatePicker(!showDatePicker);
        }}
        className={cn(
          'px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5',
          value === 'custom'
            ? 'bg-purple-500/20 text-purple-300'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
        )}
      >
        <CalendarIcon className="h-3 w-3" />
        <span className="max-w-[120px] truncate">{customLabel}</span>
      </button>

      {/* Dropdown for date selection - rendered via portal */}
      {mounted && showDatePicker && position && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
          }}
          className="z-[9999] p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl min-w-[260px]"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">From</label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">To</label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full px-3 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ActivityRow({ item, onClick }: { item: ActivityItem; onClick?: () => void }) {
  const meta = getActivityMeta(item);
  const isGeneration = item.sourceType === 'generation_job';
  const isCreditTransaction = item.sourceType === 'credit_transaction';
  const isClickable = isGeneration && item.characterId && item.thumbnailUrl;
  
  // Estimate credit cost for generations
  const estimatedCost = isGeneration 
    ? estimateCreditCost(item.qualityMode, item.imageCount)
    : null;

  // For credit transactions, get the absolute amount for display
  const creditAmount = isCreditTransaction && item.creditAmount 
    ? Math.abs(item.creditAmount)
    : null;
  const isCreditSpent = isCreditTransaction && item.type === 'credits_spent';

  const content = (
    <>
      {/* For generations: Always show thumbnail if available, otherwise icon */}
      {isGeneration ? (
        item.thumbnailUrl ? (
          <div className="shrink-0">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors">
              <Image
                src={item.thumbnailUrl}
                alt="Generated image"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
            {meta.icon}
          </div>
        )
      ) : (
        /* For credit transactions: Show icon */
        <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
          {meta.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--text-primary)] font-medium truncate">
            {meta.label}
          </span>
          {/* Non-credit detail badges (e.g., "1 image") */}
          {meta.detail && !isCreditSpent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)]">
              {meta.detail}
            </span>
          )}
          {/* Credit cost badge for generations */}
          {estimatedCost !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">
              -{estimatedCost} credits
            </span>
          )}
          {/* Credit amount badge for credit transactions (spent) - same orange style */}
          {isCreditSpent && creditAmount !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">
              -{creditAmount} credits
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
            {item.description}
          </p>
        )}
        {/* Click hint for clickable items */}
        {isClickable && (
          <p className="text-xs text-purple-400/70 mt-1 hidden sm:block">
            Click to open in Studio
          </p>
        )}
      </div>

      {/* Balance after - show for both credit transactions AND generations */}
      {item.balanceAfter !== null && item.balanceAfter !== undefined && (
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-xs text-[var(--text-muted)]">Balance</span>
          <span className="text-sm font-mono text-[var(--text-secondary)]">
            {item.balanceAfter}
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="shrink-0 text-right">
        <span className="text-xs text-[var(--text-muted)]">
          {formatRelativeTime(item.occurredAt)}
        </span>
      </div>

      {/* Arrow indicator for clickable */}
      {isClickable && (
        <div className="shrink-0 hidden sm:block">
          <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </>
  );

  if (isClickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl hover:border-purple-500/50 hover:bg-white/[0.02] transition-all text-left group cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl transition-all">
      {content}
    </div>
  );
}

function ActivitySummaryCards({
  summary,
}: {
  summary: {
    generations: { completed: number; failed: number; processing: number; queued: number };
    credits: { added: number; spent: number; refunded: number };
    totalEvents: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="text-emerald-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Completed</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.generations.completed}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <XCircleIcon className="text-red-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Failed</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.generations.failed}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ArrowDownIcon className="text-orange-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Credits Used</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.credits.spent}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpIcon className="text-emerald-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Credits Added</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.credits.added}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function ActivityContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all');
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      start: weekAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle click on generation item to navigate to studio
  const handleActivityClick = (item: ActivityItem) => {
    if (item.sourceType === 'generation_job' && item.characterId) {
      capture('activity_item_clicked', {
        type: item.type,
        characterId: item.characterId,
        hasImage: Boolean(item.thumbnailUrl),
      });
      // Navigate to studio with the image pre-selected
      // The thumbnailUrl can be passed as a query param or stored
      router.push(`/influencer/${item.characterId}/studio`);
    }
  };

  // Track page view
  useEffect(() => {
    capture('activity_viewed');
  }, []);

  // Reset to page 1 when filter or time range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, timeRange, customRange]);

  // Fetch summary
  const { data: summary } = trpc.activity.summary.useQuery();

  // Build query params for activity list
  const queryParams = useMemo(() => {
    const params: {
      limit: number;
      page: number;
      filter: FilterType;
      timeRange: TimeRangeType;
      startDate?: string;
      endDate?: string;
    } = { 
      limit: itemsPerPage, 
      page: currentPage,
      filter,
      timeRange,
    };

    // Add custom date range if selected
    if (timeRange === 'custom') {
      if (customRange.start) {
        params.startDate = new Date(customRange.start).toISOString();
      }
      if (customRange.end) {
        // Set end date to end of day
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }
    }

    return params;
  }, [itemsPerPage, currentPage, filter, timeRange, customRange]);

  // Fetch activity list with pagination
  const {
    data,
    isLoading,
  } = trpc.activity.list.useQuery(queryParams, {
    // Refetch when window regains focus to show latest activity
    refetchOnWindowFocus: true,
    // Keep data fresh - stale after 30 seconds
    staleTime: 30 * 1000,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <PageContainer className="relative">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Header */}
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Activity</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Your generation history and credit usage
          </p>
        </div>
      </FadeInUp>

      {/* Summary Cards */}
      {summary && (
        <FadeInUp delay={100}>
          <div className="mb-6">
            <ActivitySummaryCards summary={summary} />
          </div>
        </FadeInUp>
      )}

      {/* Filters */}
      <FadeInUp delay={150}>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <FilterTabs value={filter} onChange={setFilter} />
            <TimeRangeFilter
              value={timeRange}
              onChange={setTimeRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          </div>
        </div>
      </FadeInUp>

      {/* Activity List */}
      <FadeInUp delay={200}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--border-default)]" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[var(--purple-500)] animate-spin" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <SparklesIcon className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              No activity yet
            </h3>
            <p className="text-[var(--text-secondary)] max-w-sm">
              Start creating AI influencers to see your generation history and credit usage here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <ActivityRow 
                  key={item.id} 
                  item={item} 
                  onClick={item.sourceType === 'generation_job' && item.characterId 
                    ? () => handleActivityClick(item) 
                    : undefined
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </FadeInUp>
    </PageContainer>
  );
}

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <ActivityContent />
    </ProtectedRoute>
  );
}

