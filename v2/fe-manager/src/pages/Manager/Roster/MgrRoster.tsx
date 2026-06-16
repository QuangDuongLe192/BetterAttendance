import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { TODAY_ROSTER } from '../../../services/manager';
import { fmtShort, TODAY_FULL } from './Components/weekUtils';
import { DateNav } from './Components/DateNav';
import { RosterRow } from './Components/RosterRow';
import { ClipboardList } from 'lucide-react';

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

export function MgrRoster({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(TODAY_FULL);

  if (isLoading) return <MgrRosterSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const isToday = selectedDate === TODAY_FULL;

  const roster = isToday
    ? (TODAY_ROSTER ?? []).filter(r => activeStore === 'all' || r.locationId === activeStore)
    : [];
  const filtered = roster.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const counts: Record<string, number> = {
    in:       roster.filter(r => r.status === 'in').length,
    late:     roster.filter(r => r.status === 'late').length,
    absent:   roster.filter(r => r.status === 'absent').length,
    upcoming: roster.filter(r => r.status === 'upcoming').length,
  };

  const COLS = [
    t('manager.roster.daily.column.staff'),
    t('manager.roster.daily.column.role'),
    t('manager.roster.daily.column.shift'),
    t('manager.roster.daily.column.clockIn'),
    t('manager.roster.daily.column.clockOut'),
    t('manager.roster.daily.column.status'),
  ];

  return (
    <div style={{ animation: 'fadeUp 350ms ease both' }}>
      {/* Toolbar: dropdown + date picker + export */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <DateNav selectedDate={selectedDate} onSelect={setSelectedDate} />
        <StatusDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
          total={roster.length}
        />
        <div style={{ flex: 1 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 15, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3A4F63', ...glass, border: '1px solid rgba(200,212,220,0.4)' }}>
          <Icons.download size={14} stroke="#6B7E8E" /> {t('manager.roster.daily.exportCsv')}
        </button>
      </div>

      {/* Table card */}
      <div style={{ ...glass, borderRadius: 14, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', padding: '12px 20px', borderBottom: '1px solid rgba(200,212,220,0.3)', background: 'rgba(247,249,250,0.97)', position: 'sticky', top: 0, zIndex: 2 }}>
          {COLS.map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {filtered.map((entry, i) => (
          <RosterRow key={i} entry={entry} borderTop={i > 0} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <ClipboardList size={40} color="#C8D4DC" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', marginBottom: 6 }}>
              {isToday ? t('manager.roster.daily.empty.today') : t('manager.roster.daily.empty.past')}
            </div>
            <div style={{ fontSize: 13, color: '#9BAAB5' }}>
              {isToday ? t('manager.roster.daily.empty.todaySub') : t('manager.roster.daily.empty.pastSub', { date: fmtShort(selectedDate) })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDropdown({ value, onChange, counts, total }: {
  value: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
  total: number;
}) {
  const { t } = useTranslation('manager');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const STATUS_FILTERS: { id: string; label: string; color?: string }[] = [
    { id: 'all',      label: t('manager.roster.daily.filter.all') },
    { id: 'in',       label: t('manager.roster.daily.filter.in'),       color: '#00B4A0' },
    { id: 'late',     label: t('manager.roster.daily.filter.late'),     color: '#F59E0B' },
    { id: 'absent',   label: t('manager.roster.daily.filter.absent'),   color: '#DC2626' },
    { id: 'upcoming', label: t('manager.roster.daily.filter.upcoming'), color: '#9BAAB5' },
  ];

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const current = STATUS_FILTERS.find(f => f.id === value) ?? STATUS_FILTERS[0];
  const currentCount = value === 'all' ? total : (counts[value] ?? 0);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 12px', borderRadius: 15, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          color: '#1E2D3D', ...glass,
          transition: 'all 150ms',
        }}
      >
        {current.color && (
          <span style={{ width: 8, height: 8, borderRadius: 999, background: current.color, flexShrink: 0 }} />
        )}
        {current.label}
        <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: 'rgba(200,212,220,0.3)', color: '#6B7E8E' }}>
          {currentCount}
        </span>
        <Icons.chevR size={12} stroke="#9BAAB5" style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 150ms' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,212,220,0.4)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(30,45,61,0.12)', overflow: 'hidden', minWidth: 160,
        }}>
          {STATUS_FILTERS.map(({ id, label, color }, i) => {
            const count = id === 'all' ? total : (counts[id] ?? 0);
            const active = id === value;
            return (
              <button
                key={id}
                onClick={() => { onChange(id); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 14px', border: 'none',
                  borderTop: i > 0 ? '1px solid rgba(200,212,220,0.25)' : 'none',
                  background: active ? 'rgba(0,180,160,0.06)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(247,249,250,0.9)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(0,180,160,0.06)' : 'transparent'; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: color ?? '#C8D4DC', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#00897B' : '#1E2D3D', flex: 1 }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9BAAB5' }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MgrRosterSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={280} style={{ marginBottom: 24 }} />
      <SkeletonCard lines={2} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
