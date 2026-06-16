import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Check, Clock, AlertTriangle, ChevronRight, ClipboardList } from 'lucide-react';
import { Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';

import { MONTHLY } from '../../../services/manager';
import { GRID, MonthRow } from './Components/MonthRow';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const SCHED_DAYS = 26;
const MOCK_MONTH = '2026-05';

function monthKey(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthComponents(offset: number): { m: number; y: number } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return { m: d.getMonth() + 1, y: d.getFullYear() };
}

function pct(a: number, b: number) { return b === 0 ? 0 : Math.round(a / b * 100); }

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

function MgrRosterMonthSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={1} style={{ flex: 1 }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} style={{ marginBottom: 8 }} />
      ))}
    </div>
  );
}

export function MgrRosterMonth({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const [monthOffset, setMonthOffset] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (isLoading) return <MgrRosterMonthSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const hasData = monthKey(monthOffset) === MOCK_MONTH;
  const rows = (hasData ? MONTHLY : []).filter(r =>
    activeStore === 'all' || r.store === activeStore
  );

  const totalStaff    = rows.length;
  const totalLate     = rows.reduce((s, r) => s + r.late, 0);
  const totalAbsent   = rows.reduce((s, r) => s + r.absent, 0);
  const avgAttendance = rows.length === 0 ? 0
    : Math.round(rows.reduce((s, r) => s + pct(r.workedDays, r.schedDays), 0) / rows.length);

  const { m, y } = monthComponents(monthOffset);

  const COLS = [
    t('manager.roster.month.col.staff'),
    t('manager.roster.month.col.role'),
    t('manager.roster.month.col.attendance'),
    t('manager.roster.month.col.ontime'),
    t('manager.roster.month.col.late'),
    t('manager.roster.month.col.absent'),
    t('manager.roster.month.col.overtime'),
    '',
  ];

  return (
    <div style={{ animation: 'fadeUp 350ms ease both' }}>
      {/* Glass month navigator */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '5px 6px', ...glass, borderRadius: 10, marginBottom: 20 }}>
        <button onClick={() => setMonthOffset(o => o - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={13} strokeWidth={1.75} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1E2D3D', textAlign: 'center', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', padding: '0 4px' }}>
          {t('manager.roster.month.label', { m, y })}
          {monthOffset === 0 && <span style={{ color: '#00B4A0', fontWeight: 500 }}> · {t('manager.roster.month.thisMonth')}</span>}
        </span>
        <button onClick={() => setMonthOffset(o => o + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={14} strokeWidth={1.75} />
        </button>
      </div>

      {/* Glass summary stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatTile
          icon={<Users size={17} color="#1E2D3D" strokeWidth={1.75} />}
          iconBg="rgba(30,45,61,0.1)" color="#1E2D3D"
          label={t('manager.roster.month.stat.staff')} value={totalStaff.toString()}
          sub={t('manager.roster.month.stat.staffSub', { count: SCHED_DAYS })}
        />
        <StatTile
          icon={<Check size={17} color="#00B4A0" strokeWidth={1.75} />}
          iconBg="rgba(0,180,160,0.12)" color="#00B4A0"
          label={t('manager.roster.month.stat.attendance')} value={`${avgAttendance}%`}
          sub={avgAttendance >= 90 ? t('manager.roster.month.stat.onTarget') : t('manager.roster.month.stat.needsWork')}
          valueColor={avgAttendance >= 90 ? '#00B4A0' : '#F59E0B'}
        />
        <StatTile
          icon={<Clock size={17} color="#F59E0B" strokeWidth={1.75} />}
          iconBg="rgba(245,158,11,0.12)" color="#F59E0B"
          label={t('manager.roster.month.stat.late')} value={totalLate.toString()}
          sub={t('manager.roster.month.stat.lateSub')} valueColor="#F59E0B"
        />
        <StatTile
          icon={<AlertTriangle size={17} color="#DC2626" strokeWidth={1.75} />}
          iconBg="rgba(220,38,38,0.10)" color="#DC2626"
          label={t('manager.roster.month.stat.absent')} value={totalAbsent.toString()}
          sub={t('manager.roster.month.stat.absentSub')} valueColor="#DC2626"
        />
      </div>

      {/* Glass table */}
      <div style={{ ...glass, borderRadius: 14, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 460px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID, padding: '11px 24px', borderBottom: '1px solid rgba(200,212,220,0.3)', background: 'rgba(247,249,250,0.97)', alignItems: 'center', position: 'sticky', top: 0, zIndex: 2 }}>
          {COLS.map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <ClipboardList size={40} color="#C8D4DC" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', marginBottom: 6 }}>{t('manager.roster.month.empty.title')}</div>
            <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('manager.roster.month.empty.sub')}</div>
          </div>
        ) : (
          rows.map((row, i) => {
            const key = `${row.larkUserId}-${row.store}`;
            return (
              <MonthRow
                key={key}
                row={row}
                borderTop={i > 0}
                expanded={expandedKey === key}
                onToggle={() => setExpandedKey(k => k === key ? null : key)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function StatTile({ icon, iconBg, color, label, value, sub, valueColor }: {
  icon: React.ReactNode; iconBg: string; color: string;
  label: string; value: string; sub: string; valueColor?: string;
}) {
  return (
    <div style={{
      ...glass, borderRadius: 14, padding: '20px 22px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: valueColor ?? color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7E8E', marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 3 }}>{sub}</div>
    </div>
  );
}
