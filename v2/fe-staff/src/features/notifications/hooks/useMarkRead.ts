import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useNotificationStore } from '../../../store/notificationStore';

export function useMarkRead() {
  const qc = useQueryClient();
  const decrement = useNotificationStore((s) => s.decrement);

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      decrement();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
