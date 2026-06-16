export interface ShiftTemplate {
  id: string;
  label: string;
  defaultStartTime: string;  // HH:mm
  defaultEndTime: string;
  color: string;
}

export interface MetadataResponse {
  tags: string[];
  shifts: ShiftTemplate[];
}

export interface SetupStats {
  locations: { total: number; active: number; setup: number };
  roles: { total: number; minRate: number; maxRate: number };
  staff: { total: number; managers: number };
  setupCompletion: { done: number; total: number };
}

export type ProgressKey = 'roles' | 'locations' | 'shift_templates' | 'delegated_perms';

export interface ProgressItem {
  key: ProgressKey;
  done: boolean;
  data: Record<string, unknown>;
}

export interface TodaySummary {
  date: number;  // UTC ms, midnight VN time
  scheduledShifts: number;
  clockedIn: number;
  late: number;
  absent: number;
}
