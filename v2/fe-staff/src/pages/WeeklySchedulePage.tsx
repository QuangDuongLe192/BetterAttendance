import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWeeklySchedule } from "../features/attendance/hooks/useWeeklySchedule";
import { addDays, getWeekStart } from "../shared/lib/date";
import { ScreenHeader } from "../shared/components/ui/ScreenHeader";
import { WeeklyScheduleView } from "../features/attendance/components/WeeklyScheduleView";

function formatWeekRange(weekStart: string, lang: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(weekStart + 'T00:00:00');
  end.setDate(end.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (lang === 'vi') {
    const VI_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const startLabel = `${VI_DAYS[start.getDay()]} ${pad(start.getDate())}/${pad(start.getMonth() + 1)}`;
    const endLabel = `${VI_DAYS[end.getDay()]} ${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;
    return `${startLabel} — ${endLabel}`;
  }

  const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const EN_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const startLabel = `${EN_DAYS[start.getDay()]} ${start.getDate()} ${EN_MONTHS[start.getMonth()]}`;
  const endLabel = `${EN_DAYS[end.getDay()]} ${end.getDate()} ${EN_MONTHS[end.getMonth()]}`;
  return `${startLabel} — ${endLabel}`;
}

export function WeeklySchedulePage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const { data, isLoading } = useWeeklySchedule(weekStart);
  const days = data?.days ?? [];

  return (
    <div className="cd-page">
      <ScreenHeader title={formatWeekRange(weekStart, lang)} />
      {isLoading ? (
        <p style={{ padding: '24px 16px', color: 'var(--fg-3)', fontSize: 14 }}>...</p>
      ) : (
        <WeeklyScheduleView
          days={days}
          onPrevWeek={() => setWeekStart(prev => addDays(prev, -7))}
          onNextWeek={() => setWeekStart(prev => addDays(prev, 7))}
          onGoToToday={() => setWeekStart(getWeekStart(new Date()))}
          onShiftClick={(date, idx) => {
            const shift = days.find(d => d.date === date)?.shifts[idx];
            if (shift) navigate(`/shifts/${shift.shiftId}`);
          }}
        />
      )}
    </div>
  );
}
