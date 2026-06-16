// API layer — today returns mock data; replace internals with fetch() when backend is ready.
// Components should import exclusively from this file, never from mock/ or types/ directly.

export type { MgrMe, StoreToday, DayStatus, MonthStaff, Announcement } from './Manager/mgr';
export type { Ms, ShiftEntity, StaffSchedule } from './Job/job';
export { minutesFromVN, hhmmFromVN } from './Job/job';
export type { Approval, ApprovalKind, ApprovalSuggest } from './Approval/approval';
export type { LogEntry, ActivityEntry } from './AuditLog/activity';

export { TODAY_ROSTER, WEEK_ROSTER, MONTHLY, fmtHHMM, calcStoreToday, calcStoreMonth, NOW, NOW_TS } from '../mock/shift';
export { MGR_ME, STORE_TODAY, fmtAge } from '../mock/summary';
export { APPROVALS, approvalIcon, approvalLabel } from '../mock/approval';
export { MGR_ACTIVITY, AUDIT_LOG, ANNOUNCEMENTS } from '../mock/activity';
