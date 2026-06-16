import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Card, Tag, Btn, Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { type FinSummary, type FinByLoc, type FinPeriod, fmtVND, fmtM } from '../../../services/finance';

interface Props {
  summary: FinSummary;
  byLoc: FinByLoc[];
  period: FinPeriod;
  onNav: (s: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FinOverview({ summary, byLoc, period, onNav, isLoading, error }: Props) {
  const { t } = useTranslation('finance');

  if (isLoading) return <FinOverviewSkeleton />;
  if (error) return <ErrorBanner message={error} />;
  if (!summary || !byLoc || !period) return null;

  const maxLoc = byLoc.length > 0 ? Math.max(...byLoc.map(l => l.total)) : 0;

  const donut = [
    { labelKey: 'finance.overview.donut.fixedMonthly', val: summary.monthly, color: '#7C4FBF' },
    { labelKey: 'finance.overview.donut.regularHourly', val: summary.hourly,  color: '#00B4A0' },
    { labelKey: 'finance.overview.donut.overtime',      val: summary.ot,      color: '#B45309' },
  ];
  const donutPcts = donut.map(d => ({ ...d, pct: summary.total > 0 ? d.val / summary.total * 100 : 0 }));
  let cum = 0;
  const conicParts = donutPcts.map(d => {
    const r = `${d.color} ${cum.toFixed(1)}deg ${(cum + d.pct * 3.6).toFixed(1)}deg`;
    cum += d.pct * 3.6;
    return r;
  }).join(', ');

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 8 }}>{t('finance.overview.eyebrow')}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{t('finance.overview.title')}</h1>
          <span style={{ fontSize: 17, color: '#6B7E8E', fontWeight: 500 }}>{t('finance.overview.periodRange', { start: period.start, end: period.end })}</span>
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        <Card style={{ padding: 22, background: '#1E2D3D', borderColor: '#1E2D3D' }}>
          <div style={{ fontSize: 11, color: '#6AB3E8', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 12 }}>{t('finance.overview.card.totalLabel')}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#fff' }}>{fmtVND(summary.total)}</div>
          <div style={{ fontSize: 12, color: '#C8D4DC', marginTop: 8 }}>{t('finance.overview.card.staffCount', { count: summary.staff })}</div>
        </Card>
        {[
          { labelKey: 'finance.overview.card.fixedMonthly',   val: fmtM(summary.monthly), sub: t('finance.overview.card.pctOfFund', { pct: Math.round(summary.monthly / summary.total * 100) }), color: '#7C4FBF' },
          { labelKey: 'finance.overview.card.regularHourly',  val: fmtM(summary.hourly),  sub: t('finance.overview.card.pctOfFund', { pct: Math.round(summary.hourly  / summary.total * 100) }), color: '#00B4A0' },
          { labelKey: 'finance.overview.card.overtimeCost',   val: fmtM(summary.ot),      sub: t('finance.overview.card.otCount', { count: summary.otCount }),                                    color: '#B45309' },
        ].map((c, i) => (
          <Card key={i} style={{ padding: 22 }}>
            <div style={{ fontSize: 11, color: '#6B7E8E', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 12 }}>{t(c.labelKey)}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: c.color }}>{c.val}</div>
            <div style={{ fontSize: 12, color: '#6B7E8E', marginTop: 8 }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Cost by location */}
        <Card>
          <Eyebrow style={{ marginBottom: 6 }}>{t('finance.overview.byLoc.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', marginBottom: 24, marginTop: 4 }}>{t('finance.overview.byLoc.title')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {byLoc.map(l => (
              <div key={l.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }}/>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D' }}>{l.name}</span>
                    <span style={{ fontSize: 11, color: '#6B7E8E' }}>{t('finance.overview.byLoc.staffReviewed', { count: l.count, reviewed: l.reviewed })}</span>
                    {l.reviewed < l.count && <Tag tone="warning">{t('finance.overview.byLoc.waiting')}</Tag>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#1E2D3D' }}>{fmtM(l.total)}</span>
                </div>
                <div style={{ height: 12, background: '#F0F3F5', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${maxLoc > 0 ? l.total / maxLoc * 100 : 0}%`, background: l.color, borderRadius: 999, transition: 'width 600ms cubic-bezier(0.2,0.7,0.2,1)' }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Donut — pay type breakdown */}
        <Card>
          <Eyebrow style={{ marginBottom: 6 }}>{t('finance.overview.donut.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', marginBottom: 20, marginTop: 4 }}>{t('finance.overview.donut.title')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${conicParts})` }}/>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: '#6B7E8E', fontWeight: 600 }}>{t('finance.overview.donut.totalLabel')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', marginTop: 2 }}>{fmtM(summary.total)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {donutPcts.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0, marginTop: 2 }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{t(d.labelKey)}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: d.color }}>{d.pct.toFixed(1)}%</span>
                      <span style={{ fontSize: 11, color: '#6B7E8E' }}>{fmtM(d.val)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick action CTA */}
      <Card style={{ background: 'linear-gradient(135deg,#1E2D3D 0%,#2A3B4D 100%)', borderColor: '#1E2D3D', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6AB3E8', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t('finance.overview.cta.eyebrow')}</div>
            {summary.pending > 0 ? (
              <>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{t('finance.overview.cta.pendingTitle', { count: summary.pending })}</h3>
                <p style={{ fontSize: 13, color: '#A8B5C0', margin: 0 }}>{t('finance.overview.cta.pendingBody', { lockDate: period.lockDate })}</p>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{t('finance.overview.cta.allReviewedTitle', { count: summary.staff })}</h3>
                <p style={{ fontSize: 13, color: '#A8B5C0', margin: 0 }}>{t('finance.overview.cta.allReviewedBody', { lockDate: period.lockDate })}</p>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" onClick={() => onNav('payroll')} style={{ background: 'rgba(255,255,255,0.07)', color: '#fff' }}>{t('finance.overview.cta.viewPayroll')}</Btn>
            <Btn variant="primary" onClick={() => onNav('approve')} icon={<Icons.check size={14}/>}>{t('finance.overview.cta.doApprove')}</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FinOverviewSkeleton() {
  return (
    <div>
      <Skeleton h={14} w={240} style={{ marginBottom: 12 }} />
      <Skeleton h={36} w={360} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 32 }}>
        <SkeletonCard lines={6} />
        <SkeletonCard lines={4} />
      </div>
      <SkeletonCard lines={2} />
    </div>
  );
}
