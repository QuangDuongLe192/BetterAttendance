import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../tests/mocks/server';
import { attendanceApi } from './attendance.api';
import { useAuthStore } from '../../../store/authStore';

beforeEach(() => {
  useAuthStore.setState({ accessToken: 'test-token', user: null });
});

// EPIC-001-CT-03: POST /api/attendance/clock-in — request shape + auth header
describe('attendanceApi.clockIn', () => {
  it('CT-03a: sends shiftId and idempotencyKey in body', async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post('/api/attendance/clock-in', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ shiftId: 'shift_001', clockInTime: '2026-05-29T08:01:00' });
      }),
    );

    await attendanceApi.clockIn({ shiftId: 'shift_001', idempotencyKey: 'uuid-abc' });

    expect(capturedBody).toEqual({ shiftId: 'shift_001', idempotencyKey: 'uuid-abc' });
  });

  it('CT-03b: sends Authorization Bearer header (not X-User-Id)', async () => {
    let capturedAuth: string | null = null;
    let hasUserIdHeader = false;
    server.use(
      http.post('/api/attendance/clock-in', ({ request }) => {
        capturedAuth = request.headers.get('Authorization');
        hasUserIdHeader = request.headers.has('X-User-Id');
        return HttpResponse.json({ shiftId: 'shift_001', clockInTime: '2026-05-29T08:01:00' });
      }),
    );

    await attendanceApi.clockIn({ shiftId: 'shift_001', idempotencyKey: 'uuid-abc' });

    expect(capturedAuth).toBe('Bearer test-token');
    expect(hasUserIdHeader).toBe(false);
  });

  // EPIC-001-CT-04: 409 ALREADY_CLOCKED_IN
  it('CT-04: throws ApiError with code ALREADY_CLOCKED_IN on 409', async () => {
    server.use(
      http.post('/api/attendance/clock-in', () =>
        HttpResponse.json({ code: 'ALREADY_CLOCKED_IN', messageKey: 'error.already_clocked_in' }, { status: 409 }),
      ),
    );

    await expect(
      attendanceApi.clockIn({ shiftId: 'shift_001', idempotencyKey: 'uuid-abc' }),
    ).rejects.toMatchObject({ code: 'ALREADY_CLOCKED_IN' });
  });
});

// EPIC-001-CT-13: Authorization header present on all authenticated calls
describe('attendanceApi — auth header coverage', () => {
  const endpoints = [
    { name: 'getTodayShifts', fn: () => attendanceApi.getTodayShifts() },
    { name: 'getWeeklyShifts', fn: () => attendanceApi.getWeeklyShifts('2026-05-25') },
  ] as const;

  for (const { name, fn } of endpoints) {
    it(`CT-13: ${name} sends Bearer header`, async () => {
      let capturedAuth: string | null = null;
      server.use(
        http.all(/\/api\/attendance/, ({ request }) => {
          capturedAuth = request.headers.get('Authorization');
          return HttpResponse.json({});
        }),
      );
      try { await fn(); } catch { /* response shape mismatch is fine */ }
      expect(capturedAuth).toBe('Bearer test-token');
    });
  }
});
