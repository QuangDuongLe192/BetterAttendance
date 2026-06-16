import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../components/UI';
import { ChevronDown } from 'lucide-react';
import { staffById, roleById, roleColor } from '../../../../services/setup';
import type { DayStatus, MonthStaff } from '../../../../services/manager';

export type { DayStatus, MonthStaff };

export const GRID = '1fr 150px 200px 64px 64px 64px 72px 40px';

const DOT_COLOR: Record<DayStatus, string> = {
  ok:       '#00B4A0',
  late:     '#F59E0B',
  absent:   '#DC2626',
  off:      '#E8ECEF',
  upcoming: '#BFD7F0',
};

function pct(a: number, b: number) { return b === 0 ? 0 : Math.round(a / b * 100); }
function fmtH(h: number) { return `${h}h`; }

export function MonthRow({ row, borderTop, expanded, onToggle }: {
  row: MonthStaff; borderTop: boolean; expanded: boolean; onToggle: () => void;
}) {
  const { t } = useTranslation('manager');

  const DAY_LABEL: Record<DayStatus, string> = {
    ok:       t('manager.roster.month.day.ok'),
    late:     t('manager.roster.month.day.late'),
    absent:   t('manager.roster.month.day.absent'),
    off:      t('manager.roster.month.day.off'),
    upcoming: t('manager.roster.month.day.upcoming'),
  };

  const staff = staffById(row.larkUserId);
  const role  = roleById(staff.roleIds[0] ?? '');
  const attendancePct = pct(row.workedDays, row.schedDays);

  return (
    <div style={{ borderTop: borderTop ? '1px solid rgba(200,212,220,0.25)' : 'none' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: GRID, padding: '16px 24px', alignItems: 'center', gap: 0, transition: 'background 100ms' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.025)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Avatar name={staff.name} src={staff.avatar} size={30} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</div>
          </div>
        </div>

        {role ? (
          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: `${roleColor(role)}15`, color: roleColor(role), fontWeight: 600, width: 'fit-content' }}>
            {role.name}
          </span>
        ) : <span />}

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', marginBottom: 5 }}>
            {row.workedDays}
            <span style={{ fontWeight: 400, color: '#9BAAB5', fontSize: 12 }}> {t('manager.roster.month.dayUnit', { count: row.schedDays })}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(200,212,220,0.4)', borderRadius: 2, maxWidth: 150 }}>
            <div style={{
              height: 4, borderRadius: 2,
              background: attendancePct >= 90 ? '#00B4A0' : attendancePct >= 75 ? '#F59E0B' : '#DC2626',
              width: `${attendancePct}%`,
              transition: 'width 400ms',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#00B4A0' }}>{row.onTime}</span>
          <span style={{ fontSize: 10, color: '#9BAAB5' }}>{t('manager.roster.month.days')}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {row.late > 0 ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>{row.late}</span>
              <span style={{ fontSize: 10, color: '#9BAAB5' }}>lần</span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 400, color: '#C8D4DC' }}>—</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {row.absent > 0 ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{row.absent}</span>
              <span style={{ fontSize: 10, color: '#9BAAB5' }}>ca</span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 400, color: '#C8D4DC' }}>—</span>
          )}
        </div>

        <div>
          {row.otH > 0 ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6366F1' }}>+{fmtH(row.otH)}</span>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 400, color: '#C8D4DC' }}>—</span>
          )}
        </div>

        <button
          onClick={onToggle}
          title={expanded ? t('manager.roster.month.toggle.hide') : t('manager.roster.month.toggle.show')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B7E8E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronDown size={14} strokeWidth={1.75} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '12px 24px 16px', background: 'rgba(247,249,250,0.7)', borderTop: '1px solid rgba(200,212,220,0.25)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9BAAB5', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            {t('manager.roster.month.detail.title')}
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {row.strip.map((dayShifts, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayShifts.length === 0 ? (
                  <span style={{ width: 20, height: 20, borderRadius: 3, background: 'rgba(200,212,220,0.2)', flexShrink: 0, display: 'block' }} />
                ) : dayShifts.map((s, j) => (
                  <span
                    key={j}
                    title={`Ngày ${i + 1}${dayShifts.length > 1 ? ` · Ca ${j + 1}` : ''}: ${DAY_LABEL[s]}`}
                    style={{ width: 20, height: 20, borderRadius: 3, background: DOT_COLOR[s], flexShrink: 0, display: 'block' }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {(['ok', 'late', 'absent', 'upcoming'] as DayStatus[]).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: DOT_COLOR[s], display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#6B7E8E' }}>{DAY_LABEL[s]}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(200,212,220,0.3)', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#6B7E8E' }}>{t('manager.roster.month.detail.noShift')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
