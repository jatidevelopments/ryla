'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { capture } from '@ryla/analytics';
import { useNotifications } from '../../lib/hooks/use-notifications';
import { ClockIcon } from './ClockIcon';
import { PickerDrawer } from '../studio/generation/pickers/PickerDrawer';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsList } from './NotificationsList';

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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

      <PickerDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={rootRef}
        desktopPosition="bottom"
        align="right"
        className="w-[360px] max-w-[95vw]"
      >
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
        />

        <div className="max-h-[420px] overflow-y-auto p-2">
          <NotificationsList
            notifications={items}
            unreadNotifications={unread}
            readNotifications={read}
            isLoading={isLoading}
            onMarkRead={markRead}
            onClose={() => setOpen(false)}
          />
        </div>
      </PickerDrawer>
    </div>
  );
}
