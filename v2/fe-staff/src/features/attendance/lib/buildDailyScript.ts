import { formatDayName } from '../../../shared/lib/date';
import { formatShiftTime } from '../../../shared/lib/shift';
import type { ShiftItemDto } from '../types';

export function buildDailyScript(
  shifts: ShiftItemDto[],
  dow: number,
  lang: string,
): string {
  const isVi = lang === 'vi';

  const soonScript = buildSoonScript(shifts, lang, isVi);
  if (soonScript) return soonScript;

  const active = shifts.find((s) => s.clockIn && !s.clockOut);
  const upcoming = shifts.find((s) => !s.clockIn);
  const doneCount = shifts.filter((s) => s.clockIn && s.clockOut).length;

  if (active) return buildActiveScript(active, lang, isVi);
  if (upcoming) return buildUpcomingScript(upcoming, lang, isVi);
  if (doneCount > 0) return buildDoneScript(doneCount, isVi);
  return buildEmptyScript(dow, lang, isVi);
}

function buildSoonScript(
  shifts: ShiftItemDto[],
  lang: string,
  isVi: boolean,
): string | null {
  const hero = shifts.find((s) => !s.clockOut);
  if (!hero || hero.clockIn) return null;
  const diff = Math.round((hero.start - Date.now()) / 60000);
  if (diff <= 0 || diff > 20) return null;
  const startLabel = formatShiftTime(hero.start, lang);
  return isVi
    ? `Ca ${startLabel} của bạn sắp bắt đầu, chuẩn bị tinh thần đón khách nhé! ⚡`
    : `Your ${startLabel} shift is starting soon — get ready to welcome guests! ⚡`;
}

function buildActiveScript(
  active: ShiftItemDto,
  lang: string,
  isVi: boolean,
): string {
  const remaining = Math.round((active.end - Date.now()) / 60000);
  if (remaining > 0 && remaining <= 30) {
    return isVi
      ? `Còn khoảng ${remaining} phút nữa là hết ca.`
      : `About ${remaining} min left on your shift.`;
  }
  if (remaining <= 0) {
    return isVi
      ? 'Ca đã kết thúc — đừng quên chấm công ra.'
      : 'Shift ended — remember to clock out.';
  }
  return isVi
    ? `Đang trong ca tại ${active.locationName}.`
    : `On shift at ${active.locationName}.`;
}

function buildUpcomingScript(
  upcoming: ShiftItemDto,
  lang: string,
  isVi: boolean,
): string {
  const diff = Math.round((upcoming.start - Date.now()) / 60000);
  const startLabel = formatShiftTime(upcoming.start, lang);
  const endLabel = formatShiftTime(upcoming.end, lang);
  if (diff > 0 && diff <= 30) {
    return isVi
      ? `Ca bắt đầu lúc ${startLabel} — còn ${diff} phút.`
      : `Shift at ${startLabel} starts in ${diff} min.`;
  }
  if (diff <= 0) {
    return isVi
      ? `Ca ${startLabel} đang chờ bạn chấm công.`
      : `Your ${startLabel} shift is waiting — clock in.`;
  }
  return isVi
    ? `Ca hôm nay: ${startLabel}–${endLabel} tại ${upcoming.locationName}.`
    : `Today: ${startLabel}–${endLabel} at ${upcoming.locationName}.`;
}

function buildDoneScript(doneCount: number, isVi: boolean): string {
  const plural = doneCount > 1 ? 's' : '';
  return isVi
    ? `${doneCount} ca hôm nay đã xong. Nghỉ ngơi đi.`
    : `${doneCount} shift${plural} done today. Rest up.`;
}

function buildEmptyScript(dow: number, lang: string, isVi: boolean): string {
  const isWeekend = dow === 0 || dow === 6;
  const isMonday = dow === 1;
  const isFriday = dow === 5;
  const dowLabel = formatDayName(new Date(), lang);
  if (isWeekend) return isVi ? `${dowLabel} — ngày nghỉ của bạn.` : `${dowLabel} — your day off.`;
  if (isMonday) return isVi ? 'Đầu tuần rồi, không có ca hôm nay.' : 'Week starts — no shift today.';
  if (isFriday) return isVi ? 'Cuối tuần rồi, không có ca hôm nay.' : 'End of week — no shift today.';
  return isVi ? `${dowLabel} — hôm nay không có ca.` : `${dowLabel} — no shift today.`;
}
