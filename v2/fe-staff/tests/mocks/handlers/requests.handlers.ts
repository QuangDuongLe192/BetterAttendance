import { http, HttpResponse } from 'msw';

export const requestsHandlers = [
  http.get('/api/requests', () =>
    HttpResponse.json({
      requests: [],
      counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
      nextCursor: null,
    }),
  ),

  http.get('/api/requests/:id', ({ params }) =>
    HttpResponse.json({
      id: params.id,
      type: 'leave',
      status: 'pending',
      startDate: '2026-05-20',
      reason: 'Việc gia đình',
      submittedAt: '2026-05-19T10:00:00',
    }),
  ),

  http.post('/api/requests', () =>
    HttpResponse.json({
      id: 'req_new',
      type: 'leave',
      status: 'pending',
      startDate: '2026-06-01',
      reason: 'Test',
      submittedAt: new Date().toISOString(),
    }),
  ),
];
