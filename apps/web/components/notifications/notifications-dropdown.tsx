'use client';

import { NotificationsHeader } from './notifications-header';
import { NotificationsList } from './notifications-list';

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

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadNotifications: Notification[];
  readNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationsDropdown({
  notifications,
  unreadNotifications,
  readNotifications,
  unreadCount,
  isLoading,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: NotificationsDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] overflow-hidden rounded-xl border border-white/10 bg-[#121214] shadow-xl">
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={onMarkAllRead}
      />

      <div className="max-h-[420px] overflow-y-auto p-2">
        <NotificationsList
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          readNotifications={readNotifications}
          isLoading={isLoading}
          onMarkRead={onMarkRead}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

