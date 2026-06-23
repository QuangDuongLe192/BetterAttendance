import type { StaffEntity, StaffSummary, ManagerRef, StaffRoleScope } from '../services/Staff/staff';

export const STAFF: StaffEntity[] = [
  { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', avatar: '', phone: '090 442 1188', locationIds: ['L1', 'L2'], managedLocs: [], payType: 'hourly', rate: 32000, roleIds: ['R1', 'R2'],floater: true  },
  { larkUserId: 'lark_user_002', name: 'Trần Thị Bích', avatar: '', phone: '093 117 8820', locationIds: ['L1'], managedLocs: [], payType: 'hourly', rate: 40000, roleIds: ['R3'], floater: true  },
  { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', avatar: '', phone: '098 226 4471', locationIds: ['L1', 'L3', 'L4'], managedLocs: ['L1', 'L3', 'L4'], payType: 'monthly', monthly: 14000000, roleIds: ['R4'] },
  { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', avatar: '', phone: '097 553 1129', locationIds: ['L2'], managedLocs: ['L2'], payType: 'monthly', monthly: 12500000, roleIds: ['R4'] },
  { larkUserId: 'lark_user_005', name: 'Đỗ Minh Tâm', avatar: '', phone: '096 884 7012', locationIds: [], managedLocs: [], payType: 'hourly', rate: 42000, roleIds: ['R5'] },
  { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', avatar: '', phone: '091 339 5621', locationIds: ['L1', 'L4'], managedLocs: [], payType: 'hourly', rate: 32000, roleIds: ['R1'] },
  { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', avatar: '', phone: '093 117 6604', locationIds: ['L3'], managedLocs: ['L3'], payType: 'monthly', monthly: 13200000, roleIds: ['R4'] },
  { larkUserId: 'lark_user_008', name: 'Hoàng Việt Hùng', avatar: '', phone: '098 002 7717', locationIds: ['L1', 'L2', 'L3'], managedLocs: [], payType: 'monthly', monthly: 7800000, roleIds: ['R6'] },
  { larkUserId: 'lark_user_009', name: 'Nguyễn Thị Thu Hà', avatar: '', phone: '094 882 0019', locationIds: ['L5'], managedLocs: ['L5'], payType: 'monthly', monthly: 13500000, roleIds: ['R4'] },
  { larkUserId: 'lark_user_010', name: 'Bùi Anh Tuấn', avatar: '', phone: '092 110 4488', locationIds: ['L2'], managedLocs: [], payType: 'hourly', rate: 40000, roleIds: ['R3', 'R1'] },
  { larkUserId: 'lark_user_011', name: 'Phan Thanh Hằng', avatar: '', phone: '090 661 2233', locationIds: ['L5'], managedLocs: [], payType: 'hourly', rate: 32000, roleIds: ['R1'] },
  { larkUserId: 'lark_user_012', name: 'Đặng Khánh Linh', avatar: '', phone: '093 552 7711', locationIds: ['L3'], managedLocs: [], payType: 'hourly', rate: 35000, roleIds: ['R2', 'R1'] },
];

export const STAFF_SUMMARY: StaffSummary = {
  total: 78, managers: 5, multiRole: 4, rolesCount: 6,
};

export const STAFF_MANAGERS: ManagerRef[] = [
  { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung' },
  { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh' },
  { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh' },
  { larkUserId: 'lark_user_009', name: 'Nguyễn Thị Thu Hà' },
];


export const staffById = (larkUserId: string): StaffEntity =>
  STAFF.find(s => s.larkUserId === larkUserId)!;

export const resolveRate = (staff: StaffEntity) => {
  if (staff.payType === 'monthly') return { kind: 'monthly' as const, amount: staff.monthly ?? 0 };
  return { kind: 'hourly' as const, amount: staff.rate ?? 0 };
};

export const STAFF_ROLE_SCOPES: StaffRoleScope[] = [
  { larkUserId: 'lark_user_008', orgRoles: ['ADMIN'], managedLocationIds: [] },
  { larkUserId: 'lark_user_003', orgRoles: [], managedLocationIds: ['L1', 'L3', 'L4'] },
  { larkUserId: 'lark_user_004', orgRoles: ['FINANCE'], managedLocationIds: ['L2'] },
  { larkUserId: 'lark_user_006', orgRoles: ['FINANCE'], managedLocationIds: [] },
  { larkUserId: 'lark_user_007', orgRoles: [], managedLocationIds: ['L3'] },
  { larkUserId: 'lark_user_009', orgRoles: [], managedLocationIds: ['L5'] },
];

export const rolesOf = (larkUserId: string): string[] => {
  const s = STAFF_ROLE_SCOPES.find(x => x.larkUserId === larkUserId);
  if (!s) return [];
  return [...s.orgRoles, ...(s.managedLocationIds.length > 0 ? ['MANAGER'] : [])];
};

export const hasRole = (larkUserId: string, role: string): boolean =>
  rolesOf(larkUserId).includes(role);

export { fmtVND } from '../lib/fmt';
