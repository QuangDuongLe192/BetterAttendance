import { describe, it, expect } from 'vitest';
import {
  formatVnd,
  getWeekStart,
  getDayLabel,
  formatDayDate,
  getPeriodStart,
  sumEarnings,
  formatMinutes,
} from './date';

// EPIC-001-UT-02: VND formatter
describe('formatVnd', () => {
  it('formats integer with vi-VN dot separator', () => {
    expect(formatVnd(4600000)).toBe('4.600.000');
  });
  it('formats zero', () => {
    expect(formatVnd(0)).toBe('0');
  });
  it('formats large number', () => {
    expect(formatVnd(999999999)).toBe('999.999.999');
  });
});

// EPIC-001-UT-04: weekStart calculation
describe('getWeekStart', () => {
  it('Wednesday → previous Monday', () => {
    expect(getWeekStart(new Date('2026-05-27'))).toBe('2026-05-25');
  });
  it('Monday → same Monday', () => {
    expect(getWeekStart(new Date('2026-05-25'))).toBe('2026-05-25');
  });
  it('Sunday → previous Monday', () => {
    expect(getWeekStart(new Date('2026-05-31'))).toBe('2026-05-25');
  });
  it('new year boundary', () => {
    expect(getWeekStart(new Date('2026-01-02'))).toBe('2025-12-29');
  });
});

// EPIC-001-UT-07: getDayLabel
describe('getDayLabel', () => {
  it('Monday in vi', () => {
    expect(getDayLabel('2026-05-25', 'vi')).toBe('T2');
  });
  it('Sunday in vi', () => {
    expect(getDayLabel('2026-05-31', 'vi')).toBe('CN');
  });
  it('Monday in en', () => {
    expect(getDayLabel('2026-05-25', 'en')).toBe('Mon');
  });
  it('Sunday in en', () => {
    expect(getDayLabel('2026-05-31', 'en')).toBe('Sun');
  });
});

// EPIC-001-UT-08: formatDayDate
describe('formatDayDate', () => {
  it('formats YYYY-MM-DD to DD/MM', () => {
    expect(formatDayDate('2026-05-25')).toBe('25/05');
  });
  it('pads single-digit day and month', () => {
    expect(formatDayDate('2026-01-01')).toBe('01/01');
  });
});

// EPIC-001-UT-01: pay period calculation
describe('getPeriodStart', () => {
  it('today >= start day → this month', () => {
    expect(getPeriodStart(new Date('2026-05-20'), 15)).toBe('2026-05-15');
  });
  it('today < start day → previous month', () => {
    expect(getPeriodStart(new Date('2026-05-10'), 15)).toBe('2026-04-15');
  });
  it('today = start day → this month', () => {
    expect(getPeriodStart(new Date('2026-05-15'), 15)).toBe('2026-05-15');
  });
  it('January boundary → December previous year', () => {
    expect(getPeriodStart(new Date('2026-01-05'), 15)).toBe('2025-12-15');
  });
});

// EPIC-001-UT-03: multi-role earnings sum
describe('sumEarnings', () => {
  it('single role', () => {
    expect(sumEarnings([{ hoursWorked: 8, rateVnd: 55000 }])).toBe(440000);
  });
  it('two roles', () => {
    expect(sumEarnings([
      { hoursWorked: 4, rateVnd: 55000 },
      { hoursWorked: 6, rateVnd: 60000 },
    ])).toBe(580000);
  });
  it('zero hours', () => {
    expect(sumEarnings([{ hoursWorked: 0, rateVnd: 55000 }])).toBe(0);
  });
  it('fractional hours rounded', () => {
    expect(sumEarnings([{ hoursWorked: 1.5, rateVnd: 60000 }])).toBe(90000);
  });
  it('empty array', () => {
    expect(sumEarnings([])).toBe(0);
  });
});

describe('formatMinutes', () => {
  it('480 minutes → 8h00', () => {
    expect(formatMinutes(480)).toBe('8h00');
  });
  it('90 minutes → 1h30', () => {
    expect(formatMinutes(90)).toBe('1h30');
  });
  it('0 minutes → 0h00', () => {
    expect(formatMinutes(0)).toBe('0h00');
  });
});
