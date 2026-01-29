import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './use-notifications';
import { trpc } from '../trpc';

// Mock TRPC
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseUtils = vi.fn();

vi.mock('../trpc', () => ({
  trpc: {
    notifications: {
      list: {
        useQuery: (opts: any, config: any) => mockUseQuery(opts, config),
      },
      markAllRead: {
        useMutation: (opts: any) => mockUseMutation(opts),
      },
      markRead: {
        useMutation: (opts: any) => mockUseMutation(opts),
      },
    },
    useUtils: () => mockUseUtils(),
  },
}));

describe('useNotifications', () => {
  const mockUtils = {
    notifications: {
      list: {
        invalidate: vi.fn(),
      },
    },
  };

  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Test Notification',
      message: 'Test message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'notif-2',
      title: 'Another Notification',
      message: 'Another message',
      read: true,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUtils.mockReturnValue(mockUtils);
    mockUseQuery.mockReturnValue({
      data: {
        items: mockNotifications,
        total: 2,
        unreadCount: 1,
        limit: 20,
        offset: 0,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it('should return notifications data', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.items).toEqual(mockNotifications);
    expect(result.current.total).toBe(2);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.limit).toBe(20);
    expect(result.current.offset).toBe(0);
  });

  it('should return default values when data is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.limit).toBe(20);
    expect(result.current.offset).toBe(0);
  });

  it('should use custom limit and offset', () => {
    renderHook(() => useNotifications({ limit: 10, offset: 5 }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      { limit: 10, offset: 5 },
      expect.objectContaining({
        refetchInterval: 30000,
        placeholderData: expect.any(Function),
      })
    );
  });

  it('should use custom refetch interval', () => {
    renderHook(() => useNotifications({ refetchIntervalMs: 60000 }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      { limit: 20, offset: 0 },
      expect.objectContaining({
        refetchInterval: 60000,
      })
    );
  });

  it('should default to 20 limit and 0 offset', () => {
    renderHook(() => useNotifications());

    expect(mockUseQuery).toHaveBeenCalledWith(
      { limit: 20, offset: 0 },
      expect.any(Object)
    );
  });

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.isLoading).toBe(true);
  });

  it('should show error state', () => {
    const mockError = new Error('Failed to load notifications');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.error).toBe(mockError);
  });

  it('should expose refetch function', () => {
    const mockRefetch = vi.fn();
    mockUseQuery.mockReturnValue({
      data: { items: [], total: 0, unreadCount: 0, limit: 20, offset: 0 },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.refetch();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should mark all notifications as read', async () => {
    const mockMarkAllRead = vi.fn();
    mockUseMutation.mockImplementation((opts: any) => {
      // Call onSuccess when mutation is created
      if (opts?.onSuccess) {
        opts.onSuccess();
      }
      return {
        mutate: mockMarkAllRead,
        isPending: false,
      };
    });

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markAllRead();
    });

    expect(mockMarkAllRead).toHaveBeenCalled();
    expect(mockUtils.notifications.list.invalidate).toHaveBeenCalled();
  });

  it('should mark single notification as read', async () => {
    const mockMarkRead = vi.fn();
    mockUseMutation.mockImplementation((opts: any) => {
      // Call onSuccess when mutation is created
      if (opts?.onSuccess) {
        opts.onSuccess();
      }
      return {
        mutate: mockMarkRead,
        isPending: false,
      };
    });

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markRead('notif-1');
    });

    expect(mockMarkRead).toHaveBeenCalledWith({ notificationId: 'notif-1' });
    expect(mockUtils.notifications.list.invalidate).toHaveBeenCalled();
  });

  it('should show marking all read state', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.isMarkingAllRead).toBe(true);
  });

  it('should show marking read state', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.isMarkingRead).toBe(true);
  });
});
