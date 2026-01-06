'use client';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

export function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-white">Notifications</div>
        <div className="text-xs text-white/50">
          {unreadCount > 0 ? `You have ${unreadCount} unread` : 'All caught up'}
        </div>
      </div>
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Mark all read
        </button>
      )}
    </div>
  );
}

