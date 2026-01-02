'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { capture } from '@ryla/analytics';
import { FEATURE_CREDITS } from '../../constants/pricing';

import { useNotifications } from '../../lib/hooks/use-notifications';

/**
 * Estimate credit cost from quality mode for display
 */
function estimateCreditCost(qualityMode: string | null | undefined, imageCount: number | null | undefined): number | null {
  if (!qualityMode) return null;
  
  const count = imageCount ?? 1;
  
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={cn('h-5 w-5', className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function formatRelativeTime(input: Date): string {
  const diffMs = input.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, 'second');
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

export function NotificationsMenu() {
  const { items, unreadCount, isLoading, markAllRead, markRead } =
    useNotifications({
      limit: 25,
      offset: 0,
      refetchIntervalMs: 30000,
    });

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { unread, read } = useMemo(() => {
    const u = items.filter((n) => !n.isRead);
    const r = items.filter((n) => n.isRead);
    return { unread: u, read: r };
  }, [items]);

  // Close on click outside + escape
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      capture('notifications.menu_opened', { unread_count: unreadCount });
    }
  };

  const handleMarkAllRead = () => {
    capture('notifications.mark_all_read_clicked', {
      unread_count_before: unreadCount,
    });
    markAllRead();
  };

  const renderItem = (n: (typeof items)[number]) => {
    // Extract metadata for enhanced display
    const metadata = n.metadata as Record<string, unknown> | null;
    const thumbnailUrl = metadata?.thumbnailUrl as string | null;
    const baseImageUrl = metadata?.baseImageUrl as string | null;
    const imageCount = metadata?.imageCount as number | null;
    const qualityMode = metadata?.qualityMode as string | null;
    const characterId = metadata?.characterId as string | null;
    
    // Calculate credit cost for generation notifications
    const isGeneration = n.type === 'generation.completed';
    const isCharacterCreated = n.type === 'character.created';
    const creditCost = isGeneration ? estimateCreditCost(qualityMode, imageCount) : null;
    
    // Use base image for character creation, thumbnail for generation
    const displayImageUrl = isCharacterCreated ? baseImageUrl : thumbnailUrl;
    
    // Check if notification has a link
    const hasLink = Boolean(n.href);

    const content = (
      <div className="flex gap-3">
        {/* Thumbnail for generation/character creation notifications */}
        {displayImageUrl && (
          <div className="shrink-0">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10">
              <Image
                src={displayImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className={cn('text-sm truncate', n.isRead ? 'text-white/70' : 'text-white')}>
              {n.title}
            </div>
            <div className="text-[11px] text-white/40 whitespace-nowrap shrink-0">
              {n.createdAt ? formatRelativeTime(new Date(n.createdAt)) : ''}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {n.body && (
              <span className="text-xs text-white/50 line-clamp-1">{n.body}</span>
            )}
            {/* Credit cost badge */}
            {creditCost !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-medium shrink-0">
                -{creditCost}
              </span>
            )}
          </div>
          {/* Click hint for items with links */}
          {hasLink && (
            <div className="text-[10px] text-purple-400/60 mt-0.5">
              {characterId
                ? isGeneration
                  ? 'Tap to open in Studio →'
                  : 'Tap to view character →'
                : 'Tap to view →'}
            </div>
          )}
        </div>
      </div>
    );

    const className = cn(
      'block rounded-lg px-3 py-2.5 transition-colors',
      n.isRead ? 'bg-white/5 hover:bg-white/7' : 'bg-white/8 hover:bg-white/10',
      hasLink && 'hover:border-purple-500/30 border border-transparent cursor-pointer'
    );

    const onClick = () => {
      capture('notifications.notification_clicked', {
        notification_id: n.id,
        type: n.type,
        has_href: Boolean(n.href),
      });
      if (!n.isRead) {
        markRead(n.id);
        capture('notifications.notification_marked_read', {
          notification_id: n.id,
          type: n.type,
          source: 'menu_click',
        });
      }
      setOpen(false);
    };

    if (n.href) {
      return (
        <Link key={n.id} href={n.href} className={className} onClick={onClick}>
          {content}
        </Link>
      );
    }

    return (
      <button key={n.id} className={className} onClick={onClick} type="button">
        {content}
      </button>
    );
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <ClockIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] overflow-hidden rounded-xl border border-white/10 bg-[#121214] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-white">Notifications</div>
              <div className="text-xs text-white/50">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread`
                  : 'All caught up'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {isLoading && items.length === 0 ? (
              <div className="p-4 text-sm text-white/60">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-white/60">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unread.length > 0 && (
                  <div className="px-2 pt-1 text-[11px] font-semibold text-white/50">
                    New
                  </div>
                )}
                {unread.map(renderItem)}

                {read.length > 0 && (
                  <div className="px-2 pt-2 text-[11px] font-semibold text-white/50">
                    Earlier
                  </div>
                )}
                {read.map(renderItem)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


