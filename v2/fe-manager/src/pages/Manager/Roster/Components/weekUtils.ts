export type WeekDay = { abbr: string; vi: string; full: string };

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

const _today = new Date();
const _dow   = _today.getDay(); // 0=Sun, 1=Mon … 6=Sat

// Monday of the current week (ISO week: Mon=start)
const _monday = new Date(_today);
_monday.setDate(_today.getDate() + (_dow === 0 ? -6 : 1 - _dow));

export const TODAY_FULL = toDateStr(_today);

const _META = [
  { abbr: 'T2', vi: 'Thứ Hai'  },
  { abbr: 'T3', vi: 'Thứ Ba'   },
  { abbr: 'T4', vi: 'Thứ Tư'   },
  { abbr: 'T5', vi: 'Thứ Năm'  },
  { abbr: 'T6', vi: 'Thứ Sáu'  },
  { abbr: 'T7', vi: 'Thứ Bảy'  },
  { abbr: 'CN', vi: 'Chủ Nhật' },
];

export const BASE_WEEK: WeekDay[] = _META.map((d, i) => {
  const date = new Date(_monday);
  date.setDate(_monday.getDate() + i);
  return { ...d, full: toDateStr(date) };
});

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function fmtShort(full: string) {
  const [, mm, dd] = full.split('-');
  return `${dd}/${mm}`;
}

export function getWeek(weekOffset: number): WeekDay[] {
  return BASE_WEEK.map(d => ({
    abbr: d.abbr,
    vi: d.vi,
    full: addDays(d.full, weekOffset * 7),
  }));
}

export function weekRangeLabel(week: WeekDay[]) {
  return `${fmtShort(week[0].full)} – ${fmtShort(week[6].full)}/${week[0].full.split('-')[0]}`;
}
