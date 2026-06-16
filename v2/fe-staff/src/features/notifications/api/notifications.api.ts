import { authHeaders, request } from '../../../shared/api/http';
import type { NotificationFilter, NotificationsResponse } from '../types';

const BASE = '/api/notifications';

export const notificationsApi = {
  list: (filter: NotificationFilter, cursor?: string) => {
    const params = new URLSearchParams({ filter });
    if (cursor) params.set('cursor', cursor);
    return request<NotificationsResponse>(`${BASE}?${params}`, {
      headers: authHeaders(),
    });
  },

  markRead: (id: string) =>
    request<{ ok: boolean }>(`${BASE}/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    }),

  markAllRead: () =>
    request<{ ok: boolean }>(`${BASE}/mark-all-read`, {
      method: 'PATCH',
      headers: authHeaders(),
    }),
};
