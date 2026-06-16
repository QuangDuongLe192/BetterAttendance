/** UTC milliseconds since epoch */
export type Ms = number;

export interface ShiftEntity {
  jobId: string;
  larkUserId: string;
  locationId: string;
  locationName: string;
  roleId: string;
  scheduleInTime: Ms;
  scheduleOutTime: Ms;
  scheduleTotal: Ms;
  actualInTime: Ms | null;
  actualOutTime: Ms | null;
  shiftLabel: string;
  tag: string;
  status: 'in' | 'late' | 'absent' | 'upcoming' | 'overtime' | 'completed';
  lateBy?: number;  // minutes
}

export interface StaffSchedule {
  larkUserId: string;
  staffName: string;
  userAvatar: string;
  shifts: Record<string, ShiftEntity[]>;  // YYYY-MM-DD → shifts
}

// VN timezone helpers for components
export const VN_OFFSET_MS = 7 * 3600 * 1000;

export function minutesFromVN(utcMs: Ms): number {
  const totalMins = Math.floor((utcMs + VN_OFFSET_MS) / 60000);
  return totalMins % (24 * 60);
}

export function hhmmFromVN(utcMs: Ms): string {
  const mins = minutesFromVN(utcMs);
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}
