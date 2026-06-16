import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useNotificationStore } from '../../../store/notificationStore';

export function useMarkAllRead() {
  const qc = useQueryClient();
  const reset = useNotificationStore((s) => s.reset);

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      reset();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
