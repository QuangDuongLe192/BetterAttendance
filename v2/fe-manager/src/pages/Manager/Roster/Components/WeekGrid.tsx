import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../components/UI';
import { staffById, locById, roleById } from '../../../../services/setup';
import { WEEK_ROSTER, minutesFromVN } from '../../../../services/manager';
import type { ShiftEntity } from '../../../../services/manager';
import { fmtShort, TODAY_FULL } from './weekUtils';
import type { WeekDay } from './weekUtils';
import { ClipboardList } from 'lucide-react';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const CHIP: Record<ShiftEntity['status'], { bg: string; text: string; dot: string; dashed?: boolean }> = {
  in:        { bg: '#E6F9F7', text: '#00897B', dot: '#00B4A0' },
  completed: { bg: '#E6F9F7', text: '#00897B', dot: '#00B4A0' },
  late:      { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  absent:    { bg: '#FEF2F2', text: '#991B1B', dot: '#DC2626' },
  upcoming:  { bg: 'transparent', text: '#6B7E8E', dot: '#9BAAB5', dashed: true },
  overtime:  { bg: '#EDE9FE', text: '#4338CA', dot: '#6366F1' },
};

function ShiftCell({ entries }: { entries: ShiftEntity[] }) {
  if (entries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 28 }}>
        <span style={{ color: '#E8ECEF', fontSize: 12 }}>—</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {entries.map((e, i) => {
        const cs       = CHIP[e.status];
        const inMins   = minutesFromVN(e.scheduleInTime);
        const outMins  = minutesFromVN(e.scheduleOutTime);
        const startH   = Math.floor(inMins / 60).toString().padStart(2, '0');
        const startM   = (inMins % 60).toString().padStart(2, '0');
        const endH     = (Math.floor(outMins / 60) % 24).toString().padStart(2, '0');
        const endM     = (outMins % 60).toString().padStart(2, '0');
        const timeStr  = `${startH}:${startM}–${endH}:${endM}`;
        const loc      = locById(e.locationId);
        const role     = roleById(e.roleId);

        return (
          <div key={i} style={{ padding: '4px 6px', borderRadius: 5, background: cs.bg, border: cs.dashed ? `1px dashed ${cs.dot}` : 'none' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: cs.text, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {timeStr}
                {e.lateBy && <span style={{ marginLeft: 2, color: '#F59E0B' }}>{e.lateBy}p</span>}
              </div>
              <div style={{ fontSize: 9, color: '#6B7E8E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, marginTop: 1 }}>
                {role?.name ?? '—'}
              </div>
              <div style={{ fontSize: 9, color: '#9BAAB5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>
                {loc?.name ?? '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeekGrid({ week, activeStore }: { week: WeekDay[]; activeStore: string }) {
  const { t } = useTranslation('manager');
  const COL = '152px repeat(7, minmax(80px, 1fr)) 56px';

  const weekEntries = week.flatMap(d =>
    (WEEK_ROSTER[d.full] ?? []).filter(e => activeStore === 'all' || e.locationId === activeStore)
  );
  const staffIds = [...new Set(weekEntries.map(e => e.larkUserId).filter((s): s is string => !!s))];

  const byStaff: Record<string, Record<string, ShiftEntity[]>> = {};
  for (const sid of staffIds) {
    byStaff[sid] = {};
    for (const d of week) {
      byStaff[sid][d.full] = (WEEK_ROSTER[d.full] ?? [])
        .filter(e => e.larkUserId === sid && (activeStore === 'all' || e.locationId === activeStore));
    }
  }

  if (staffIds.length === 0) {
    return (
      <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <ClipboardList size={40} color="#C8D4DC" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', marginBottom: 6 }}>{t('manager.roster.week.empty.title')}</div>
          <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('manager.roster.week.empty.sub')}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...glass, borderRadius: 14, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 16px', borderBottom: '1px solid rgba(200,212,220,0.3)', background: 'rgba(247,249,250,0.97)', gap: 4, alignItems: 'center', position: 'sticky', top: 0, zIndex: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('manager.roster.week.col.staff')}</div>
        {week.map(d => {
          const isToday = d.full === TODAY_FULL;
          return (
            <div key={d.full} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#00B4A0' : '#6B7E8E', textTransform: 'uppercase' }}>{d.abbr}</span>
              <span style={{ fontSize: 10, color: isToday ? '#00B4A0' : '#9BAAB5' }}>{fmtShort(d.full)}</span>
              {isToday && <span style={{ width: 4, height: 4, borderRadius: 999, background: '#00B4A0' }} />}
            </div>
          );
        })}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Ca</div>
      </div>

      {/* Staff rows */}
      {staffIds.map((sid, rowIdx) => {
        const staff = staffById(sid);
        const allThisWeek = Object.values(byStaff[sid]).flat();
        const past    = allThisWeek.filter(e => e.status !== 'upcoming');
        const worked  = past.filter(e => ['completed', 'in', 'late', 'overtime'].includes(e.status));
        const total   = allThisWeek.length;

        return (
          <div
            key={sid}
            style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 16px', borderTop: rowIdx > 0 ? '1px solid rgba(200,212,220,0.25)' : 'none', gap: 4, alignItems: 'start', transition: 'background 100ms' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.025)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 3 }}>
              <Avatar name={staff.name} src={staff.avatar} size={24} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</div>
              </div>
            </div>

            {week.map(d => (
              <ShiftCell key={d.full} entries={byStaff[sid][d.full]} />
            ))}

            <div style={{ textAlign: 'center', paddingTop: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: past.length > 0 && worked.length < past.length ? '#F59E0B' : '#6B7E8E' }}>
                {worked.length}/{total}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
