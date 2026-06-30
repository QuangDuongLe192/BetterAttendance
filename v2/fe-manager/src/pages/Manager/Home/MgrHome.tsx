import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { NOW, STORE_TODAY, APPROVALS, MGR_ACTIVITY, fmtHHMM } from '../../../services/manager';
import { locById } from '../../../services/setup';
import type { ActivityEntry } from '../../../services/manager';
import { TodayTimeline } from './Components/TodayTimeline';
import { ApprovalCard } from './Components/ApprovalCard';
import { AuditLogDrawer } from './Components/AuditLogDrawer';
import { useAuth } from '../../../stores/AuthContext';

const ArrowR = Icons.arrowR;
const Check = Icons.check;
const Clock = Icons.clock;

const ACT_PAGE_SIZE = 5;

interface Props {
  activeStore: string;
  isLoading?: boolean;
  error?: string | null;
  handled?: Record<string, 'approved' | 'rejected'>;
  approve?: (id: string) => void;
  openDetail?: (id: string, rejectMode?: boolean) => void;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const KPI_TILES = [
  { key: 'scheduled', tKey: 'manager.home.kpi.scheduled', color: '#1E2D3D', icon: 'calendar'  as const },
  { key: 'present',   tKey: 'manager.home.kpi.present',   color: '#00B4A0', icon: 'check'     as const },
  { key: 'late',      tKey: 'manager.home.kpi.late',      color: '#F59E0B', icon: 'alert'     as const },
  { key: 'absent',    tKey: 'manager.home.kpi.absent',    color: '#DC2626', icon: 'x'         as const },
  { key: 'overtime',  tKey: 'manager.home.kpi.overtime',  color: '#6366F1', icon: 'clock'     as const },
] as const;

export function MgrHome({ activeStore, isLoading, error, handled = {}, approve = () => {}, openDetail = () => {} }: Readonly<Props>) {
  const { t } = useTranslation('manager');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actPage, setActPage] = useState(0);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => { setActPage(0); }, [activeStore]);

  if (isLoading) return <MgrHomeSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const store = activeStore === 'all'
    ? { name: t('manager.sidebar.store.all') }
    : (locById(activeStore) ?? { name: activeStore });

  const sd = (() => {
    if (activeStore !== 'all') return STORE_TODAY[activeStore];
    const stores = Object.values(STORE_TODAY);
    return {
      scheduled:        stores.reduce((n, s) => n + s.scheduled, 0),
      present:          stores.reduce((n, s) => n + s.present, 0),
      late:             stores.reduce((n, s) => n + s.late, 0),
      absent:           stores.reduce((n, s) => n + s.absent, 0),
      overtime:         stores.reduce((n, s) => n + s.overtime, 0),
      openShifts:       stores.reduce((n, s) => n + s.openShifts, 0),
      laborCostToday:   stores.reduce((n, s) => n + s.laborCostToday, 0),
      laborBudgetToday: stores.reduce((n, s) => n + s.laborBudgetToday, 0),
      laborCostMonth:   stores.reduce((n, s) => n + s.laborCostMonth, 0),
      laborBudgetMonth: stores.reduce((n, s) => n + s.laborBudgetMonth, 0),
      pulse: 'on-track' as const,
    };
  })();

  const actFiltered = activeStore === 'all'
    ? MGR_ACTIVITY
    : MGR_ACTIVITY.filter(a => a.locationId === activeStore);
  const actSlice = actFiltered.slice(actPage * ACT_PAGE_SIZE, (actPage + 1) * ACT_PAGE_SIZE);

  return (
    <div style={{
      margin: '-36px -40px -80px', padding: '36px 40px 80px',
      position: 'relative', minHeight: 'calc(100vh - 68px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .act-row:hover { background: rgba(0,180,160,0.03) !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: 'fadeUp 350ms ease both' }}>
          <Eyebrow style={{ marginBottom: 8 }}>{t('manager.home.eyebrow', { dayLabel: NOW.dayLabel })}</Eyebrow>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 8px' }}>
            {t('manager.home.greeting', { name: user?.name.split(' ').pop() })}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7E8E', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00B4A0', display: 'inline-block' }} />
              <span style={{ fontWeight: 600, color: '#00897B' }}>{store.name}</span>
            </span>
            <span style={{ color: '#C8D4DC' }}>—</span>
            {t('manager.home.subtitle')}
          </p>
        </div>

        {/* KPI tiles */}
        {sd && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
            {KPI_TILES.map((tile, i) => {
              const IconComp = Icons[tile.icon];
              const value = sd[tile.key];
              return (
                <div key={tile.key} style={{
                  ...glass, borderRadius: 14, padding: '20px 22px',
                  borderTop: `3px solid ${tile.color}`,
                  animation: `fadeUp ${350 + i * 55}ms ease both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tile.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={17} stroke={tile.color} />
                    </div>
                  </div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: tile.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7E8E', marginTop: 6 }}>{t(tile.tKey)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline */}
        <div style={{ ...glass, borderRadius: 14, overflow: 'hidden', marginBottom: 20, animation: 'fadeUp 560ms ease both' }}>
          <TodayTimeline activeStore={activeStore} />
        </div>

        {/* Approvals + Activity — side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, animation: 'fadeUp 620ms ease both' }}>

          {/* Approval queue */}
          <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(200,212,220,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, background: 'rgba(247,249,250,0.5)' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {t('manager.home.approvals.eyebrow')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.01em' }}>
                  {t('manager.home.approvals.title')}
                </div>
              </div>
              <button onClick={() => navigate(`/manager/approvals/${activeStore}`)} style={{ fontSize: 13, color: '#00B4A0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', paddingTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                {t('manager.home.approvals.viewAll')} <ArrowR size={13} stroke="#00B4A0" />
              </button>
            </div>
            {(APPROVALS ?? []).slice(0, 4).map(a => (
              <ApprovalCard key={a.id} approval={a} handled={handled[a.id]} approve={approve} openDetail={openDetail} />
            ))}
            {(APPROVALS ?? []).length === 0 && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,180,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Check size={20} stroke="#00B4A0" />
                </div>
                <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('manager.home.approvals.empty')}</div>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div style={{ ...glass, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(200,212,220,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, background: 'rgba(247,249,250,0.5)', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {t('manager.home.activity.eyebrow')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.01em' }}>
                  {t('manager.home.activity.title')}
                </div>
              </div>
              <button onClick={() => setAuditOpen(true)} style={{ fontSize: 13, color: '#00B4A0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', paddingTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                {t('manager.home.activity.history')} <ArrowR size={13} stroke="#00B4A0" />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              {actSlice.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,180,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Clock size={18} stroke="#00B4A0" />
                  </div>
                  <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('manager.home.activity.empty')}</div>
                </div>
              ) : actSlice.map((a, i) => (
                <ActivityRow key={i} entry={a} borderTop={i > 0} />
              ))}
            </div>

            {actFiltered.length > ACT_PAGE_SIZE && (
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(200,212,220,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(247,249,250,0.5)', flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#9BAAB5' }}>
                  {actPage * ACT_PAGE_SIZE + 1}–{Math.min((actPage + 1) * ACT_PAGE_SIZE, actFiltered.length)} / {actFiltered.length}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <PgBtn onClick={() => setActPage(p => p - 1)} disabled={actPage === 0}>‹</PgBtn>
                  <PgBtn onClick={() => setActPage(p => p + 1)} disabled={(actPage + 1) * ACT_PAGE_SIZE >= actFiltered.length}>›</PgBtn>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <AuditLogDrawer open={auditOpen} onClose={() => setAuditOpen(false)} activeStore={activeStore} />
    </div>
  );
}

function ActivityRow({ entry, borderTop }: Readonly<{ entry: ActivityEntry; borderTop: boolean }>) {
  const dotColor = entry.event.includes('late') ? '#F59E0B'
    : entry.type === 'request' ? '#8B5CF6'
    : '#00B4A0';
  return (
    <div className="act-row" style={{
      padding: '12px 18px',
      borderTop: borderTop ? '1px solid rgba(200,212,220,0.25)' : 'none',
      transition: 'background 100ms',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: '#9BAAB5', width: 36, flexShrink: 0, lineHeight: 1.6 }}>
          {fmtHHMM(entry.t)}
        </span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 5 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', lineHeight: 1.4 }}>{entry.actor.name}</div>
          <div style={{ fontSize: 12, color: '#6B7E8E', marginTop: 2 }}>{entry.target}</div>
        </div>
      </div>
    </div>
  );
}

function PgBtn({ children, onClick, disabled }: Readonly<{ children: React.ReactNode; onClick: () => void; disabled?: boolean }>) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 26, height: 26, borderRadius: 6, fontSize: 14,
      border: '1px solid rgba(200,212,220,0.5)',
      background: disabled ? 'transparent' : 'rgba(255,255,255,0.6)',
      color: disabled ? '#C8D4DC' : '#3A4F63',
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      {children}
    </button>
  );
}

function MgrHomeSkeleton() {
  return (
    <div>
      <Skeleton h={14} w={140} style={{ marginBottom: 12 }} />
      <Skeleton h={36} w={320} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
      </div>
      <SkeletonCard lines={2} style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
