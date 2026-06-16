export type ApprovalKind = 'late' | 'edit' | 'timeoff' | 'swap';
export type ApprovalSuggest = 'approve' | 'review';

export interface Approval {
  id: string;
  kind: ApprovalKind;
  larkUserId: string;
  staffName: string;
  locationId: string;
  locationName: string;
  date: string;               // YYYY-MM-DD
  body: string;
  original: number | null;    // UTC ms
  proposed: number | null;    // UTC ms
  createdAt: number;          // UTC ms
  auto: boolean;
  suggest: ApprovalSuggest;
}
