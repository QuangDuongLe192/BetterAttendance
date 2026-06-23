import type { FinPeriod, FinHistory, FinLoc, PayrollRawEntry, PayrollEntry, FinSummary, FinByLoc } from '../services/Finance/finance';

export { fmtVND } from '../lib/fmt';

export const fmtM = (n: number): string => {
  const m = n / 1_000_000;
  return m >= 10 ? `${Math.round(m)} tr` : `${m.toFixed(1)} tr`;
};

export const FIN_PERIOD: FinPeriod = {
  id: 'period_2026_05',
  start: '2026-05-01', end: '2026-05-31',
  label: 'Tháng 05/2026', status: 'pending', lockDate: '2026-06-05',
};

export const FIN_HISTORY: FinHistory[] = [
  { period: 'Tháng 04/2026', start: '01/04/2026', end: '30/04/2026', total: 98_400_000, staff: 12, locked: '05/05/2026 14:22', lockedBy: 'Nguyễn Thanh Tùng', exported: true },
  { period: 'Tháng 03/2026', start: '01/03/2026', end: '31/03/2026', total: 102_100_000, staff: 12, locked: '04/04/2026 16:08', lockedBy: 'Nguyễn Thanh Tùng', exported: true },
  { period: 'Tháng 02/2026', start: '01/02/2026', end: '28/02/2026', total: 89_700_000, staff: 11, locked: '04/03/2026 15:44', lockedBy: 'Nguyễn Thanh Tùng', exported: true },
  { period: 'Tháng 01/2026', start: '01/01/2026', end: '31/01/2026', total: 95_300_000, staff: 11, locked: '05/02/2026 13:19', lockedBy: 'Nguyễn Thanh Tùng', exported: true },
  { period: 'Tháng 12/2025', start: '01/12/2025', end: '31/12/2025', total: 107_800_000, staff: 12, locked: '06/01/2026 10:52', lockedBy: 'Nguyễn Thanh Tùng', exported: true },
  { period: 'Tháng 11/2025', start: '01/11/2025', end: '30/11/2025', total: 91_200_000, staff: 10, locked: '04/12/2025 17:31', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 10/2025', start: '01/10/2025', end: '31/10/2025', total: 93_600_000, staff: 10, locked: '05/11/2025 14:18', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 09/2025', start: '01/09/2025', end: '30/09/2025', total: 88_900_000, staff: 10, locked: '03/10/2025 16:42', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 08/2025', start: '01/08/2025', end: '31/08/2025', total: 96_200_000, staff: 11, locked: '04/09/2025 11:29', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 07/2025', start: '01/07/2025', end: '31/07/2025', total: 99_800_000, staff: 11, locked: '05/08/2025 15:07', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 06/2025', start: '01/06/2025', end: '30/06/2025', total: 85_300_000, staff: 9, locked: '03/07/2025 13:51', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 05/2025', start: '01/05/2025', end: '31/05/2025', total: 91_700_000, staff: 9, locked: '04/06/2025 10:14', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 04/2025', start: '01/04/2025', end: '30/04/2025', total: 87_400_000, staff: 9, locked: '05/05/2025 16:33', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 03/2025', start: '01/03/2025', end: '31/03/2025', total: 94_100_000, staff: 10, locked: '04/04/2025 14:58', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 02/2025', start: '01/02/2025', end: '28/02/2025', total: 81_200_000, staff: 9, locked: '05/03/2025 12:41', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 01/2025', start: '01/01/2025', end: '31/01/2025', total: 88_600_000, staff: 9, locked: '03/02/2025 17:26', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 12/2024', start: '01/12/2024', end: '31/12/2024', total: 103_400_000, staff: 10, locked: '06/01/2025 11:03', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 11/2024', start: '01/11/2024', end: '30/11/2024', total: 86_700_000, staff: 8, locked: '04/12/2024 15:49', lockedBy: 'Trần Minh Hà', exported: true },
  { period: 'Tháng 10/2024', start: '01/10/2024', end: '31/10/2024', total: 79_800_000, staff: 8, locked: '05/11/2024 13:22', lockedBy: 'Lê Văn Minh', exported: true },
  { period: 'Tháng 09/2024', start: '01/09/2024', end: '30/09/2024', total: 82_400_000, staff: 8, locked: '03/10/2024 16:17', lockedBy: 'Lê Văn Minh', exported: true },
  { period: 'Tháng 08/2024', start: '01/08/2024', end: '31/08/2024', total: 84_900_000, staff: 8, locked: '04/09/2024 14:55', lockedBy: 'Lê Văn Minh', exported: true },
  { period: 'Tháng 07/2024', start: '01/07/2024', end: '31/07/2024', total: 87_300_000, staff: 9, locked: '05/08/2024 10:38', lockedBy: 'Lê Văn Minh', exported: true },
];

export const FIN_LOCS: FinLoc[] = [
  { locationId: 'L1', name: 'Bến Thành', short: 'BT', area: 'Q1, TP.HCM', color: '#00B4A0' },
  { locationId: 'L2', name: 'Thảo Điền', short: 'TD', area: 'Q2, TP.HCM', color: '#2B7EC4' },
  { locationId: 'L3', name: 'Phú Mỹ Hưng', short: 'PMH', area: 'Q7, TP.HCM', color: '#7C4FBF' },
  { locationId: 'L5', name: 'Cầu Giấy', short: 'CG', area: 'Cầu Giấy, HN', color: '#B45309' },
];

export const PAYROLL_RAW_DATA: PayrollRawEntry[] = [
  { larkUserId: 'lark_user_001', name: 'Nguyễn Văn An', locationId: 'L1', isManager: false, items: [{ name: 'Phục vụ', color: '#00B4A0', type: 'hourly', rate: 32000, regH: 88, otH: 0 }, { name: 'Thu ngân', color: '#2B7EC4', type: 'hourly', rate: 35000, regH: 40, otH: 4 }], status: 'reviewed' },
  { larkUserId: 'lark_user_002', name: 'Trần Thị Bích', locationId: 'L1', isManager: false, items: [{ name: 'Pha chế', color: '#7C4FBF', type: 'hourly', rate: 40000, regH: 152, otH: 8 }], status: 'reviewed' },
  { larkUserId: 'lark_user_003', name: 'Lê Thị Hồng Nhung', locationId: 'L1', isManager: true, items: [{ name: 'Trưởng ca', color: '#B45309', type: 'monthly', monthly: 14_000_000 }], status: 'reviewed' },
  { larkUserId: 'lark_user_004', name: 'Phạm Quốc Anh', locationId: 'L2', isManager: true, items: [{ name: 'Trưởng ca', color: '#B45309', type: 'monthly', monthly: 12_500_000 }, { name: 'Thu ngân', color: '#2B7EC4', type: 'hourly', rate: 35000, regH: 32, otH: 2 }], status: 'pending' },
  { larkUserId: 'lark_user_005', name: 'Đỗ Minh Tâm', locationId: 'L3', isManager: false, items: [{ name: 'Bếp', color: '#1A6B55', type: 'hourly', rate: 42000, regH: 160, otH: 16 }], status: 'reviewed' },
  { larkUserId: 'lark_user_006', name: 'Vũ Hải Yến', locationId: 'L1', isManager: false, items: [{ name: 'Phục vụ', color: '#00B4A0', type: 'hourly', rate: 32000, regH: 120, otH: 0 }], status: 'reviewed' },
  { larkUserId: 'lark_user_007', name: 'Trần Mỹ Linh', locationId: 'L3', isManager: true, items: [{ name: 'Trưởng ca', color: '#B45309', type: 'monthly', monthly: 13_200_000 }, { name: 'Pha chế', color: '#7C4FBF', type: 'hourly', rate: 40000, regH: 24, otH: 0 }], status: 'pending' },
  { larkUserId: 'lark_user_008', name: 'Hoàng Việt Hùng', locationId: 'L2', isManager: false, items: [{ name: 'Bảo vệ', color: '#6B7E8E', type: 'monthly', monthly: 7_800_000 }], status: 'reviewed' },
  { larkUserId: 'lark_user_009', name: 'Nguyễn Thị Thu Hà', locationId: 'L5', isManager: true, items: [{ name: 'Trưởng ca', color: '#B45309', type: 'monthly', monthly: 13_500_000 }], status: 'reviewed' },
  { larkUserId: 'lark_user_010', name: 'Bùi Anh Tuấn', locationId: 'L2', isManager: false, items: [{ name: 'Pha chế', color: '#7C4FBF', type: 'hourly', rate: 40000, regH: 96, otH: 8 }, { name: 'Phục vụ', color: '#00B4A0', type: 'hourly', rate: 32000, regH: 64, otH: 0 }], status: 'reviewed' },
  { larkUserId: 'lark_user_011', name: 'Phan Thanh Hằng', locationId: 'L5', isManager: false, items: [{ name: 'Phục vụ', color: '#00B4A0', type: 'hourly', rate: 32000, regH: 144, otH: 0 }], status: 'reviewed' },
  { larkUserId: 'lark_user_012', name: 'Đặng Khánh Linh', locationId: 'L3', isManager: false, items: [{ name: 'Thu ngân', color: '#2B7EC4', type: 'hourly', rate: 35000, regH: 80, otH: 0 }, { name: 'Phục vụ', color: '#00B4A0', type: 'hourly', rate: 32000, regH: 48, otH: 0 }], status: 'reviewed' },
];

export function computePayroll(raw: PayrollRawEntry[]): PayrollEntry[] {
  return raw.map(s => {
    const totalReg = s.items.reduce((sum, it) => sum + (it.type === 'hourly' ? (it.regH ?? 0) * (it.rate ?? 0) : 0), 0);
    const totalOT = s.items.reduce((sum, it) => sum + (it.type === 'hourly' ? (it.otH ?? 0) * (it.rate ?? 0) * 1.5 : 0), 0);
    const totalMo = s.items.reduce((sum, it) => sum + (it.type === 'monthly' ? (it.monthly ?? 0) : 0), 0);
    const totalH = s.items.reduce((sum, it) => sum + (it.regH ?? 0) + (it.otH ?? 0), 0);
    const otH = s.items.reduce((sum, it) => sum + (it.otH ?? 0), 0);
    return { ...s, totalReg, totalOT, totalMonthly: totalMo, totalHours: totalH, otHours: otH, total: totalReg + totalOT + totalMo };
  });
}

export function computeSummary(payroll: PayrollEntry[]): FinSummary {
  return {
    total: payroll.reduce((s, p) => s + p.total, 0),
    monthly: payroll.reduce((s, p) => s + p.totalMonthly, 0),
    hourly: payroll.reduce((s, p) => s + p.totalReg, 0),
    ot: payroll.reduce((s, p) => s + p.totalOT, 0),
    staff: payroll.length,
    reviewed: payroll.filter(p => p.status === 'reviewed').length,
    pending: payroll.filter(p => p.status === 'pending').length,
    otCount: payroll.filter(p => p.otHours > 0).length,
  };
}

export function computeByLoc(payroll: PayrollEntry[]): FinByLoc[] {
  return FIN_LOCS.map(l => {
    const staff = payroll.filter(p => p.locationId === l.locationId);
    return {
      ...l, staff, count: staff.length,
      total: staff.reduce((s, p) => s + p.total, 0),
      monthly: staff.reduce((s, p) => s + p.totalMonthly, 0),
      hourly: staff.reduce((s, p) => s + p.totalReg, 0),
      ot: staff.reduce((s, p) => s + p.totalOT, 0),
      reviewed: staff.filter(p => p.status === 'reviewed').length,
    };
  });
}
