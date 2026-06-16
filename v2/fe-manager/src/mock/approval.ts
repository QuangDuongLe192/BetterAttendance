import type { Approval } from '../services/Approval/approval';

export const APPROVALS: Approval[] = [
  { id: 'A1', kind: 'late', larkUserId: 'lark_user_010', staffName: 'Bùi Anh Tuấn', locationId: 'L1', locationName: 'Bến Thành', date: '2026-05-12', body: 'Vào trễ 23 phút · báo kẹt xe', original: 1747011600000, proposed: 1747012980000, createdAt: 1747282800000, auto: true, suggest: 'approve' },
  { id: 'A2', kind: 'edit', larkUserId: 'lark_user_012', staffName: 'Đặng Khánh Linh', locationId: 'L1', locationName: 'Bến Thành', date: '2026-05-11', body: 'Quên chấm ra · ghi 22:04', original: null, proposed: 1746975840000, createdAt: 1747233120000, auto: false, suggest: 'review' },
  { id: 'A3', kind: 'timeoff', larkUserId: 'lark_user_002', staffName: 'Trần Thị Bích', locationId: 'L1', locationName: 'Bến Thành', date: '2026-05-15', body: 'Xin nghỉ phép 1 ngày · việc gia đình', original: 1747265400000, proposed: null, createdAt: 1747276320000, auto: false, suggest: 'review' },
  { id: 'A4', kind: 'swap', larkUserId: 'lark_user_006', staffName: 'Vũ Hải Yến', locationId: 'L4', locationName: 'Hai Bà Trưng', date: '2026-05-13', body: 'Đổi ca với Phan Thanh Hằng (NV-011)', original: 1747094400000, proposed: null, createdAt: 1747269120000, auto: false, suggest: 'review' },
  { id: 'A5', kind: 'late', larkUserId: 'lark_user_007', staffName: 'Trần Mỹ Linh', locationId: 'L4', locationName: 'Hai Bà Trưng', date: '2026-05-12', body: 'Vào trễ 18 phút · lý do chưa rõ', original: 1747015200000, proposed: 1747016280000, createdAt: 1747283220000, auto: false, suggest: 'review' },
  { id: 'A6', kind: 'edit', larkUserId: 'lark_user_001', staffName: 'Nguyễn Văn An', locationId: 'L1', locationName: 'Bến Thành', date: '2026-05-10', body: 'Sửa giờ ra · 14:02 → 14:32', original: 1746860520000, proposed: 1746862320000, createdAt: 1747110720000, auto: false, suggest: 'review' },
];

export function approvalIcon(kind: Approval['kind']): string {
  return ({ late: 'clock', edit: 'edit', timeoff: 'calendar', swap: 'refresh' }[kind] ?? 'edit');
}

export function approvalLabel(kind: Approval['kind']): string {
  return ({ late: 'Vào trễ', edit: 'Sửa giờ', timeoff: 'Nghỉ phép', swap: 'Đổi ca' }[kind] ?? kind);
}
