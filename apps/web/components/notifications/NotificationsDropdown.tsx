'use client';

import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsList } from './NotificationsList';
import { type Notification } from './utils';

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
