import type { ValidationMode } from '../../../store/validationStore';

export type { ValidationMode };

export interface ShiftItemDto {
  shiftId: string;
  date: string;
  start: number;
  end: number;
  locationName: string;
  roleName: string;
  clockIn: number | null;
  clockOut: number | null;
  validationMode: ValidationMode;
  geofence: { lat: number; lng: number; radiusMeters: number } | null;
  address?: string;
  breakWindow?: string;
  expectedPayVnd?: number;
  managerName?: string;
  managerRole?: string;
}

export type ClockStatus = 'idle' | 'clocked-in' | 'clocked-out';

export interface WeeklyDayShift {
  shiftId: string;
  date: string;
  start: number;
  end: number;
  locationName: string;
  roleName: string;
  status: 'scheduled' | 'in' | 'completed' | 'absent' | 'cancelled';
  clockIn: number | null;
  clockOut: number | null;
}

export interface WeeklyDay {
  date: string;
  shifts: WeeklyDayShift[];
}

export interface TodayShiftsResponse {
  shifts: ShiftItemDto[];
}

export interface WeeklyShiftsResponse {
  days: WeeklyDay[];
}

export interface EarningsSegment {
  roleName: string;
  hours: number;
  rateVnd: number;
  earningsVnd: number;
}

export interface EarningsShift {
  shiftId: string;
  date: string;
  start: number;
  end: number;
  locationName: string;
  roleName: string;
  rateVnd: number;
  hoursWorked: number;
  earningsVnd: number;
}

export interface EarningsResponse {
  grossEarningsVnd: number;
  month: string;
  periodLabel?: string;
  periodStart: number;
  periodEnd: number;
  hours: string;
  shifts: number;
  payday: number;
  segments?: EarningsSegment[];
  shiftBreakdown?: EarningsShift[];
}

export interface ClockInRequest {
  shiftId: string;
  idempotencyKey: string;
}

export interface ClockInResponse {
  shiftId: string;
  clockInTime: number;
}

export interface ClockOutRequest {
  shiftId: string;
  idempotencyKey: string;
}

export interface ClockOutResponse {
  totalMinutes: number;
  clockOutTime: number;
  earnedVnd: number;
}
