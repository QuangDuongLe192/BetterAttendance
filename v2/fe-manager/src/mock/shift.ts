import type { ShiftEntity } from '../services/Job/job';
import type { MonthStaff, DayStatus } from '../services/Manager/mgr';
import { STAFF } from './staff';

const _n = new Date();
const _p = (n: number) => n.toString().padStart(2, '0');
export const NOW_TS = Date.now();
export const NOW = {
  hour: _n.getHours(),
  min:  _n.getMinutes(),
  dayLabel: `${_p(_n.getDate())}/${_p(_n.getMonth() + 1)}/${_n.getFullYear()}`,
};

export const fmtHHMM = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });

// VN midnight base timestamps (UTC ms)
// VN = UTC+7 → midnight VN = 17:00 UTC previous day
const D09 = 1746723600000; // 2026-05-09 00:00 VN
const D10 = 1746810000000; // 2026-05-10 00:00 VN
const D11 = 1746896400000; // 2026-05-11 00:00 VN
const D12 = 1746982800000; // 2026-05-12 00:00 VN
const D13 = 1747069200000; // 2026-05-13 00:00 VN
const D14 = 1747155600000; // 2026-05-14 00:00 VN
const D15 = 1747242000000; // 2026-05-15 00:00 VN

export const TODAY_ROSTER: ShiftEntity[] = [
  // L1 — Bến Thành
  { jobId: 'J001', larkUserId: 'lark_user_005', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R5', shiftLabel: 'Ca sáng sớm', tag: 'Bếp',      scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 25200000, scheduleTotal: 7200000,  actualInTime: D15 + 17880000, actualOutTime: D15 + 25380000, status: 'completed' },
  { jobId: 'J002', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R1', shiftLabel: 'Ca sáng',     tag: 'Phục vụ',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 50400000, scheduleTotal: 25200000, actualInTime: D15 + 25080000, actualOutTime: null,          status: 'in'        },
  { jobId: 'J003', larkUserId: 'lark_user_002', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R3', shiftLabel: 'Ca sáng',     tag: 'Pha chế',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 43200000, scheduleTotal: 19800000, actualInTime: D15 + 23460000, actualOutTime: null,          status: 'in'        },
  { jobId: 'J004', larkUserId: 'lark_user_003', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R4', shiftLabel: 'Ca sáng',     tag: 'Trưởng ca',scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 54000000, scheduleTotal: 28800000, actualInTime: D15 + 24900000, actualOutTime: null,          status: 'in'        },
  { jobId: 'J005', larkUserId: 'lark_user_006', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R1', shiftLabel: 'Ca chiều',    tag: 'Phục vụ',  scheduleInTime: D15 + 50400000, scheduleOutTime: D15 + 79200000, scheduleTotal: 28800000, actualInTime: null,           actualOutTime: null,          status: 'upcoming'  },
  { jobId: 'J006', larkUserId: 'lark_user_008', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R6', shiftLabel: 'Ca tối',      tag: 'Bảo vệ',   scheduleInTime: D15 + 79200000, scheduleOutTime: D15 + 108000000,scheduleTotal: 28800000, actualInTime: null,           actualOutTime: null,          status: 'upcoming'  },
  { jobId: 'J007', larkUserId: 'lark_user_010', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R3', shiftLabel: 'Ca ngày',     tag: 'Pha chế',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 57600000, scheduleTotal: 28800000, actualInTime: D15 + 30180000, actualOutTime: null,          status: 'late',    lateBy: 23 },
  { jobId: 'J008', larkUserId: 'lark_user_012', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R2', shiftLabel: 'Ca sáng',     tag: 'Thu ngân', scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 50400000, scheduleTotal: 25200000, actualInTime: D15 + 26040000, actualOutTime: null,          status: 'late',    lateBy: 14 },
  { jobId: 'J009', larkUserId: 'lark_user_011', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R1', shiftLabel: 'Ca chiều',    tag: 'Phục vụ',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 64800000, scheduleTotal: 28800000, actualInTime: null,           actualOutTime: null,          status: 'absent'    },
  { jobId: 'J014', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành', roleId: 'R2', shiftLabel: 'Ca tối', tag: 'Thu ngân', scheduleInTime: D15 + 64800000, scheduleOutTime: D15 + 79200000, scheduleTotal: 14400000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
  // L4 — Hai Bà Trưng
  { jobId: 'J010', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng', roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 50400000, scheduleTotal: 25200000, actualInTime: D15 + 24600000, actualOutTime: null,          status: 'in'        },
  { jobId: 'J011', larkUserId: 'lark_user_004', locationId: 'L4', locationName: 'Hai Bà Trưng', roleId: 'R4', shiftLabel: 'Ca ngày',  tag: 'Trưởng ca',scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 61200000, scheduleTotal: 32400000, actualInTime: D15 + 28260000, actualOutTime: null,          status: 'in'        },
  { jobId: 'J012', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng', roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 61200000, scheduleTotal: 28800000, actualInTime: D15 + 33480000, actualOutTime: null,          status: 'late',    lateBy: 18 },
  { jobId: 'J013', larkUserId: 'lark_user_009', locationId: 'L4', locationName: 'Hai Bà Trưng', roleId: 'R1', shiftLabel: 'Ca chiều', tag: 'Phục vụ',  scheduleInTime: D15 + 18000000, scheduleOutTime: D15 + 79200000, scheduleTotal: 28800000, actualInTime: null,           actualOutTime: null,          status: 'upcoming'  },
];

export const WEEK_ROSTER: Record<string, ShiftEntity[]> = {
  '2026-05-09': [
    { jobId: 'W09_01', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D09+25200000, scheduleOutTime: D09+50400000, scheduleTotal: 25200000, actualInTime: D09+25320000, actualOutTime: D09+50700000, status: 'completed' },
    { jobId: 'W09_02', larkUserId: 'lark_user_002', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca sáng',  tag: 'Pha chế',   scheduleInTime: D09+23400000, scheduleOutTime: D09+43200000, scheduleTotal: 19800000, actualInTime: D09+23280000, actualOutTime: D09+43380000, status: 'completed' },
    { jobId: 'W09_03', larkUserId: 'lark_user_010', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D09+28800000, scheduleOutTime: D09+57600000, scheduleTotal: 28800000, actualInTime: D09+28860000, actualOutTime: D09+57600000, status: 'completed' },
    { jobId: 'W09_04', larkUserId: 'lark_user_012', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R2', shiftLabel: 'Ca chiều', tag: 'Thu ngân',  scheduleInTime: D09+50400000, scheduleOutTime: D09+79200000, scheduleTotal: 28800000, actualInTime: D09+50280000, actualOutTime: D09+79320000, status: 'completed' },
    { jobId: 'W09_05', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D09+25200000, scheduleOutTime: D09+50400000, scheduleTotal: 25200000, actualInTime: D09+24900000, actualOutTime: D09+51000000, status: 'completed' },
    { jobId: 'W09_06', larkUserId: 'lark_user_004', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R4', shiftLabel: 'Ca ngày',  tag: 'Trưởng ca', scheduleInTime: D09+28800000, scheduleOutTime: D09+61200000, scheduleTotal: 32400000, actualInTime: D09+28680000, actualOutTime: D09+61500000, status: 'completed' },
    { jobId: 'W09_07', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D09+32400000, scheduleOutTime: D09+61200000, scheduleTotal: 28800000, actualInTime: D09+32400000, actualOutTime: D09+61200000, status: 'completed' },
    { jobId: 'W09_08', larkUserId: 'lark_user_009', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca chiều', tag: 'Phục vụ',   scheduleInTime: D09+50400000, scheduleOutTime: D09+79200000, scheduleTotal: 28800000, actualInTime: D09+50520000, actualOutTime: D09+79200000, status: 'completed' },
  ],
  '2026-05-10': [
    { jobId: 'W10_01', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D10+25200000, scheduleOutTime: D10+50400000, scheduleTotal: 25200000, actualInTime: D10+25080000, actualOutTime: D10+50520000, status: 'completed' },
    { jobId: 'W10_02', larkUserId: 'lark_user_003', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R4', shiftLabel: 'Ca sáng',  tag: 'Trưởng ca', scheduleInTime: D10+25200000, scheduleOutTime: D10+54000000, scheduleTotal: 28800000, actualInTime: D10+25200000, actualOutTime: D10+54060000, status: 'completed' },
    { jobId: 'W10_03', larkUserId: 'lark_user_010', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D10+28800000, scheduleOutTime: D10+57600000, scheduleTotal: 28800000, actualInTime: D10+29100000, actualOutTime: D10+57600000, status: 'completed' },
    { jobId: 'W10_04', larkUserId: 'lark_user_012', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R2', shiftLabel: 'Ca sáng',  tag: 'Thu ngân',  scheduleInTime: D10+25200000, scheduleOutTime: D10+50400000, scheduleTotal: 25200000, actualInTime: D10+26040000, actualOutTime: D10+52320000, status: 'completed' },
    { jobId: 'W10_05', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D10+25200000, scheduleOutTime: D10+50400000, scheduleTotal: 25200000, actualInTime: D10+24720000, actualOutTime: D10+50400000, status: 'completed' },
    { jobId: 'W10_06', larkUserId: 'lark_user_004', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R4', shiftLabel: 'Ca ngày',  tag: 'Trưởng ca', scheduleInTime: D10+28800000, scheduleOutTime: D10+61200000, scheduleTotal: 32400000, actualInTime: D10+28800000, actualOutTime: D10+61380000, status: 'completed' },
    { jobId: 'W10_07', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D10+32400000, scheduleOutTime: D10+61200000, scheduleTotal: 28800000, actualInTime: D10+33000000, actualOutTime: D10+61200000, status: 'completed' },
    { jobId: 'W10_08', larkUserId: 'lark_user_009', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca chiều', tag: 'Phục vụ',   scheduleInTime: D10+50400000, scheduleOutTime: D10+79200000, scheduleTotal: 28800000, actualInTime: D10+50340000, actualOutTime: D10+79200000, status: 'completed' },
  ],
  '2026-05-11': [
    { jobId: 'W11_01', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D11+25200000, scheduleOutTime: D11+50400000, scheduleTotal: 25200000, actualInTime: D11+25260000, actualOutTime: D11+50400000, status: 'completed' },
    { jobId: 'W11_02', larkUserId: 'lark_user_002', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca sáng',  tag: 'Pha chế',   scheduleInTime: D11+23400000, scheduleOutTime: D11+43200000, scheduleTotal: 19800000, actualInTime: D11+23400000, actualOutTime: D11+43200000, status: 'completed' },
    { jobId: 'W11_03', larkUserId: 'lark_user_012', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R2', shiftLabel: 'Ca chiều', tag: 'Thu ngân',  scheduleInTime: D11+50400000, scheduleOutTime: D11+79200000, scheduleTotal: 28800000, actualInTime: D11+50400000, actualOutTime: D11+79440000, status: 'completed' },
    { jobId: 'W11_04', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D11+25200000, scheduleOutTime: D11+50400000, scheduleTotal: 25200000, actualInTime: D11+25080000, actualOutTime: D11+50460000, status: 'completed' },
    { jobId: 'W11_05', larkUserId: 'lark_user_004', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R4', shiftLabel: 'Ca ngày',  tag: 'Trưởng ca', scheduleInTime: D11+28800000, scheduleOutTime: D11+61200000, scheduleTotal: 32400000, actualInTime: D11+28920000, actualOutTime: D11+61200000, status: 'completed' },
    { jobId: 'W11_06', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D11+32400000, scheduleOutTime: D11+61200000, scheduleTotal: 28800000, actualInTime: D11+32400000, actualOutTime: D11+61200000, status: 'completed' },
    { jobId: 'W11_07', larkUserId: 'lark_user_009', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca chiều', tag: 'Phục vụ',   scheduleInTime: D11+50400000, scheduleOutTime: D11+79200000, scheduleTotal: 28800000, actualInTime: D11+50700000, actualOutTime: D11+79200000, status: 'completed' },
  ],
  '2026-05-12': [
    { jobId: 'W12_01', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D12+25200000, scheduleOutTime: D12+50400000, scheduleTotal: 25200000, actualInTime: D12+25200000, actualOutTime: D12+50400000, status: 'completed' },
    { jobId: 'W12_02', larkUserId: 'lark_user_003', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R4', shiftLabel: 'Ca sáng',  tag: 'Trưởng ca', scheduleInTime: D12+25200000, scheduleOutTime: D12+54000000, scheduleTotal: 28800000, actualInTime: D12+24900000, actualOutTime: D12+54000000, status: 'completed' },
    { jobId: 'W12_03', larkUserId: 'lark_user_010', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D12+28800000, scheduleOutTime: D12+57600000, scheduleTotal: 28800000, actualInTime: D12+30180000, actualOutTime: D12+57600000, status: 'completed' },
    { jobId: 'W12_04', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D12+25200000, scheduleOutTime: D12+50400000, scheduleTotal: 25200000, actualInTime: D12+24600000, actualOutTime: D12+50520000, status: 'completed' },
    { jobId: 'W12_05', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D12+32400000, scheduleOutTime: D12+61200000, scheduleTotal: 28800000, actualInTime: D12+33480000, actualOutTime: D12+61200000, status: 'completed' },
  ],
  '2026-05-13': [
    { jobId: 'W13_01', larkUserId: 'lark_user_001', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D13+25200000, scheduleOutTime: D13+50400000, scheduleTotal: 25200000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_02', larkUserId: 'lark_user_002', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca sáng',  tag: 'Pha chế',   scheduleInTime: D13+23400000, scheduleOutTime: D13+43200000, scheduleTotal: 19800000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_03', larkUserId: 'lark_user_010', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D13+28800000, scheduleOutTime: D13+57600000, scheduleTotal: 28800000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_04', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D13+25200000, scheduleOutTime: D13+50400000, scheduleTotal: 25200000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_05', larkUserId: 'lark_user_004', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R4', shiftLabel: 'Ca ngày',  tag: 'Trưởng ca', scheduleInTime: D13+28800000, scheduleOutTime: D13+61200000, scheduleTotal: 32400000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_06', larkUserId: 'lark_user_007', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R3', shiftLabel: 'Ca ngày',  tag: 'Pha chế',   scheduleInTime: D13+32400000, scheduleOutTime: D13+61200000, scheduleTotal: 28800000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W13_07', larkUserId: 'lark_user_009', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca chiều', tag: 'Phục vụ',   scheduleInTime: D13+50400000, scheduleOutTime: D13+79200000, scheduleTotal: 28800000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
  ],
  '2026-05-14': [
    { jobId: 'W14_01', larkUserId: 'lark_user_003', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R4', shiftLabel: 'Ca sáng',  tag: 'Trưởng ca', scheduleInTime: D14+25200000, scheduleOutTime: D14+54000000, scheduleTotal: 28800000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W14_02', larkUserId: 'lark_user_012', locationId: 'L1', locationName: 'Bến Thành',   roleId: 'R2', shiftLabel: 'Ca sáng',  tag: 'Thu ngân',  scheduleInTime: D14+25200000, scheduleOutTime: D14+50400000, scheduleTotal: 25200000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
    { jobId: 'W14_03', larkUserId: 'lark_user_006', locationId: 'L4', locationName: 'Hai Bà Trưng',roleId: 'R1', shiftLabel: 'Ca sáng',  tag: 'Phục vụ',   scheduleInTime: D14+25200000, scheduleOutTime: D14+50400000, scheduleTotal: 25200000, actualInTime: null, actualOutTime: null, status: 'upcoming' },
  ],
  '2026-05-15': TODAY_ROSTER,
};

export const MONTHLY: MonthStaff[] = [
  { larkUserId: 'lark_user_001', store: 'L1', schedDays: 26, workedDays: 15, onTime: 14, late: 1,  absent: 0, otH: 2,   schedH: 208, actualH: 122, strip: [['ok'],['ok','late'],[],['ok'],['ok'],['ok'],['late'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_002', store: 'L1', schedDays: 26, workedDays: 15, onTime: 14, late: 1,  absent: 0, otH: 0,   schedH: 208, actualH: 120, strip: [['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['late'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_003', store: 'L1', schedDays: 26, workedDays: 15, onTime: 15, late: 0,  absent: 0, otH: 4,   schedH: 208, actualH: 124, strip: [['ok'],['ok','late'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_006', store: 'L1', schedDays: 22, workedDays: 13, onTime: 12, late: 1,  absent: 1, otH: 1,   schedH: 176, actualH: 105, strip: [['ok'],['ok'],[],['ok'],['ok'],['late'],['ok'],[],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['absent'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_010', store: 'L1', schedDays: 23, workedDays: 12, onTime: 9,  late: 3,  absent: 2, otH: 3,   schedH: 184, actualH: 99,  strip: [['ok'],['late'],[],['ok'],['absent'],['ok'],['late'],['ok'],['ok'],[],['ok'],['absent'],['late'],['ok'],['ok'],[],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_011', store: 'L1', schedDays: 23, workedDays: 14, onTime: 14, late: 0,  absent: 0, otH: 0.5, schedH: 184, actualH: 113, strip: [['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],[],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_012', store: 'L1', schedDays: 23, workedDays: 13, onTime: 11, late: 2,  absent: 0, otH: 1.5, schedH: 184, actualH: 106, strip: [['ok'],['ok','ok'],[],['ok'],['ok'],['late'],['ok'],[],['ok'],[],['ok'],['ok'],['late'],['ok'],['ok'],[],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_006', store: 'L4', schedDays: 6,  workedDays: 5,  onTime: 4,  late: 1,  absent: 1, otH: 0,   schedH: 48,  actualH: 40,  strip: [['ok'],['ok'],[],['absent'],['ok'],['late'],['ok'],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]] },
  { larkUserId: 'lark_user_004', store: 'L4', schedDays: 23, workedDays: 15, onTime: 15, late: 0,  absent: 0, otH: 6,   schedH: 184, actualH: 126, strip: [['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_007', store: 'L4', schedDays: 23, workedDays: 14, onTime: 12, late: 2,  absent: 1, otH: 2.5, schedH: 184, actualH: 115, strip: [['ok'],['ok'],[],['ok'],['ok'],['ok'],['late'],['ok'],['ok'],[],['ok'],['ok'],['absent'],['ok'],['ok'],['late'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
  { larkUserId: 'lark_user_009', store: 'L4', schedDays: 23, workedDays: 15, onTime: 15, late: 0,  absent: 0, otH: 5,   schedH: 184, actualH: 125, strip: [['ok'],['ok','ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['ok'],['ok'],['ok'],['ok'],['ok'],[],['ok'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],['upcoming'],[]] },
];

type _DayStatus = DayStatus; // keep import

const WORKING_DAYS = 26;
const HOURS_PER_DAY = 8;

function effectiveHourlyRate(larkUserId: string): number {
  const s = STAFF.find(x => x.larkUserId === larkUserId);
  if (!s) return 0;
  if (s.payType === 'hourly') return s.rate ?? 0;
  return (s.monthly ?? 0) / (WORKING_DAYS * HOURS_PER_DAY);
}

export function calcStoreToday(storeId: string): { laborCostToday: number; laborBudgetToday: number } {
  let budget = 0, cost = 0;
  for (const s of TODAY_ROSTER.filter(r => r.locationId === storeId)) {
    const rate = effectiveHourlyRate(s.larkUserId);
    budget += s.scheduleTotal / 3_600_000 * rate;
    if (s.status === 'completed' && s.actualInTime && s.actualOutTime)
      cost += (s.actualOutTime - s.actualInTime) / 3_600_000 * rate;
    else if ((s.status === 'in' || s.status === 'late') && s.actualInTime)
      cost += Math.max(0, (Date.now() - s.actualInTime) / 3_600_000) * rate;
  }
  return { laborCostToday: Math.round(cost), laborBudgetToday: Math.round(budget) };
}

export function calcStoreMonth(storeId: string): { laborCostMonth: number; laborBudgetMonth: number } {
  let cost = 0, budget = 0;
  for (const entries of Object.values(WEEK_ROSTER)) {
    for (const s of entries.filter(r => r.locationId === storeId)) {
      const rate = effectiveHourlyRate(s.larkUserId);
      budget += s.scheduleTotal / 3_600_000 * rate;
      if (s.status === 'completed' && s.actualInTime && s.actualOutTime)
        cost += (s.actualOutTime - s.actualInTime) / 3_600_000 * rate;
      else if ((s.status === 'in' || s.status === 'late') && s.actualInTime)
        cost += Math.max(0, (Date.now() - s.actualInTime) / 3_600_000) * rate;
    }
  }
  return { laborCostMonth: Math.round(cost), laborBudgetMonth: Math.round(budget) };
}
