import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsMenu } from './NotificationsMenu';
import { useNotifications } from '../../lib/hooks/use-notifications';
import { capture } from '@ryla/analytics';

// Mock Hooks
vi.mock('../../lib/hooks/use-notifications', () => ({
  useNotifications: vi.fn(),
}));

vi.mock('@ryla/analytics', () => ({
  capture: vi.fn(),
}));

// Mock UI
vi.mock('../studio/generation/pickers/PickerDrawer', () => ({
  PickerDrawer: ({ children, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="picker-drawer">
        <button onClick={onClose}>CloseDrawer</button>
        {children}
      </div>
    ) : null,
}));

vi.mock('./NotificationsHeader', () => ({
  NotificationsHeader: ({ unreadCount, onMarkAllRead }: any) => (
    <div data-testid="notifications-header">
      <span>Unread: {unreadCount}</span>
      <button onClick={onMarkAllRead}>MarkAll</button>
    </div>
  ),
}));

vi.mock('./NotificationsList', () => ({
  NotificationsList: ({ onMarkRead }: any) => (
    <div data-testid="notifications-list">
      <button onClick={() => onMarkRead('1')}>Mark1</button>
    </div>
  ),
}));

vi.mock('./ClockIcon', () => ({
  ClockIcon: () => <div data-testid="clock-icon" />,
}));

describe('NotificationsMenu', () => {
  const mockMarkAllRead = vi.fn();
  const mockMarkRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotifications as any).mockReturnValue({
      items: [],
      unreadCount: 0,
      isLoading: false,
      markAllRead: mockMarkAllRead,
      markRead: mockMarkRead,
    });
  });

  it('should render icon and handle empty unread count', () => {
    render(<NotificationsMenu />);
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render unread count badge', () => {
    (useNotifications as any).mockReturnValue({
      items: [],
      unreadCount: 5,
      isLoading: false,
      markAllRead: mockMarkAllRead,
      markRead: mockMarkRead,
    });
    render(<NotificationsMenu />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should open drawer and capture event when clicked', () => {
    render(<NotificationsMenu />);
    fireEvent.click(screen.getByLabelText('Notifications'));

    expect(screen.getByTestId('picker-drawer')).toBeInTheDocument();
    expect(capture).toHaveBeenCalledWith(
      'notifications.menu_opened',
      expect.anything()
    );
  });

  it('should call markAllRead and capture event', () => {
    (useNotifications as any).mockReturnValue({
      items: [],
      unreadCount: 5,
      isLoading: false,
      markAllRead: mockMarkAllRead,
      markRead: mockMarkRead,
    });
    render(<NotificationsMenu />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    fireEvent.click(screen.getByText('MarkAll'));

    expect(mockMarkAllRead).toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(
      'notifications.mark_all_read_clicked',
      expect.anything()
    );
  });
});
