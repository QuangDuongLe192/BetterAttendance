import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';

import { getWeek, weekRangeLabel } from './Components/weekUtils';
import { WeekGrid } from './Components/WeekGrid';

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

function MgrRosterWeekSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={320} style={{ marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} h={24} w={80} />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} style={{ marginBottom: 8 }} />
      ))}
    </div>
  );
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

export function MgrRosterWeek({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const [weekOffset, setWeekOffset] = useState(0);
  const week = getWeek(weekOffset);

  const LEGEND = [
    { bg: '#E6F9F7', dot: '#00B4A0', label: t('manager.roster.week.legend.ontime') },
    { bg: '#FEF3C7', dot: '#F59E0B', label: t('manager.roster.week.legend.late') },
    { bg: '#FEF2F2', dot: '#DC2626', label: t('manager.roster.week.legend.absent') },
    { bg: '#EDE9FE', dot: '#6366F1', label: t('manager.roster.week.legend.overtime') },
    { bg: 'transparent', dot: '#9BAAB5', label: t('manager.roster.week.legend.upcoming'), dashed: true },
  ];

  if (isLoading) return <MgrRosterWeekSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div style={{ animation: 'fadeUp 350ms ease both' }}>
      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', ...glass, borderRadius: 15, userSelect: 'none' }}>
          <button onClick={() => setWeekOffset(o => o - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
            <Icons.chevR size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span style={{ fontSize: 12, color: '#3A4F63', minWidth: 130, textAlign: 'center', fontWeight: 600 }}>
            {weekRangeLabel(week)}
            {weekOffset === 0 && <span style={{ color: '#00B4A0' }}> · {t('manager.roster.week.thisWeek')}</span>}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
            <Icons.chevR size={14} />
          </button>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 15, boxShadow: '0 2px 8px rgba(30,45,61,0.06)', flexShrink: 0 }}>
          {LEGEND.map(({ bg, dot, label, dashed }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 22, height: 10, borderRadius: 3, background: bg, border: dashed ? `1px dashed ${dot}` : `1.5px solid ${dot}55`, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#6B7E8E', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 15, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3A4F63', ...glass, border: '1px solid rgba(200,212,220,0.4)' }}>
          <Icons.download size={14} stroke="#6B7E8E" /> {t('manager.roster.week.exportCsv')}
        </button>
      </div>

      <WeekGrid week={week} activeStore={activeStore} />
    </div>
  );
}
