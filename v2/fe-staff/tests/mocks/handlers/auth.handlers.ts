import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/auth/login', () =>
    HttpResponse.json({ token: 'test-token', expiresAt: Date.now() + 3_600_000 }),
  ),

  http.get('/api/me', ({ request }) => {
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json({ code: 'TOKEN_EXPIRED', messageKey: 'error.token_expired' }, { status: 401 });
    }
    return HttpResponse.json({
      id: 'u1',
      name: 'Nguyễn Văn A',
      email: 'nva@company.com',
      avatar: null,
      role: 'staff',
    });
  }),
];
