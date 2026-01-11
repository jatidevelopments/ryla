import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsList } from './NotificationsList';

// Mock NotificationItem
vi.mock('./NotificationItem', () => ({
  NotificationItem: ({ notification, onMarkRead }: any) => (
    <div data-testid="notification-item">
      <span>{notification.title}</span>
      <button onClick={() => onMarkRead(notification.id)}>Mark</button>
    </div>
  ),
}));

describe('NotificationsList', () => {
  const defaultProps = {
    notifications: [],
    unreadNotifications: [],
    readNotifications: [],
    isLoading: false,
    onMarkRead: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    render(<NotificationsList {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should render empty message', () => {
    render(<NotificationsList {...defaultProps} />);
    expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
  });

  it('should render grouped notifications', () => {
    const unread = [{ id: '1', title: 'New one', isRead: false }];
    const read = [{ id: '2', title: 'Old one', isRead: true }];

    render(
      <NotificationsList
        {...defaultProps}
        notifications={[...unread, ...read]}
        unreadNotifications={unread}
        readNotifications={read}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Earlier')).toBeInTheDocument();
    expect(screen.getAllByTestId('notification-item')).toHaveLength(2);
    expect(screen.getByText('New one')).toBeInTheDocument();
    expect(screen.getByText('Old one')).toBeInTheDocument();
  });

  it('should call onMarkRead', () => {
    const unread = [{ id: '1', title: 'New one', isRead: false }];
    render(
      <NotificationsList
        {...defaultProps}
        unreadNotifications={unread}
        notifications={unread}
      />
    );

    fireEvent.click(screen.getByText('Mark'));
    expect(defaultProps.onMarkRead).toHaveBeenCalledWith('1');
  });
});
