export interface RoleTemplate {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  permissions: Record<string, boolean>;
  snapshotUserCount: number;
}

export interface CreateRoleDTO {
  name: string;
  status: 'Active' | 'Inactive';
  permissions: Record<string, boolean>;
}

export interface UpdateRoleDTO {
  roleId: string;
  name?: string;
  status?: 'Active' | 'Inactive';
  permissions?: Record<string, boolean>;
}

export interface RolesSummary {
  hourly: { roleCount: number; staffCount: number };
  monthly: { roleCount: number; staffCount: number };
}
