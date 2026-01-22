'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { capture } from '@ryla/analytics';
import {
  estimateCreditCost,
  formatRelativeTime,
  type Notification,
} from './utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  onClose,
}: NotificationItemProps) {
  // Extract metadata for enhanced display
  const metadata = n.metadata as Record<string, unknown> | null;
  const thumbnailUrl = metadata?.thumbnailUrl as string | null;
  const baseImageUrl = metadata?.baseImageUrl as string | null;
  const imageCount = metadata?.imageCount as number | null;
  const characterId = metadata?.characterId as string | null;

  // Calculate credit cost for generation notifications (use default since qualityMode removed)
  const isGeneration = n.type === 'generation.completed';
  const isCharacterCreated = n.type === 'character.created';
  const creditCost = isGeneration
    ? estimateCreditCost(null, imageCount)
    : null;

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
          <div
            className={cn(
              'text-sm truncate',
              n.isRead ? 'text-white/70' : 'text-white'
            )}
          >
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
    hasLink &&
      'hover:border-purple-500/30 border border-transparent cursor-pointer'
  );

  const onClick = () => {
    capture('notifications.notification_clicked', {
      notification_id: n.id,
      type: n.type,
      has_href: Boolean(n.href),
    });
    if (!n.isRead) {
      onMarkRead(n.id);
      capture('notifications.notification_marked_read', {
        notification_id: n.id,
        type: n.type,
        source: 'menu_click',
      });
    }
    onClose();
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
}
