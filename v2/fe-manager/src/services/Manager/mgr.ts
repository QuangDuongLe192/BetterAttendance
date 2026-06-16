export interface MgrMe {
  larkUserId: string;
  name: string;
  avatar: string;
  stores: string[];           // locationIds
  phone: string;
}

export interface StoreToday {
  scheduled: number;
  present: number;
  late: number;
  absent: number;
  openShifts: number;
  overtime: number;
  laborCostToday: number;
  laborBudgetToday: number;
  laborCostMonth: number;
  laborBudgetMonth: number;
  pulse: 'on-track' | 'warning' | 'alert';
}

export interface RosterEntry {
  staff: string | null;       // larkUserId
  store: string;              // locationId
  role: string;               // roleId
  start: number;              // minutes from midnight
  end: number;
  status: 'in' | 'late' | 'absent' | 'upcoming' | 'overtime' | 'completed';
  clockIn?: string;           // HH:MM
  clockOut?: string;
  lateBy?: number;            // minutes
}

export type DayStatus = 'ok' | 'late' | 'absent' | 'off' | 'upcoming';

export interface MonthStaff {
  larkUserId: string;
  store: string;
  schedDays: number;
  workedDays: number;
  onTime: number;
  late: number;
  absent: number;
  otH: number;
  schedH: number;
  actualH: number;
  strip: DayStatus[][];
}

export interface Announcement {
  id: string;
  sent: string;
  scope: string;
  title: string;
  body: string;
  read: number;
  total: number;
}
