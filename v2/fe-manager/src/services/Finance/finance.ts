import type { PayType } from '../Staff/staff';

export interface FinPeriod {
  id: string;
  start: string;    // YYYY-MM-DD
  end: string;
  label: string;
  status: 'open' | 'pending' | 'locked';
  lockDate: string;
}

export interface FinHistory {
  period: string;
  start: string;
  end: string;
  total: number;
  staff: number;
  locked: string;
  lockedBy: string;
  exported: boolean;
}

export interface FinLoc {
  locationId: string;
  name: string;
  short: string;
  area: string;
  color: string;
}

export interface PayrollItem {
  name: string;
  color: string;
  type: PayType;
  rate?: number;
  regH?: number;
  otH?: number;
  monthly?: number;
}

export interface PayrollRawEntry {
  larkUserId: string;
  name: string;
  locationId: string;
  isManager: boolean;
  items: PayrollItem[];
  status: 'reviewed' | 'pending';
}

export interface PayrollEntry extends PayrollRawEntry {
  totalReg: number;
  totalOT: number;
  totalMonthly: number;
  totalHours: number;
  otHours: number;
  total: number;
}

export interface FinSummary {
  total: number;
  monthly: number;
  hourly: number;
  ot: number;
  staff: number;
  reviewed: number;
  pending: number;
  otCount: number;
}

export interface FinByLoc extends FinLoc {
  staff: PayrollEntry[];
  count: number;
  total: number;
  monthly: number;
  hourly: number;
  ot: number;
  reviewed: number;
}
