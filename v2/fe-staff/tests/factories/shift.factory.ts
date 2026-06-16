import type { ShiftItemDto } from '../../src/features/attendance/types';

export function createShift(overrides?: Partial<ShiftItemDto>): ShiftItemDto {
  const now = Date.now();
  return {
    shiftId: `shift_${now}`,
    date: new Date().toISOString().split('T')[0],
    start: now,
    end: now + 8 * 3600000,
    locationName: 'Vincom Center · Q1',
    roleName: 'Barista',
    clockIn: null,
    clockOut: null,
    validationMode: 'none',
    geofence: null,
    ...overrides,
  };
}
