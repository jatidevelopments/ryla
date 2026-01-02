'use client';

import { trpc } from '../trpc';

export interface UseNotificationsOptions {
  limit?: number;
  offset?: number;
  refetchIntervalMs?: number;
}

/**
 * Hook to list notifications and manage read state.
 */
export function useNotifications(options?: UseNotificationsOptions) {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const utils = trpc.useUtils();

  const query = trpc.notifications.list.useQuery(
    { limit, offset },
    {
      refetchInterval: options?.refetchIntervalMs ?? 30000,
      placeholderData: (prev) => prev,
    }
  );

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
    },
  });

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
    },
  });

  return {
    // Data
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    unreadCount: query.data?.unreadCount ?? 0,
    limit: query.data?.limit ?? limit,
    offset: query.data?.offset ?? offset,

    // State
    isLoading: query.isLoading,
    error: query.error,

    // Actions
    refetch: query.refetch,
    markAllRead: () => markAllReadMutation.mutate(),
    isMarkingAllRead: markAllReadMutation.isPending,
    markRead: (notificationId: string) =>
      markReadMutation.mutate({ notificationId }),
    isMarkingRead: markReadMutation.isPending,
  };
}


