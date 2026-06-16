import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../shared/components/Icons';
import { useTodayShifts } from '../features/attendance/hooks/useTodayShifts';
import { useAuthStore } from '../store/authStore';
import { Skeleton, SkeletonCard } from '../shared/components/ui/Skeleton';
import { usePullToRefresh } from '../shared/hooks/usePullToRefresh';
import { buildDailyScript } from '../features/attendance/lib/buildDailyScript';
import { TodayStats } from '../features/attendance/components/TodayStats';
import { HeroShiftCard } from '../features/attendance/components/HeroShiftCard';
import { UpcomingShiftItem } from '../features/attendance/components/UpcomingShiftItem';

export function TodayPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data, isPending, refetch } = useTodayShifts();
  const { containerRef, onTouchStart, onTouchEnd, dragOffset } = usePullToRefresh(() => { refetch(); });
  const user = useAuthStore((s) => s.user);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isVi = i18n.language === 'vi';

  const hour = now.getHours();
  const greetingKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greeting = t(`common.greeting.${greetingKey}`);
  const firstName = user?.name?.split(' ').pop() ?? '';

  const shifts = data?.shifts ?? [];
  const heroShifts = shifts.filter((s) => {
    if (s.clockOut) return false;
    if (s.clockIn) return true;
    return now.getTime() <= s.end;
  });
  const heroShiftIds = new Set(heroShifts.map((s) => s.shiftId));
  const upcomingShifts = shifts.filter((s) => {
    if (heroShiftIds.has(s.shiftId) || s.clockOut || s.clockIn) return false;
    return s.start > now.getTime();
  });
  const allHeroDone = heroShifts.length === 0;

  return (
    <div className="cd-page" ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {dragOffset > 0 && (
        <div
          className="cd-ptr-indicator"
          style={{ '--ptr-progress': dragOffset / 72 } as React.CSSProperties}
        />
      )}
      <div className="cd-header" style={{ paddingBottom: 30 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--c-teal)', marginBottom: 8 }}>
          {new Date(todayStr + 'T00:00:00').toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 7vw, 30px)',
          lineHeight: 1.2, letterSpacing: '-0.02em',
          color: 'var(--fg-1)', margin: 0,
        }}>
          {greeting}{firstName ? (
            <>, <span style={{ color: 'var(--c-teal)' }}>{firstName}</span>.</>
          ) : '.'}
        </h1>
        <div style={{ marginTop: 6, fontSize: 'clamp(15px, 5vw, 20px)', color: 'var(--fg-3)', lineHeight: 1.5, minHeight: 24 }}>
          {isPending ? (
            <Skeleton height={16} width="80%" borderRadius={4} />
          ) : data ? (
            buildDailyScript(shifts, now.getDay(), i18n.language)
          ) : null}
        </div>
      </div>

      <TodayStats shifts={shifts} isPending={isPending} />

      {isPending ? (
        <SkeletonCard lines={4} />
      ) : shifts.length > 0 ? (
        <>
          {heroShifts.map((shift) => (
            <HeroShiftCard key={shift.shiftId} shift={shift} />
          ))}

          {upcomingShifts.length > 0 && (
            <>
              <div className="cd-upcoming-section-label">
                {t('attendance.today.upcomingShifts')}
              </div>
              {upcomingShifts.map((shift) => (
                <UpcomingShiftItem key={shift.shiftId} shift={shift} />
              ))}
            </>
          )}

          {allHeroDone && shifts.filter((s) => s.clockOut).map((shift) => (
            <HeroShiftCard key={shift.shiftId} shift={shift} />
          ))}
        </>
      ) : (
        <div className="cd-card cd-card--soft">
          <div className="cd-empty">
            <div className="cd-empty__icon">
              <Icons.calendar size={40} sw={1.5} style={{ color: 'var(--c-teal-light)' }} />
            </div>
            <div className="cd-empty__title">{t('attendance.today.noShift')}</div>
            <div className="cd-empty__sub">{t('attendance.today.noShiftSub')}</div>
          </div>
          <button
            className="cd-btn cd-btn--secondary cd-btn--full"
            style={{ marginTop: 8 }}
            onClick={() => navigate('/calendar')}
          >
            {t('attendance.earnings.viewWeeklySchedule')}
          </button>
        </div>
      )}
    </div>
  );
}
