export type ShiftAttendanceStatus =
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'late'
  | 'early_leave'
  | 'absent';

export interface ShiftStatusInput {
  start: number;     // Unix ms
  end: number;       // Unix ms
  clockIn: number | null;
  clockOut: number | null;
  now?: Date;
}

export function deriveShiftStatus(input: ShiftStatusInput): ShiftAttendanceStatus[] {
  const { start, end, clockIn, clockOut } = input;
  const now = input.now ?? new Date();

  if (!clockIn) {
    if (now.getTime() > end) return ['absent'];
    return ['scheduled'];
  }

  if (!clockOut) {
    return ['active'];
  }

  const statuses: ShiftAttendanceStatus[] = ['completed'];

  if (clockIn > start) statuses.push('late');
  if (clockOut < end) statuses.push('early_leave');

  return statuses;
}

export function formatShiftTime(ms: number, locale: string): string {
  return new Date(ms).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    
  });
}

export function formatClockTime(ms: number, locale: string): string {
  return new Date(ms).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
