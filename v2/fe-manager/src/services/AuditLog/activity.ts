export interface LogEntry {
  t: number;  // UTC ms
  actor: { larkUserId: string; name: string; role: string };
  event: string;
  target: string;
  type: 'att' | 'request' | 'approval' | 'wifi' | 'role' | 'rate' | 'loc' | 'geo';
  locationId?: string;     // present for operational events (att/request/approval)
  before?: string | null;  // present for config changes (wifi/role/rate/loc/geo)
  after?: string | null;
}

// Backward-compat aliases — remove once all consumers use LogEntry directly
export type ActivityEntry = LogEntry;
export type AuditEntry = LogEntry;
