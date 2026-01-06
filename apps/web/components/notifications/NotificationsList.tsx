'use client';

import { NotificationItem } from './NotificationItem';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  isRead: boolean;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface NotificationsListProps {
  notifications: Notification[];
  unreadNotifications: Notification[];
  readNotifications: Notification[];
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationsList({
  notifications,
  unreadNotifications,
  readNotifications,
  isLoading,
  onMarkRead,
  onClose,
}: NotificationsListProps) {
  if (isLoading && notifications.length === 0) {
    return <div className="p-4 text-sm text-white/60">Loading…</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-sm text-white/60">No notifications yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {unreadNotifications.length > 0 && (
        <div className="px-2 pt-1 text-[11px] font-semibold text-white/50">
          New
        </div>
      )}
      {unreadNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onClose={onClose}
        />
      ))}

      {readNotifications.length > 0 && (
        <div className="px-2 pt-2 text-[11px] font-semibold text-white/50">
          Earlier
        </div>
      )}
      {readNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

