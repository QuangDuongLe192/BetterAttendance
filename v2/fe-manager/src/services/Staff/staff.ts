export type SystemRole = 'ADMIN' | 'MANAGER' | 'FINANCE';
export type PayType = 'hourly' | 'monthly';

export interface StaffEntity {
  larkUserId: string;
  name: string;
  avatar: string;
  phone: string;
  payType: PayType;
  rate?: number;      // if hourly
  monthly?: number;   // if monthly
  locationIds: string[];
  floater?: boolean;
  managedLocs: string[];
  roleIds: string[];
}

export interface StaffSummary {
  total: number;
  managers: number;
  multiRole: number;
  rolesCount: number;
}

export interface ManagerRef {
  larkUserId: string;
  name: string;
}

export interface StaffRoleScope {
  larkUserId: string;
  orgRoles: string[];           // org-wide: 'ADMIN', 'FINANCE'
  managedLocationIds: string[]; // locations where user is MANAGER
}

