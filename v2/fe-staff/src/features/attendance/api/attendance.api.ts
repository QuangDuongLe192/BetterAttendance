import { authHeaders, request } from '../../../shared/api/http';
import type {
  ClockInRequest,
  ClockInResponse,
  ClockOutRequest,
  ClockOutResponse,
  EarningsResponse,
  TodayShiftsResponse,
  WeeklyShiftsResponse,
} from '../types';

const BASE = '/api/attendance';

type RawShift = {
  date: string;
  startTime?: string;
  endTime?: string;
  start?: number;
  end?: number;
  clockIn?: string | number | null;
  clockOut?: string | number | null;
  [key: string]: unknown;
};

function normalizeShift(raw: RawShift) {
  const start = raw.start != null
    ? Number(raw.start)
    : new Date(`${raw.date}T${raw.startTime}:00`).getTime();
  const end = raw.end != null
    ? Number(raw.end)
    : new Date(`${raw.date}T${raw.endTime}:00`).getTime();
  const clockIn = raw.clockIn == null ? null
    : typeof raw.clockIn === 'number' ? raw.clockIn
    : new Date(raw.clockIn).getTime();
  const clockOut = raw.clockOut == null ? null
    : typeof raw.clockOut === 'number' ? raw.clockOut
    : new Date(raw.clockOut).getTime();
  return { ...raw, start, end, clockIn, clockOut };
}

export const attendanceApi = {
  getTodayShifts: () =>
    request<{ shifts: RawShift[] }>(`${BASE}/today`, { headers: authHeaders() })
      .then((res) => ({ shifts: res.shifts.map(normalizeShift) }) as TodayShiftsResponse),

  getWeeklyShifts: (weekStart: string) =>
    request<{ days: { date: string; shifts: RawShift[] }[] }>(
      `${BASE}/weekly?weekStart=${weekStart}`,
      { headers: authHeaders() },
    ).then((res) => ({
      days: res.days.map((d) => ({ ...d, shifts: d.shifts.map(normalizeShift) })),
    }) as WeeklyShiftsResponse),

  getEarnings: (month: string) =>
    request<EarningsResponse>(`${BASE}/earnings?month=${month}`, {
      headers: authHeaders(),
    }),

  clockIn: (body: ClockInRequest) =>
    request<ClockInResponse>(`${BASE}/clock-in`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  clockOut: (body: ClockOutRequest) =>
    request<ClockOutResponse>(`${BASE}/clock-out`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),
};
