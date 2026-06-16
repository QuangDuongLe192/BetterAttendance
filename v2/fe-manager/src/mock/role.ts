import type { RoleTemplate, RolesSummary } from '../services/Metadata/role';
import type { ShiftTemplate } from '../services/Metadata/metadata';

export const ROLES: RoleTemplate[] = [
  { id: 'R1', name: 'Phục vụ', status: 'Active', permissions: {}, snapshotUserCount: 28 },
  { id: 'R2', name: 'Thu ngân', status: 'Active', permissions: {}, snapshotUserCount: 14 },
  { id: 'R3', name: 'Pha chế', status: 'Active', permissions: {}, snapshotUserCount: 16 },
  { id: 'R4', name: 'Trưởng ca', status: 'Active', permissions: {}, snapshotUserCount: 7 },
  { id: 'R5', name: 'Bếp', status: 'Active', permissions: {}, snapshotUserCount: 9 },
  { id: 'R6', name: 'Bảo vệ', status: 'Active', permissions: {}, snapshotUserCount: 4 },
];

export const ROLES_SUMMARY: RolesSummary = {
  hourly: { roleCount: 4, staffCount: 58 },
  monthly: { roleCount: 2, staffCount: 11 },
};

export const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 's1', label: 'Ca sáng', defaultStartTime: '06:00', defaultEndTime: '14:00', color: '#F59E0B' },
  { id: 's2', label: 'Ca chiều', defaultStartTime: '14:00', defaultEndTime: '22:00', color: '#3B82F6' },
  { id: 's3', label: 'Ca tối', defaultStartTime: '22:00', defaultEndTime: '06:00', color: '#7C3AED' },
  { id: 's4', label: 'Ca ngày', defaultStartTime: '08:00', defaultEndTime: '17:00', color: '#10B981' },
];

export const roleById = (id: string): RoleTemplate => ROLES.find(r => r.id === id)!;
export const roleColor = (_role: RoleTemplate): string => '#00B4A0';
