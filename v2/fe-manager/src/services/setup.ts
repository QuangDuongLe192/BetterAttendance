// API layer — today returns mock data; replace internals with fetch() when backend is ready.
// Components should import exclusively from this file, never from mock/ or types/ directly.

export type { Response, PaginatedResponse } from './common';
export type { LocationEntity, ValidationConfig, ValidationMode, LocationDelegation, WifiScan, WifiScanResult } from './Location/location';
export type { LocationEntity as Location, WifiScanResult as WifiNetwork } from './Location/location';
export type { StaffEntity, StaffSummary, ManagerRef, SystemRole, PayType, StaffRoleScope } from './Staff/staff';
export type { StaffEntity as Staff } from './Staff/staff';
export type { RoleTemplate, CreateRoleDTO, UpdateRoleDTO, RolesSummary } from './Metadata/role';
export type { RoleTemplate as Role } from './Metadata/role';
export type { Assignment, CreateAssignmentDTO } from './Location/assignment';
export type { ShiftTemplate, MetadataResponse, SetupStats, ProgressKey, ProgressItem, TodaySummary } from './Metadata/metadata';
export type { LogEntry, AuditEntry } from './AuditLog/activity';

export { LOCATIONS, WIFI_SCAN, locById } from '../mock/location';
export { STAFF, STAFF_SUMMARY, STAFF_MANAGERS, STAFF_ROLE_SCOPES, staffById, resolveRate, fmtVND, rolesOf, hasRole } from '../mock/staff';
export { ROLES, ROLES_SUMMARY, SHIFT_TEMPLATES, roleById, roleColor } from '../mock/role';
export { SETUP_STATS, SETUP_PROGRESS, TODAY_SUMMARY } from '../mock/summary';
export { AUDIT } from '../mock/activity';
