import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useParams, useNavigate } from 'react-router';
import { ThemeCtx } from '../../components/UI';
import { Icons } from '../../components/Icons';
import {
  FIN_PERIOD, FIN_HISTORY, FIN_LOCS,
  PAYROLL_RAW_DATA, computePayroll, computeSummary, computeByLoc,
  type PayrollRawEntry, fmtM,
} from '../../services/finance';
import candylioLogoDark from '../../public/candylio-logo-mark-dark.svg';
import { FinOverview } from './OverView/FinOverview';
import { FinPayroll } from './Payroll/FinPayroll';
import { FinAnalytics } from './Analystics/FinAnalytics';
import { FinHistory } from './History/FinHistory';
import { FinApprove } from './Approve/FinApprove';

const ChevR = Icons.chevR;
const Check = Icons.check;

type SectionId = 'overview' | 'payroll' | 'analytics' | 'history' | 'approve';
type PayrollLayout = 'split' | 'table' | 'cards';

const NAV_IDS: { id: SectionId; key: string; icon: keyof typeof Icons }[] = [
  { id: 'overview',  key: 'finance.nav.overview',  icon: 'grid'     },
  { id: 'payroll',   key: 'finance.nav.payroll',   icon: 'coins'    },
  { id: 'analytics', key: 'finance.nav.analytics', icon: 'signal'   },
  { id: 'history',   key: 'finance.nav.history',   icon: 'clock'    },
  { id: 'approve',   key: 'finance.nav.approve',   icon: 'check'    },
];

export function FinanceApp() {
  const { t } = useTranslation('finance');
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const active = (section as SectionId) || 'overview';

  const curNavKey = NAV_IDS.find(n => n.id === active)?.key;
  usePageTitle(curNavKey ? t(curNavKey) : undefined, t('finance.topbar.breadcrumbRoot'));

  const [rawData, setRawData] = useState<PayrollRawEntry[]>(PAYROLL_RAW_DATA);
  const [layout, setLayout] = useState<PayrollLayout>('split');
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const payroll = useMemo(() => computePayroll(rawData), [rawData]);
  const summary = useMemo(() => computeSummary(payroll), [payroll]);
  const byLoc   = useMemo(() => computeByLoc(payroll),   [payroll]);

  const onNav = (id: string) => navigate(`/finance/${id}`);

  const onReview = (id: string) => {
    setRawData(prev => prev.map(p => p.larkUserId === id ? { ...p, status: 'reviewed' } : p));
  };
  const onUnreview = (id: string) => {
    setRawData(prev => prev.map(p => p.larkUserId === id ? { ...p, status: 'pending' } : p));
  };

  const curNavLabel = curNavKey ? t(curNavKey) : '';

  const content: Record<SectionId, React.ReactNode> = {
    overview:  <FinOverview  summary={summary} byLoc={byLoc} period={FIN_PERIOD} onNav={onNav} isLoading={isLoading} error={error}/>,
    payroll:   <FinPayroll  payroll={payroll} summary={summary} byLoc={byLoc} finLocs={FIN_LOCS} layout={layout} onLayoutChange={setLayout} onReview={onReview} onUnreview={onUnreview} isLoading={isLoading} error={error}/>,
    analytics: <FinAnalytics payroll={payroll} summary={summary} byLoc={byLoc} finLocs={FIN_LOCS} isLoading={isLoading} error={error}/>,
    history:   <FinHistory   history={FIN_HISTORY} payroll={payroll} finLocs={FIN_LOCS} isLoading={isLoading} error={error}/>,
    approve:   <FinApprove   summary={summary} byLoc={byLoc} period={FIN_PERIOD} isLoading={isLoading} error={error}/>,
  };

  const themeValue = useMemo(() => ({ density: 'spacious' as const, accent: '#00B4A0' }), []);

  return (
    <ThemeCtx.Provider value={themeValue}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FA' }}>
        {/* Sidebar */}
        <aside style={{ width: 260, background: '#1E2D3D', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {/* Brand */}
          <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => navigate('/')}
              onMouseEnter={e => (e.currentTarget.style.color = '#C8D4DC')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,212,220,0.5)')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(200,212,220,0.5)', fontSize: 11.5, fontWeight: 600, padding: '0 0 14px', fontFamily: 'var(--font-display)', transition: 'color 150ms' }}
            >
              <ChevR size={12} stroke="currentColor" style={{ transform: 'scaleX(-1)' }} />
              {t('finance.sidebar.workspaceHub')}
            </button>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10}}>
              <div style={{ display: 'flex', alignItems: 'center'}}>
                <img src={candylioLogoDark} alt="Logo" style={{ height: 28}} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>{t('finance.sidebar.appName')}</div>
                <div style={{ fontSize: 12, color: '#6AB3E8', fontWeight: 500 }}>{t('finance.sidebar.subtitle')}</div>
              </div>
            </div>
          </div>

          {/* Period status card */}
          <div style={{ margin: '16px 14px 8px', padding: '14px 16px', background: summary.pending > 0 ? 'rgba(180,83,9,0.15)' : 'rgba(0,180,160,0.12)', borderRadius: 8, border: `1px solid ${summary.pending > 0 ? 'rgba(180,83,9,0.3)' : 'rgba(0,180,160,0.3)'}` }}>
            <div style={{ fontSize: 10, color: summary.pending > 0 ? '#F4B26E' : '#6AB3E8', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              {FIN_PERIOD.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>{fmtM(summary.total)}</div>
            <div style={{ fontSize: 11, color: summary.pending > 0 ? '#F4B26E' : '#7BE4D6', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {summary.pending > 0
                ? <><span style={{ width: 6, height: 6, borderRadius: 999, background: '#B45309', display: 'inline-block' }}/>{t('finance.sidebar.pendingCount', { count: summary.pending })}</>
                : <><Check size={11} stroke="#00B4A0"/> {t('finance.sidebar.readyToApprove')}</>}
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: '12px 10px 0', flex: 1 }}>
            {NAV_IDS.map(s => {
              const IconComp = Icons[s.icon];
              const isActive = s.id === active;
              const badge = s.id === 'payroll' ? t('finance.sidebar.reviewedBadge', { reviewed: summary.reviewed, staff: summary.staff }) : undefined;
              const warn = s.id === 'approve' && summary.pending > 0;
              return (
                <button key={s.id} onClick={() => onNav(s.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? '#00B4A0' : 'transparent', color: isActive ? '#fff' : '#C8D4DC', transition: 'background 150ms,color 150ms', marginBottom: 3 }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <IconComp size={16} stroke={isActive ? '#fff' : '#C8D4DC'}/>
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{t(s.key)}</span>
                  {badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', color: isActive ? '#fff' : '#C8D4DC', fontFamily: 'var(--font-display)' }}>{badge}</span>
                  )}
                  {warn && !isActive && <span style={{ width: 7, height: 7, borderRadius: 999, background: '#B45309', flexShrink: 0 }}/>}
                </button>
              );
            })}
          </div>

          {/* Footer user */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 999, background: '#7C4FBF', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>TC</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nguyễn Thanh Tùng</div>
                <div style={{ fontSize: 11, color: '#6AB3E8' }}>Kế toán trưởng · Finance</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <header style={{ background: '#fff', borderBottom: '1px solid #C8D4DC', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 48px', height: 68 }}>
              <div style={{ fontSize: 13, color: '#6B7E8E', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{t('finance.topbar.breadcrumbRoot')}</span>
                <ChevR size={12} stroke="#C8D4DC"/>
                <span style={{ color: '#1E2D3D', fontWeight: 600 }}>{curNavLabel}</span>
              </div>
              <div style={{ flex: 1 }}/>
              {summary.pending > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#FFF3E0', borderRadius: 6, border: '1px solid #F5E2A8', fontSize: 12, color: '#B45309', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: '#B45309' }}/>
                  {t('finance.topbar.pendingCount', { count: summary.pending })}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#F0FAF7', borderRadius: 6, border: '1px solid #A8E4DC', fontSize: 12, color: '#008C7C', fontWeight: 700 }}>
                {fmtM(summary.total)}
              </div>
              <button onClick={() => onNav('approve')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#00B4A0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, transition: 'background 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#008C7C'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#00B4A0'; }}>
                <Check size={13} stroke="#fff"/>{t('finance.topbar.approvePayroll')}
              </button>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: '48px 56px' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              {content[active] ?? content.overview}
            </div>
          </main>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid #E8ECEF', background: '#fff', padding: '16px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6B7E8E' }}>
            <span>{t('finance.footer.credit', { period: FIN_PERIOD.label })}</span>
            <span>{t('finance.footer.lockDate', { date: FIN_PERIOD.lockDate })}</span>
          </footer>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
