import { http, HttpResponse } from 'msw';

export const notificationsHandlers = [
  http.get('/api/notifications', () =>
    HttpResponse.json({
      notifications: [],
      unreadCount: 0,
      nextCursor: null,
    }),
  ),

  http.patch('/api/notifications/:id/read', () =>
    HttpResponse.json({ success: true }),
  ),

  http.patch('/api/notifications/mark-all-read', () =>
    HttpResponse.json({ success: true }),
  ),
];
