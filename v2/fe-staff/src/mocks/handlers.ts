import { http, HttpResponse } from 'msw';
import type { RequestType, RequestStatus } from '../features/requests/types';

// ── Admin / Manager types ────────────────────────────────────────────────────
export interface AdminRequestDto {
  id: string;
  staffId: string;
  staffName: string;
  branchName: string;
  type: RequestType;
  status: RequestStatus;
  startDate: string;
  endDate?: string;
  time?: string;
  reason: string;
  submittedAt: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ManagerEmployee {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface ManagerShift {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'completed' | 'absent';
}

// ── Shared state (in-memory, resets on page refresh) ────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

// Shift 1: clocked in, endTime already passed (1 hour ago)
const _now = new Date();
const _pad = (n: number) => String(n).padStart(2, '0');
const _endedHour = Math.max(0, _now.getHours() - 1);
const _shift1End = `${_pad(_endedHour)}:${_pad(_now.getMinutes())}`;
const _shift1Start = `${_pad(Math.max(0, _endedHour - 8))}:${_pad(_now.getMinutes())}`;

// Shift 2: not clocked in, currently active (started 30 min ago, ends in 4 hours)
const _startedMins = _now.getHours() * 60 + _now.getMinutes() - 30;
const _endMins = _now.getHours() * 60 + _now.getMinutes() + 240;
const _shift2Start = `${_pad(Math.floor(_startedMins / 60))}:${_pad(_startedMins % 60)}`;
const _shift2End = `${_pad(Math.floor(_endMins / 60))}:${_pad(_endMins % 60)}`;

const shifts = [
  {
    shiftId: 'shift_today_1',
    date: TODAY,
    start: new Date(`${TODAY}T${_shift1Start}:00`).getTime(),
    end: new Date(`${TODAY}T${_shift1End}:00`).getTime(),
    locationName: 'Vincom Center · Q1',
    roleName: 'Barista',
    clockIn: new Date(`${TODAY}T${_shift1Start}:00`).getTime() as number | null,
    clockOut: null as number | null,
    validationMode: 'none',
    geofence: null,
    address: '70 Lê Thánh Tôn, Q1',
    breakWindow: '12:00 – 13:00',
    expectedPayVnd: 432000,
    managerName: 'Nguyễn Thị Lan',
    managerRole: 'Quản lý ca',
  },
  {
    shiftId: 'shift_today_2',
    date: TODAY,
    start: new Date(`${TODAY}T${_shift2Start}:00`).getTime(),
    end: new Date(`${TODAY}T${_shift2End}:00`).getTime(),
    locationName: 'Crescent Mall · Q7',
    roleName: 'Phục vụ',
    clockIn: null as number | null,
    clockOut: null as number | null,
    validationMode: 'geo',
    geofence: { lat: 10.7302, lng: 106.7224, radiusMeters: 50000 },
    address: '101 Tôn Dật Tiên, Q7',
    breakWindow: '17:00 – 17:30',
    expectedPayVnd: 216000,
    managerName: 'Trần Văn Bình',
    managerRole: 'Quản lý ca',
  },
];

const notifications = [
  {
    id: 'notif_1',
    type: 'new_shift',
    icon: '📅',
    title: 'Ca mới được phân công',
    message: 'Bạn có ca làm hôm nay 08:00–16:00 tại Vincom Center · Q1.',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    isRead: false,
    actionTarget: '/',
  },
  {
    id: 'notif_2',
    type: 'request_approved',
    icon: '✅',
    title: 'Đơn nghỉ phép đã được duyệt',
    message: 'Đơn nghỉ phép ngày 01–02/06 của bạn đã được Lan duyệt.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    isRead: false,
    actionTarget: '/requests/req_1',
  },
  {
    id: 'notif_3',
    type: 'checkin_reminder',
    icon: '⏰',
    title: 'Nhắc nhở chấm công',
    message: 'Ca làm của bạn bắt đầu lúc 08:00. Đừng quên chấm công!',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    isRead: true,
    actionTarget: '/',
  },
  {
    id: 'notif_4',
    type: 'announcement',
    icon: '📢',
    title: 'Thông báo từ quản lý',
    message: 'Lịch làm việc tuần tới đã được cập nhật. Vui lòng kiểm tra.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true,
    actionTarget: '/calendar',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let requests: any[] = [
  {
    id: 'req_1',
    type: 'leave',
    status: 'approved',
    startDate: '2026-06-01',
    endDate: '2026-06-02',
    reason: 'Việc gia đình',
    submittedAt: '2026-05-25T10:00:00',
    reviewerName: 'Nguyễn Thị Lan',
    reviewedAt: '2026-05-25T14:00:00',
    reviewComment: 'Đã duyệt. Chúc nghỉ vui!',
  },
  {
    id: 'req_2',
    type: 'late',
    status: 'pending',
    startDate: '2026-05-30',
    reason: 'Kẹt xe trên đường đến',
    submittedAt: '2026-05-29T22:00:00',
  },
  {
    id: 'req_3',
    type: 'early',
    status: 'rejected',
    startDate: '2026-05-20',
    reason: 'Hẹn khám bác sĩ',
    submittedAt: '2026-05-19T09:00:00',
    reviewerName: 'Trần Văn Bình',
    reviewedAt: '2026-05-19T11:00:00',
    reviewComment: 'Không đủ lý do. Vui lòng sắp xếp lại.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Weekly shifts seed (Mon–Sun relative to today's week)
const todayMonday = getMonday(new Date());
const WEEKLY_SEED = [
  { dayOffset: 0, startTime: '08:00', endTime: '16:00', locationName: 'Vincom Center · Q1', roleName: 'Barista', status: 'completed' },
  { dayOffset: 1, startTime: '13:00', endTime: '21:00', locationName: 'Crescent Mall · Q7', roleName: 'Phục vụ', status: 'completed' },
  { dayOffset: 2, startTime: '08:00', endTime: '16:00', locationName: 'Vincom Center · Q1', roleName: 'Barista', status: 'scheduled' },
  { dayOffset: 4, startTime: '10:00', endTime: '18:00', locationName: 'Aeon Mall · Bình Tân', roleName: 'Phục vụ', status: 'scheduled' },
  { dayOffset: 5, startTime: '07:00', endTime: '12:00', locationName: 'Vincom Center · Q1', roleName: 'Barista', status: 'scheduled' },
];

// ── Admin requests seed data ──────────────────────────────────────────────────
export const adminRequests: AdminRequestDto[] = [
  {
    id: 'req-001', staffId: 'NV001', staffName: 'Nguyễn Văn An',
    branchName: 'Chi nhánh Quận 1', type: 'leave', status: 'pending',
    startDate: '2026-06-05', endDate: '2026-06-06',
    reason: 'Gia đình có việc đột xuất cần về quê.',
    submittedAt: '2026-06-02T08:30:00Z',
  },
  {
    id: 'req-002', staffId: 'NV002', staffName: 'Trần Thị Bình',
    branchName: 'Chi nhánh Quận 3', type: 'late', status: 'pending',
    startDate: '2026-06-03', time: '09:30',
    reason: 'Kẹt xe nghiêm trọng, dự kiến đến lúc 9:30.',
    submittedAt: '2026-06-02T07:15:00Z',
  },
  {
    id: 'req-003', staffId: 'NV003', staffName: 'Lê Hoàng Minh',
    branchName: 'Chi nhánh Quận 7', type: 'early', status: 'pending',
    startDate: '2026-06-04', time: '17:00',
    reason: 'Phải đưa con đi khám bác sĩ lúc 5 giờ chiều.',
    submittedAt: '2026-06-01T15:00:00Z',
  },
  {
    id: 'req-004', staffId: 'NV004', staffName: 'Phạm Thị Lan',
    branchName: 'Chi nhánh Quận 1', type: 'leave', status: 'pending',
    startDate: '2026-06-10', endDate: '2026-06-12',
    reason: 'Thi chứng chỉ nghề.',
    submittedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'req-005', staffId: 'NV005', staffName: 'Đỗ Quang Huy',
    branchName: 'Chi nhánh Quận 3', type: 'late', status: 'pending',
    startDate: '2026-06-03', time: '08:45',
    reason: 'Xe hỏng trên đường đi.',
    submittedAt: '2026-06-02T06:50:00Z',
  },
  {
    id: 'req-006', staffId: 'NV001', staffName: 'Nguyễn Văn An',
    branchName: 'Chi nhánh Quận 1', type: 'leave', status: 'approved',
    startDate: '2026-05-20', endDate: '2026-05-21',
    reason: 'Nghỉ phép năm.',
    submittedAt: '2026-05-15T09:00:00Z',
    reviewerName: 'Admin Hệ thống', reviewedAt: '2026-05-16T10:30:00Z',
    reviewComment: 'Đã duyệt. Chúc nghỉ ngơi vui vẻ!',
  },
  {
    id: 'req-007', staffId: 'NV002', staffName: 'Trần Thị Bình',
    branchName: 'Chi nhánh Quận 3', type: 'early', status: 'rejected',
    startDate: '2026-05-28', time: '16:00',
    reason: 'Muốn về sớm để đi chơi.',
    submittedAt: '2026-05-27T11:00:00Z',
    reviewerName: 'Admin Hệ thống', reviewedAt: '2026-05-27T14:00:00Z',
    reviewComment: 'Lý do không đủ chính đáng.',
  },
  {
    id: 'req-008', staffId: 'NV003', staffName: 'Lê Hoàng Minh',
    branchName: 'Chi nhánh Quận 7', type: 'late', status: 'approved',
    startDate: '2026-05-25', time: '10:00',
    reason: 'Khám sức khỏe định kỳ.',
    submittedAt: '2026-05-24T16:00:00Z',
    reviewerName: 'Admin Hệ thống', reviewedAt: '2026-05-25T08:00:00Z',
    reviewComment: 'Chấp thuận.',
  },
];

// ── Manager employees + shifts seed data ─────────────────────────────────────
export const MOCK_EMPLOYEES: ManagerEmployee[] = [
  { id: 'NV001', name: 'Nguyễn Văn An',  role: 'Phục vụ',  avatarUrl: null },
  { id: 'NV002', name: 'Trần Thị Bình',  role: 'Thu ngân', avatarUrl: null },
  { id: 'NV003', name: 'Lê Hoàng Minh',  role: 'Pha chế',  avatarUrl: null },
  { id: 'NV004', name: 'Phạm Thị Lan',   role: 'Phục vụ',  avatarUrl: null },
  { id: 'NV005', name: 'Đỗ Quang Huy',   role: 'Bảo vệ',   avatarUrl: null },
  { id: 'NV006', name: 'Võ Thị Hoa',     role: 'Phục vụ',  avatarUrl: null },
];

// Tuần 2–8/6/2026
export const MOCK_MANAGER_SHIFTS: ManagerShift[] = [
  { id: 's1',  employeeId: 'NV001', employeeName: 'Nguyễn Văn An',  employeeRole: 'Phục vụ',  date: '2026-06-02', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'completed' },
  { id: 's2',  employeeId: 'NV002', employeeName: 'Trần Thị Bình',  employeeRole: 'Thu ngân', date: '2026-06-02', startTime: '09:00', endTime: '17:00', location: 'Chi nhánh Quận 1', status: 'completed' },
  { id: 's3',  employeeId: 'NV003', employeeName: 'Lê Hoàng Minh',  employeeRole: 'Pha chế',  date: '2026-06-02', startTime: '14:00', endTime: '22:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's4',  employeeId: 'NV001', employeeName: 'Nguyễn Văn An',  employeeRole: 'Phục vụ',  date: '2026-06-03', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's5',  employeeId: 'NV004', employeeName: 'Phạm Thị Lan',   employeeRole: 'Phục vụ',  date: '2026-06-03', startTime: '09:00', endTime: '17:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's6',  employeeId: 'NV005', employeeName: 'Đỗ Quang Huy',   employeeRole: 'Bảo vệ',   date: '2026-06-03', startTime: '07:00', endTime: '15:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's7',  employeeId: 'NV002', employeeName: 'Trần Thị Bình',  employeeRole: 'Thu ngân', date: '2026-06-04', startTime: '09:00', endTime: '17:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's8',  employeeId: 'NV006', employeeName: 'Võ Thị Hoa',     employeeRole: 'Phục vụ',  date: '2026-06-04', startTime: '14:00', endTime: '22:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's9',  employeeId: 'NV003', employeeName: 'Lê Hoàng Minh',  employeeRole: 'Pha chế',  date: '2026-06-04', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'absent' },
  { id: 's10', employeeId: 'NV001', employeeName: 'Nguyễn Văn An',  employeeRole: 'Phục vụ',  date: '2026-06-05', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's11', employeeId: 'NV004', employeeName: 'Phạm Thị Lan',   employeeRole: 'Phục vụ',  date: '2026-06-05', startTime: '14:00', endTime: '22:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's12', employeeId: 'NV002', employeeName: 'Trần Thị Bình',  employeeRole: 'Thu ngân', date: '2026-06-06', startTime: '09:00', endTime: '17:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's13', employeeId: 'NV005', employeeName: 'Đỗ Quang Huy',   employeeRole: 'Bảo vệ',   date: '2026-06-06', startTime: '07:00', endTime: '15:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's14', employeeId: 'NV006', employeeName: 'Võ Thị Hoa',     employeeRole: 'Phục vụ',  date: '2026-06-06', startTime: '14:00', endTime: '22:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's15', employeeId: 'NV001', employeeName: 'Nguyễn Văn An',  employeeRole: 'Phục vụ',  date: '2026-06-07', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's16', employeeId: 'NV003', employeeName: 'Lê Hoàng Minh',  employeeRole: 'Pha chế',  date: '2026-06-07', startTime: '14:00', endTime: '22:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's17', employeeId: 'NV004', employeeName: 'Phạm Thị Lan',   employeeRole: 'Phục vụ',  date: '2026-06-08', startTime: '09:00', endTime: '17:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
  { id: 's18', employeeId: 'NV006', employeeName: 'Võ Thị Hoa',     employeeRole: 'Phục vụ',  date: '2026-06-08', startTime: '08:00', endTime: '16:00', location: 'Chi nhánh Quận 1', status: 'scheduled' },
];

// ── Handlers ─────────────────────────────────────────────────────────────────
export const handlers = [
  // AUTH
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-token-demo-2026',
      expiresAt: Date.now() + 8 * 3600 * 1000,
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: 'NV001',
      name: 'Nguyễn Văn An',
      email: 'nva@candylio.com',
      avatar: null,
      role: 'staff',
    });
  }),

  http.get('/api/me', () => {
    return HttpResponse.json({
      id: 'NV001',
      name: 'Nguyễn Văn An',
      email: 'nva@candylio.com',
      avatar: null,
      role: 'staff',
    });
  }),

  // ATTENDANCE — today's shifts
  http.get('/api/attendance/today', async () => {

    const todayShifts = shifts.filter(s => s.date === TODAY);
    return HttpResponse.json({ shifts: todayShifts });
  }),

  // ATTENDANCE — weekly shifts
  http.get('/api/attendance/weekly', async ({ request }) => {

    const url = new URL(request.url);
    const weekStartParam = url.searchParams.get('weekStart') ?? isoDate(todayMonday);
    const weekStart = new Date(weekStartParam + 'T00:00:00');

    const days = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dateStr = isoDate(day);

      // Inject today's real shifts for today
      if (dateStr === TODAY) {
        return { date: dateStr, shifts: shifts.filter(s => s.date === TODAY) };
      }

      const dayOffset = Math.round((day.getTime() - todayMonday.getTime()) / 86400000);
      const seed = WEEKLY_SEED.find(s => s.dayOffset === dayOffset);
      if (!seed) return { date: dateStr, shifts: [] };
      return {
        date: dateStr,
        shifts: [{
          shiftId: `weekly_${dateStr}`,
          date: dateStr,
          ...seed,
          clockIn: seed.status === 'completed' ? `${dateStr}T${seed.startTime}:00` : null,
          clockOut: seed.status === 'completed' ? `${dateStr}T${seed.endTime}:00` : null,
        }],
      };
    });

    return HttpResponse.json({ days });
  }),

  // ATTENDANCE — clock in
  http.post('/api/attendance/clock-in', async ({ request }) => {
    const body = await request.json() as { shiftId: string };
    const shift = shifts.find(s => s.shiftId === body.shiftId);
    if (!shift) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (shift.clockIn) return HttpResponse.json({ code: 'ALREADY_CLOCKED_IN' }, { status: 409 });
    const now = Date.now();
    shift.clockIn = now;
    return HttpResponse.json({ shiftId: shift.shiftId, clockInTime: now });
  }),

  // ATTENDANCE — clock out
  http.post('/api/attendance/clock-out', async ({ request }) => {
    const body = await request.json() as { shiftId: string };
    const shift = shifts.find(s => s.shiftId === body.shiftId);
    if (!shift) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (!shift.clockIn) return HttpResponse.json({ code: 'NOT_CLOCKED_IN' }, { status: 409 });
    if (shift.clockOut) return HttpResponse.json({ code: 'ALREADY_CLOCKED_OUT' }, { status: 409 });
    const now = Date.now();
    shift.clockOut = now;
    const totalMinutes = Math.round((now - shift.clockIn) / 60000);
    return HttpResponse.json({ shiftId: shift.shiftId, clockOutTime: now, totalMinutes, earnedVnd: totalMinutes * 800 });
  }),

  // ATTENDANCE — earnings
  http.get('/api/attendance/earnings', async ({ request }) => {

    const url = new URL(request.url);
    const month = url.searchParams.get('month') ?? TODAY.slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1).getTime();
    const end = new Date(y, m, 0, 23, 59, 59).getTime();
    const payday = new Date(y, m, 5).getTime();

    const SHIFT_SEEDS = [
      { dayOfMonth: 1,  startH: 8,  endH: 16, location: 'Vincom Center · Q1',  role: 'Barista',  rateVnd: 54_000 },
      { dayOfMonth: 3,  startH: 13, endH: 21, location: 'Crescent Mall · Q7',  role: 'Phục vụ',  rateVnd: 48_000 },
      { dayOfMonth: 7,  startH: 8,  endH: 16, location: 'Vincom Center · Q1',  role: 'Barista',  rateVnd: 54_000 },
      { dayOfMonth: 10, startH: 7,  endH: 12, location: 'Vincom Center · Q1',  role: 'Barista',  rateVnd: 54_000 },
      { dayOfMonth: 14, startH: 13, endH: 21, location: 'Crescent Mall · Q7',  role: 'Phục vụ',  rateVnd: 48_000 },
    ];

    const shiftBreakdown = SHIFT_SEEDS.map((s, i) => {
      const date = `${month}-${String(s.dayOfMonth).padStart(2, '0')}`;
      const shiftStart = new Date(y, m - 1, s.dayOfMonth, s.startH, 0, 0).getTime();
      const shiftEnd   = new Date(y, m - 1, s.dayOfMonth, s.endH,   0, 0).getTime();
      const hoursWorked = s.endH - s.startH;
      return {
        shiftId: `mock-shift-${month}-${i}`,
        date,
        start: shiftStart,
        end: shiftEnd,
        locationName: s.location,
        roleName: s.role,
        rateVnd: s.rateVnd,
        hoursWorked,
        earningsVnd: Math.round(hoursWorked * s.rateVnd),
      };
    });

    const grossEarningsVnd = shiftBreakdown.reduce((acc, s) => acc + s.earningsVnd, 0);
    const totalHours = shiftBreakdown.reduce((acc, s) => acc + s.hoursWorked, 0);

    const segments = [
      { roleName: 'Barista',  hours: 27, rateVnd: 54_000, earningsVnd: 27 * 54_000 },
      { roleName: 'Phục vụ', hours: 16, rateVnd: 48_000, earningsVnd: 16 * 48_000 },
    ];

    return HttpResponse.json({
      grossEarningsVnd,
      month,
      periodStart: start,
      periodEnd: end,
      hours: String(totalHours),
      shifts: shiftBreakdown.length,
      payday,
      segments,
      shiftBreakdown,
    });
  }),

  // NOTIFICATIONS — list
  http.get('/api/notifications', async ({ request }) => {

    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') ?? 'all';
    const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return HttpResponse.json({ notifications: filtered, unreadCount, nextCursor: null });
  }),

  // NOTIFICATIONS — mark single read
  http.patch('/api/notifications/:id/read', async ({ params }) => {

    const n = notifications.find(n => n.id === params.id);
    if (n) n.isRead = true;
    return HttpResponse.json({ success: true });
  }),

  // NOTIFICATIONS — mark all read
  http.patch('/api/notifications/mark-all-read', async () => {

    notifications.forEach(n => { n.isRead = true; });
    return HttpResponse.json({ success: true });
  }),

  // REQUESTS — list
  http.get('/api/requests', async ({ request }) => {

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'all';
    const filtered = status === 'all' ? requests : requests.filter(r => r.status === status);
    const counts = {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
    return HttpResponse.json({ requests: filtered, counts, nextCursor: null });
  }),

  // REQUESTS — detail
  http.get('/api/requests/:id', ({ params }) => {
    const req = requests.find(r => r.id === params.id);
    if (!req) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(req);
  }),

  // REQUESTS — create
  http.post('/api/requests', async ({ request }) => {

    const body = await request.json() as Record<string, string>;
    const newReq = {
      id: `req_${Date.now()}`,
      type: body.type,
      status: 'pending',
      startDate: body.startDate,
      endDate: body.endDate,
      time: body.time,
      reason: body.reason,
      submittedAt: new Date().toISOString(),
      reviewerName: undefined,
      reviewedAt: undefined,
      reviewComment: undefined,
    };
    requests = [newReq, ...requests];
    return HttpResponse.json(newReq, { status: 201 });
  }),

  // PROFILE — me
  http.get('/api/profile/me', async () => {

    return HttpResponse.json({
      userId: 'NV001',
      name: 'Nguyễn Văn An',
      email: 'nva@candylio.com',
      avatarUrl: null,
      languagePreference: 'vi',
    });
  }),

  // ADMIN REQUESTS — list
  http.get('/api/admin/requests', ({ request }) => {
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') ?? 'pending';
    const filtered = tab === 'pending'
      ? adminRequests.filter(r => r.status === 'pending')
      : adminRequests.filter(r => r.status !== 'pending');
    return HttpResponse.json({ requests: filtered });
  }),

  // ADMIN REQUESTS — detail
  http.get('/api/admin/requests/:id', ({ params }) => {
    const req = adminRequests.find(r => r.id === params.id);
    if (!req) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(req);
  }),

  // ADMIN REQUESTS — approve
  http.patch('/api/admin/requests/:id/approve', async ({ params, request }) => {
    const body = await request.json() as { reviewComment?: string };
    const req = adminRequests.find(r => r.id === params.id);
    if (!req) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    req.status = 'approved';
    req.reviewerName = 'Admin Hệ thống';
    req.reviewedAt = new Date().toISOString();
    req.reviewComment = body.reviewComment ?? '';
    return HttpResponse.json(req);
  }),

  // ADMIN REQUESTS — reject
  http.patch('/api/admin/requests/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reviewComment?: string };
    const req = adminRequests.find(r => r.id === params.id);
    if (!req) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    req.status = 'rejected';
    req.reviewerName = 'Admin Hệ thống';
    req.reviewedAt = new Date().toISOString();
    req.reviewComment = body.reviewComment ?? '';
    return HttpResponse.json(req);
  }),

  // MANAGER — employees list
  http.get('/api/manager/employees', () => {
    return HttpResponse.json({ employees: MOCK_EMPLOYEES });
  }),

  // MANAGER — shifts for week
  http.get('/api/manager/shifts', ({ request }) => {
    const url = new URL(request.url);
    const weekStart = url.searchParams.get('weekStart');
    if (!weekStart) return HttpResponse.json({ shifts: MOCK_MANAGER_SHIFTS });
    const end = new Date(weekStart + 'T00:00:00');
    end.setDate(end.getDate() + 7);
    const endStr = end.toISOString().split('T')[0];
    const filtered = MOCK_MANAGER_SHIFTS.filter(s => s.date >= weekStart && s.date < endStr);
    return HttpResponse.json({ shifts: filtered });
  }),

  // SHIFTS — detail
  http.get('/api/shifts/:id', async ({ params }) => {

    const shift = shifts.find(s => s.shiftId === params.id);
    if (shift) return HttpResponse.json(shift);
    // fallback for weekly seed shifts
    const dateMatch = String(params.id).match(/(\d{4}-\d{2}-\d{2})/);
    const shiftDate = dateMatch ? dateMatch[1] : TODAY;
    return HttpResponse.json({
      shiftId: params.id,
      date: shiftDate,
      start: new Date(`${shiftDate}T08:00:00`).getTime(),
      end: new Date(`${shiftDate}T16:00:00`).getTime(),
      locationName: 'Vincom Center · Q1',
      roleName: 'Barista',
      clockIn: null,
      clockOut: null,
      validationMode: 'none',
      geofence: null,
      address: '70 Lê Thánh Tôn, Q1',
      breakWindow: '12:00 – 13:00',
      expectedPayVnd: 432000,
      managerName: 'Nguyễn Thị Lan',
      managerRole: 'Quản lý ca',
    });
  }),
];
