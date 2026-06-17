import { describe, it, expect } from 'vitest';
import { buildDailyScript } from './buildDailyScript';
import type { ShiftItemDto } from '../types';

function shift(overrides: Partial<ShiftItemDto> = {}): ShiftItemDto {
  const now = Date.now();
  return {
    shiftId: 's1',
    start: now + 10 * 60000,
    end: now + 4 * 3600000,
    clockIn: null,
    clockOut: null,
    locationName: 'Cửa hàng A',
    roleName: 'Pha chế',
    validationMode: 'none',
    geofence: null,
    ...overrides,
  } as ShiftItemDto;
}

describe('buildDailyScript', () => {
  it('returns "starting soon" text when shift starts within 20 min (vi)', () => {
    const result = buildDailyScript([shift({ start: Date.now() + 10 * 60000 })], 1, 'vi');
    expect(result).toContain('sắp bắt đầu');
  });

  it('returns "starting soon" text in English', () => {
    const result = buildDailyScript([shift({ start: Date.now() + 10 * 60000 })], 1, 'en');
    expect(result).toContain('starting soon');
  });

  it('returns active shift text when clocked in', () => {
    const now = Date.now();
    const s = shift({ start: now - 3600000, end: now + 3600000, clockIn: now - 3600000 });
    expect(buildDailyScript([s], 2, 'vi')).toContain('Đang trong ca');
  });

  it('returns "shift ended" text when still clocked in but past end', () => {
    const now = Date.now();
    const s = shift({ start: now - 2 * 3600000, end: now - 300000, clockIn: now - 2 * 3600000 });
    expect(buildDailyScript([s], 2, 'vi')).toContain('chấm công ra');
  });

  it('returns done count when all shifts completed', () => {
    const now = Date.now();
    const s = shift({ start: now - 8 * 3600000, end: now - 4 * 3600000, clockIn: now - 8 * 3600000, clockOut: now - 4 * 3600000 });
    expect(buildDailyScript([s], 2, 'vi')).toContain('1 ca hôm nay đã xong');
  });

  it('returns weekend message when no shifts on dow 0', () => {
    expect(buildDailyScript([], 0, 'vi')).toContain('ngày nghỉ');
  });

  it('returns no shift message on a weekday', () => {
    expect(buildDailyScript([], 3, 'vi')).toContain('không có ca');
  });
});
