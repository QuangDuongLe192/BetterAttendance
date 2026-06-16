export const vndFormatter = new Intl.NumberFormat('vi-VN');

export function formatVnd(amount: number): string {
  return vndFormatter.format(amount);
}

/** Return Monday of the ISO week containing `date` as YYYY-MM-DD string. */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return toIsoDate(d);
}

export function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Day-of-week short label for a YYYY-MM-DD string. */
export function getDayLabel(isoDate: string, lang: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const dow = date.getDay();
  const VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return lang === 'vi' ? VI[dow] : EN[dow];
}

/** Format YYYY-MM-DD → DD/MM for display. */
export function formatDayDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/**
 * Compute pay period start date given today and a configured start-of-month day.
 * If today >= startDay: periodStart = this month's startDay.
 * If today < startDay: periodStart = last month's startDay.
 */
export function getPeriodStart(today: Date, startDay: number): string {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  if (day >= startDay) {
    return `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
  }
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
}

/** Sum earnings across multiple role-segments. */
export function sumEarnings(segments: { hoursWorked: number; rateVnd: number }[]): number {
  return segments.reduce((acc, s) => acc + Math.round(s.hoursWorked * s.rateVnd), 0);
}

export function formatHoursDecimal(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}h${m}`;
}

/** Return ISO string YYYY-MM-01 for first day of given month. */
export function firstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

/**
 * Build a Mon-first calendar grid for a given month.
 * Returns an array of (day number | null) where null = padding cell.
 */
export function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/** Full day-of-week label for a Date or ISO string, locale-aware. */
export function formatDayName(date: Date | string, lang: string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const dow = d.getDay();
  const VI = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return lang === 'vi' ? VI[dow] : EN[dow];
}

/** Format a timestamp string as human-readable relative time. */
export function formatRelativeTime(timestamp: string | number, lang: string): string {
  const diff = Date.now() - (typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === 'vi') {
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return days === 1 ? 'Hôm qua' : `${days} ngày trước`;
  }
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

/** CSS color token for a request/shift status value. */
export function getRequestStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending:  'var(--c-warning)',
    approved: 'var(--c-success)',
    rejected: 'var(--c-danger)',
    overtime: 'var(--c-teal)',
    all:      'var(--c-teal)',
  };
  return map[status] ?? 'var(--c-gray)';
}
