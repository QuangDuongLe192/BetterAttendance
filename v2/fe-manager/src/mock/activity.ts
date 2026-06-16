import type { LogEntry } from '../services/AuditLog/activity';
import type { Announcement } from '../services/Manager/mgr';

// From mock/setup.ts (setup audit log)
const A_ADMIN: { larkUserId: string; name: string; role: string } = { larkUserId: 'lark_admin_001', name: 'Trần Khôi Nguyên', role: 'Admin' };
const A_MGR_L1: { larkUserId: string; name: string; role: string } = { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' };
const A_MGR_L2: { larkUserId: string; name: string; role: string } = { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', role: 'Manager' };
const A_MGR_L3: { larkUserId: string; name: string; role: string } = { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', role: 'Manager' };

export const AUDIT: LogEntry[] = [
  // 2026-06-03 — hôm nay
  { t: 1780563600000, actor: A_ADMIN,   event: 'delegation.update', target: 'L1 — Bến Thành', before: 'canApproveOT: false', after: 'canApproveOT: true', type: 'loc' },
  { t: 1780558200000, actor: A_MGR_L1,  event: 'role.assign',       target: 'lark_user_005 Đỗ Minh Tâm', before: 'Bếp', after: 'Bếp, Pha chế', type: 'role' },
  { t: 1780545600000, actor: A_ADMIN,   event: 'rate.update',       target: 'Thu ngân', before: '35.000 ₫/giờ', after: '37.000 ₫/giờ', type: 'rate' },
  { t: 1780542000000, actor: A_MGR_L2,  event: 'attendance.edit',   target: 'lark_user_001 — 03/06', before: 'Vào 07:12', after: 'Vào 07:00', type: 'att' },
  { t: 1780534800000, actor: A_ADMIN,   event: 'location.update',   target: 'L4 — Hai Bà Trưng', before: 'radius=50m', after: 'radius=60m', type: 'geo' },
  // 2026-05-05 → 2026-05-08
  { t: 1746689520000, actor: A_ADMIN, event: 'config.wifi', target: 'L1 — Bến Thành', before: 'BSSID 04:F0:21:A1:88:2A', after: 'BSSID 04:F0:21:A1:88:2C', type: 'wifi' },
  { t: 1746677880000, actor: A_MGR_L1, event: 'role.assign', target: 'lark_user_006 Vũ Hải Yến', before: 'Phục vụ', after: 'Phục vụ, Thu ngân', type: 'role' },
  { t: 1746614640000, actor: A_ADMIN, event: 'rate.update', target: 'Pha chế', before: '38.000 ₫/giờ', after: '40.000 ₫/giờ', type: 'rate' },
  { t: 1746583320000, actor: A_MGR_L2, event: 'attendance.edit', target: 'lark_user_010 — 06/05', before: 'Vào 09:14', after: 'Vào 09:02', type: 'att' },
  { t: 1746525060000, actor: A_ADMIN, event: 'location.create', target: 'L5 — Cầu Giấy', before: null, after: 'Khởi tạo', type: 'loc' },
  { t: 1746500940000, actor: A_ADMIN, event: 'geofence.update', target: 'L3 — Phú Mỹ Hưng', before: 'r=80m', after: 'r=100m', type: 'geo' },
  { t: 1746429660000, actor: A_MGR_L3, event: 'role.assign', target: 'lark_user_012 Đặng Khánh Linh', before: 'Phục vụ', after: 'Phục vụ, Thu ngân', type: 'role' },
  { t: 1746408780000, actor: A_ADMIN, event: 'mode.update', target: 'L4 — Hai Bà Trưng', before: 'Wi-Fi + Vị trí', after: 'Chỉ Vị trí', type: 'wifi' },
];

export const MGR_ACTIVITY: LogEntry[] = [
  { t: 1747283280000, actor: { larkUserId: 'lark_user_010', name: 'Bùi Anh Tuấn', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · 08:23 · Bến Thành', type: 'att', locationId: 'L1' },
  { t: 1747282440000, actor: { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', role: 'Nhân viên' }, event: 'request.swap', target: 'Yêu cầu đổi ca 13/05 · Hai Bà Trưng', type: 'request', locationId: 'L4' },
  { t: 1747280820000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'approval.approve', target: 'Duyệt sửa giờ NV-001 (10/05) · Bến Thành', type: 'approval', locationId: 'L1' },
  { t: 1747278120000, actor: { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Hai Bà Trưng', type: 'att', locationId: 'L4' },
  { t: 1747275480000, actor: { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · trễ 18 phút · Hai Bà Trưng', type: 'att', locationId: 'L4' },
  { t: 1747274100000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
  { t: 1747268040000, actor: { larkUserId: 'lark_user_012', name: 'Đặng Khánh Linh', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · trễ 14 phút · Bến Thành', type: 'att', locationId: 'L1' },
];

export const AUDIT_LOG: Record<string, LogEntry[]> = {
  '2026-05-15': MGR_ACTIVITY,
  '2026-05-14': [
    { t: 1747180200000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747180800000, actor: { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747184100000, actor: { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747186200000, actor: { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', role: 'Manager' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747197000000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'approval.approve', target: 'Duyệt sửa giờ NV-001 (13/05) · Bến Thành', type: 'approval', locationId: 'L1' },
    { t: 1747206000000, actor: { larkUserId: 'lark_user_002', name: 'Trần Thị Bích', role: 'Nhân viên' }, event: 'request.timeoff', target: 'Xin nghỉ phép 15/05 · Bến Thành', type: 'request', locationId: 'L1' },
    { t: 1747211400000, actor: { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', role: 'Nhân viên' }, event: 'att.clock_out', target: 'Chấm ra ca · 15:30 · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747220400000, actor: { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', role: 'Nhân viên' }, event: 'att.clock_out', target: 'Chấm ra ca · 18:00 · Bến Thành', type: 'att', locationId: 'L1' },
  ],
  '2026-05-13': [
    { t: 1747093800000, actor: { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747094400000, actor: { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747095300000, actor: { larkUserId: 'lark_user_012', name: 'Đặng Khánh Linh', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · trễ 15 phút · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747099800000, actor: { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', role: 'Nhân viên' }, event: 'request.swap', target: 'Yêu cầu đổi ca 15/05 · Hai Bà Trưng', type: 'request', locationId: 'L4' },
    { t: 1747108800000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'approval.reject', target: 'Từ chối đổi ca NV-006 (13/05) · Bến Thành', type: 'approval', locationId: 'L1' },
    { t: 1747119600000, actor: { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', role: 'Manager' }, event: 'approval.approve', target: 'Duyệt tăng ca NV-007 · Hai Bà Trưng', type: 'approval', locationId: 'L4' },
  ],
  '2026-05-12': [
    { t: 1747008000000, actor: { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', role: 'Manager' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747010100000, actor: { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747012980000, actor: { larkUserId: 'lark_user_010', name: 'Bùi Anh Tuấn', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · trễ 23 phút · Bến Thành', type: 'att', locationId: 'L1' },
    { t: 1747016280000, actor: { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', role: 'Nhân viên' }, event: 'att.late', target: 'Chấm vào ca · trễ 18 phút · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747018800000, actor: { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', role: 'Nhân viên' }, event: 'att.clock_in', target: 'Chấm vào ca · đúng giờ · Hai Bà Trưng', type: 'att', locationId: 'L4' },
    { t: 1747029600000, actor: { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', role: 'Manager' }, event: 'approval.approve', target: 'Duyệt vào trễ NV-007 · Hai Bà Trưng', type: 'approval', locationId: 'L4' },
    { t: 1747040400000, actor: { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', role: 'Nhân viên' }, event: 'request.edit', target: 'Xin sửa giờ ra ca 14:02→14:32 · Bến Thành', type: 'request', locationId: 'L1' },
  ],
};

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'AN1', sent: '11/05 18:32', scope: 'L1', title: 'Họp giao ca 7h sáng mai', body: 'Toàn bộ ca sáng có mặt lúc 06:45 để briefing menu mới.', read: 12, total: 14 },
  { id: 'AN2', sent: '10/05 09:14', scope: 'L1,L4', title: 'Đồng phục mùa hè đã có', body: 'Liên hệ trưởng ca để nhận áo mới size phù hợp.', read: 19, total: 22 },
  { id: 'AN3', sent: '08/05 16:00', scope: 'L4', title: 'Tăng ca dài ngày 30/04 — 01/05', body: 'Ai đăng ký tăng ca lễ vui lòng phản hồi tin nhắn.', read: 8, total: 8 },
];
