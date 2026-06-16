import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useNotificationStore } from '../../../store/notificationStore';
import type { NotificationFilter } from '../types';

export function useNotifications(filter: NotificationFilter) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useInfiniteQuery({
    queryKey: ['notifications', filter],
    queryFn: async ({ pageParam }) => {
      const data = await notificationsApi.list(filter, pageParam as string | undefined);
      setUnreadCount(data.unreadCount);
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}
