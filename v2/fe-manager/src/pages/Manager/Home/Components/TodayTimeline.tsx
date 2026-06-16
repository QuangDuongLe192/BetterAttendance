import { useTranslation } from 'react-i18next';
import { Icons } from '../../../../components/Icons';
import { Card, Avatar } from '../../../../components/UI';
import { TODAY_ROSTER, minutesFromVN } from '../../../../services/manager';
import { locById, staffById } from '../../../../services/setup';

const STATUS = {
  in: { bg: '#00B4A0', fg: '#fff' },
  late: { bg: '#F59E0B', fg: '#fff' },
  absent: { bg: '#DC2626', fg: '#fff' },
  upcoming: { bg: '#E8ECEF', fg: '#6B7E8E' },
  overtime: { bg: '#6366F1', fg: '#fff' },
  completed: { bg: '#4b88b4ff', fg: '#fff' },
} as const;

const GRID_START = 0;
const GRID_END = 24 * 60;
const TOTAL = GRID_END - GRID_START;
const COL_W = 188;
const HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

const pct = (min: number) => Math.max(0, Math.min(100, (min - GRID_START) / TOTAL * 100));
const fmtMin = (min: number) => {
  const h = Math.floor(min / 60) % 24, m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export function TodayTimeline({ activeStore }: { activeStore: string }) {
  const { t } = useTranslation('manager');
  const store = activeStore === 'all' ? null : locById(activeStore);
  const roster = TODAY_ROSTER.filter(r => activeStore === 'all' || r.locationId === activeStore);

  const LEGEND = [
    { bg: '#00B4A0', label: t('manager.timeline.legend.working'), solid: true },
    { bg: '#4b88b4ff', label: t('manager.timeline.legend.done'), solid: true },
    { bg: '#F59E0B', label: t('manager.timeline.legend.late'), solid: true },
    { bg: '#DC2626', label: t('manager.timeline.legend.absent'), solid: true },
    { bg: '#6366F1', label: t('manager.timeline.legend.overtime'), solid: true },
    { bg: '#C8D4DC', label: t('manager.timeline.legend.upcoming'), solid: false },
  ];

  // Group shifts by larkUserId so each staff occupies one row
  const staffGroups = (() => {
    const map = new Map<string, typeof roster>();
    for (const r of roster) {
      const key = r.larkUserId ?? `__open_${r.jobId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.values());
  })();

  return (
    <Card pad={false}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8ECEF', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#00B4A0', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            {t('manager.timeline.eyebrow')}
          </div>
          <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1E2D3D' }}>
            {t('manager.timeline.title')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {LEGEND.map(l => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#3A4F63', fontWeight: 500 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: l.solid ? l.bg : 'transparent', border: l.solid ? 'none' : `1.5px solid ${l.bg}`, flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline body */}
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', padding: '0 24px 24px' }}>
        {/* Time ruler — sticky */}
        <div style={{ display: 'flex', marginBottom: 2, position: 'sticky', top: 0, zIndex: 2, background: '#fff', paddingTop: 16, paddingBottom: 4 }}>
          <div style={{ width: COL_W, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', height: 20 }}>
            {HOURS.map(h => (
              <span key={h} style={{ position: 'absolute', left: `${pct(h * 60)}%`, transform: h === 24 ? 'translateX(-100%)' : 'translateX(-50%)', fontSize: 10, color: '#6B7E8E', whiteSpace: 'nowrap' }}>
                {h === 24 ? '24:00' : `${h.toString().padStart(2, '0')}:00`}
              </span>
            ))}
          </div>
        </div>

        {/* Grid + rows */}
        <div style={{ position: 'relative' }}>
          {HOURS.map(h => (
            <div key={h} style={{ position: 'absolute', left: `calc(${COL_W}px + (100% - ${COL_W}px) * ${pct(h * 60) / 100})`, top: 0, bottom: 0, width: 1, background: '#F0F4F7', zIndex: 0, pointerEvents: 'none' }} />
          ))}

          {staffGroups.map((shifts, i) => {
            const first = shifts[0];
            const staff = first.larkUserId ? staffById(first.larkUserId) : null;
            const subtitle = shifts.length > 1
              ? shifts.map(s => s.tag).join(' · ')
              : `${(store ?? locById(first.locationId)).name} · ${first.tag}`;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', paddingTop: 5, paddingBottom: 5, borderTop: i > 0 ? '1px solid #F0F4F7' : 'none', position: 'relative', zIndex: 1 }}>
                {/* Left col */}
                <div style={{ width: COL_W, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16 }}>
                  {staff
                    ? <Avatar name={staff.name} src={staff.avatar} size={28} />
                    : <span style={{ width: 28, height: 28, borderRadius: 999, background: '#F0F4F7', border: '1.5px dashed #C8D4DC', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.users size={15} stroke="#6B7E8E" />
                    </span>
                  }
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                      {staff?.name ?? ''}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7E8E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {subtitle}
                    </div>
                  </div>
                </div>

                {/* Timeline bars — one per shift */}
                <div style={{ flex: 1, position: 'relative', height: 40 }}>
                  {shifts.map(r => {
                    const sc = STATUS[r.status] ?? STATUS.upcoming;
                    const schedStart = minutesFromVN(r.scheduleInTime);
                    const schedEndRaw = minutesFromVN(r.scheduleOutTime);
                    // unwrap overnight shift: end < start means it crossed midnight
                    const schedEnd = schedEndRaw < schedStart ? schedEndRaw + 24 * 60 : schedEndRaw;
                    const isCompleted = r.status === 'completed' && r.actualInTime && r.actualOutTime;
                    const barStartRaw = isCompleted ? minutesFromVN(r.actualInTime!) : schedStart;
                    const barEndRaw = isCompleted ? minutesFromVN(r.actualOutTime!) : schedEnd;
                    const barStart = barStartRaw;
                    const barEnd = barEndRaw < barStartRaw ? barEndRaw + 24 * 60 : barEndRaw;
                    const barLeft = pct(barStart);
                    const barWidth = Math.max(pct(Math.min(barEnd, GRID_END)) - barLeft, 1);
                    const workedH = isCompleted ? ((r.actualOutTime! - r.actualInTime!) / 3_600_000).toFixed(1) : null;
                    const barLabel = isCompleted
                      ? `${fmtMin(minutesFromVN(r.actualInTime!))}–${fmtMin(minutesFromVN(r.actualOutTime!))} · ${workedH}h`
                      : `${fmtMin(schedStart)}–${fmtMin(schedEnd)}${r.lateBy ? ` | trễ ${r.lateBy}'` : ''}`;

                    return (
                      <div key={r.jobId} style={{ position: 'absolute', left: `${barLeft}%`, width: `${barWidth}%`, top: '50%', transform: 'translateY(-50%)', height: 32, background: sc.bg, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc.fg, whiteSpace: 'nowrap' }}>
                          {barLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
