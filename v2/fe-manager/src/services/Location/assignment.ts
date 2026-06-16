export interface Assignment {
  larkUserId: string;
  locationId: string;
  locationName: string;
  status: 'Active' | 'Inactive';
  role_config: Record<string, string>;  // roleId → roleName
}

export interface CreateAssignmentDTO {
  larkUserId: string;
  locationId: string;
  role_config: Record<string, string>;
  status: 'Active' | 'Inactive';
  locationNameSnapshot: string;
}
