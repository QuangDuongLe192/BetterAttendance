import type { SetupStats, ProgressItem, TodaySummary } from '../services/Metadata/metadata';
import type { MgrMe, StoreToday } from '../services/Manager/mgr';
import { calcStoreToday, calcStoreMonth } from './shift';

export { NOW_TS } from './shift';
export { NOW } from './shift';

export const MGR_ME: MgrMe = {
  larkUserId: 'lark_admin_001', name: 'Trần Khôi Nguyên',
  avatar: '#1E2D3D',
  stores: ['L1', 'L2', 'L3', 'L4', 'L5'],
  phone: '',
};

const _storeBase: Record<string, Omit<StoreToday, 'laborCostToday' | 'laborBudgetToday' | 'laborCostMonth' | 'laborBudgetMonth'>> = {
  L1: { scheduled: 14, present: 11, late: 2, absent: 1, openShifts: 1, overtime: 1, pulse: 'on-track' },
  L4: { scheduled: 8, present: 5, late: 1, absent: 0, openShifts: 2, overtime: 1, pulse: 'warning' },
};

export const STORE_TODAY: Record<string, StoreToday> = Object.fromEntries(
  Object.entries(_storeBase).map(([id, base]) => [id, { ...base, ...calcStoreToday(id), ...calcStoreMonth(id) }])
);

export const SETUP_STATS: SetupStats = {
  locations: { total: 5, active: 4, setup: 1 },
  roles: { total: 6, minRate: 28000, maxRate: 55000 },
  staff: { total: 78, managers: 5 },
  setupCompletion: { done: 4, total: 6 },
};

export const SETUP_PROGRESS: ProgressItem[] = [
  { key: 'roles', done: true, data: { configured: 6, total: 6 } },
  { key: 'locations', done: true, data: { total: 5 } },
  { key: 'shift_templates', done: true, data: { total: 4 } },
  { key: 'delegated_perms', done: false, data: { configured: 3, total: 5 } },
];

export const TODAY_SUMMARY: TodaySummary = {
  date: 1747846800000, scheduledShifts: 42, clockedIn: 38, late: 3, absent: 1,
};

export const fmtAge = (createdAt: number): string => {
  const diff = Date.now() - createdAt;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  return `${mins} phút`;
};
