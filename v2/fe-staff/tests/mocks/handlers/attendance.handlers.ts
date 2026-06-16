import { http, HttpResponse } from 'msw';

export const attendanceHandlers = [
  http.get('/api/attendance/today', () =>
    HttpResponse.json({
      shifts: [
        {
          shiftId: 'shift_001',
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '16:00',
          locationName: 'Vincom Center · Q1',
          roleName: 'Barista',
          clockIn: null,
          clockOut: null,
          validationMode: 'none',
          allowedWifis: [],
          geofence: null,
        },
      ],
    }),
  ),

  http.get('/api/attendance/weekly', () =>
    HttpResponse.json({ days: [] }),
  ),

  http.get('/api/attendance/earnings', () =>
    HttpResponse.json({
      grossEarningsVnd: 4600000,
      periodStart: '2026-05-15',
      periodEnd: '2026-06-14',
      periodLabel: '15/05 — 14/06',
      hours: '78h00',
      shifts: 10,
      payday: '2026-06-15',
    }),
  ),

  http.post('/api/attendance/clock-in', () =>
    HttpResponse.json({ shiftId: 'shift_001', clockInTime: '2026-05-29T08:01:00' }),
  ),

  http.post('/api/attendance/clock-out', () =>
    HttpResponse.json({ totalMinutes: 480, clockOutTime: '2026-05-29T16:01:00', earnedVnd: 440000 }),
  ),
];
