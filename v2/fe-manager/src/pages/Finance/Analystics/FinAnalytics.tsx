import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Card, Tag, Avatar, Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { type PayrollEntry, type FinSummary, type FinByLoc, type FinLoc, fmtVND, fmtM } from '../../../services/finance';

interface Props {
  payroll: PayrollEntry[];
  summary: FinSummary;
  byLoc: FinByLoc[];
  finLocs: FinLoc[];
  isLoading?: boolean;
  error?: string | null;
}

export function FinAnalytics({ payroll, summary, byLoc, finLocs, isLoading, error }: Props) {
  const { t } = useTranslation('finance');

  if (isLoading) return <FinAnalyticsSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const otStaff = (payroll ?? []).filter(p => p.otHours > 0).sort((a, b) => b.otHours - a.otHours);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 8 }}>{t('finance.analytics.eyebrow')}</Eyebrow>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{t('finance.analytics.title')}</h1>
      </div>

      {/* Location breakdown table */}
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E8ECEF' }}>
          <Eyebrow style={{ marginBottom: 4 }}>{t('finance.analytics.byLoc.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', margin: 0 }}>{t('finance.analytics.byLoc.title')}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 60px 110px 110px 90px 110px 100px', padding: '12px 24px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
          <span>{t('finance.analytics.byLoc.col.location')}</span><span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.staff')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.monthly')}</span><span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.hourly')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.ot')}</span><span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.total')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.byLoc.col.pct')}</span>
        </div>
        {(byLoc ?? []).map((l, i) => {
          const pct = (summary.total > 0 ? l.total / summary.total * 100 : 0).toFixed(1);
          const perHead = l.count > 0 ? Math.round(l.total / l.count) : 0;
          return (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 60px 110px 110px 90px 110px 100px', padding: '16px 24px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }}/>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#1E2D3D' }}>{l.name}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 3, marginLeft: 18 }}>{t('finance.analytics.byLoc.perHead', { amount: fmtM(perHead) })}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#1E2D3D' }}>{l.count}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#7C4FBF' }}>{l.monthly > 0 ? fmtM(l.monthly) : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#008C7C' }}>{l.hourly > 0 ? fmtM(l.hourly) : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: l.ot > 0 ? '#B45309' : '#C8D4DC' }}>{l.ot > 0 ? fmtM(l.ot) : '—'}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1E2D3D' }}>{fmtM(l.total)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1E2D3D' }}>{pct}%</span>
                <div style={{ width: 64, height: 5, background: '#F0F3F5', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: l.color, borderRadius: 999 }}/>
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* OT exceptions */}
      <Card pad={false}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E8ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Eyebrow color="#B45309" style={{ marginBottom: 4 }}>{t('finance.analytics.ot.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', margin: 0 }}>{t('finance.analytics.ot.title', { count: otStaff.length })}</h3>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#B45309' }}>
            {fmtVND(summary.ot)} <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7E8E' }}>{t('finance.analytics.ot.totalLabel')}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 80px 80px 110px 110px 80px', padding: '12px 24px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
          <span>{t('finance.analytics.ot.col.employee')}</span><span>{t('finance.analytics.ot.col.otRole')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.ot.col.otHours')}</span><span style={{ textAlign: 'right' }}>{t('finance.analytics.ot.col.regHours')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.ot.col.otCost')}</span><span style={{ textAlign: 'right' }}>{t('finance.analytics.ot.col.pctSalary')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.analytics.ot.col.level')}</span>
        </div>
        {otStaff.map((s, i) => {
          const loc = finLocs.find(l => l.id === s.loc);
          const otPct = (s.total > 0 ? s.totalOT / s.total * 100 : 0).toFixed(1);
          const flag = s.otHours >= 12;
          return (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 80px 80px 110px 110px 80px', padding: '15px 24px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center', background: flag ? '#FFF9F0' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={s.name} size={28} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10 }}>{s.code}</span><span>·</span>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: loc?.color ?? '#ccc', display: 'inline-block' }}/>{loc?.short ?? '?'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {s.items.filter(it => (it.otH ?? 0) > 0).map((it, ii) => (
                  <span key={ii} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: it.color + '15', color: it.color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{it.name}</span>
                ))}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#B45309' }}>{s.otHours}h</div>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#6B7E8E' }}>{s.totalHours - s.otHours}h</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#B45309' }}>{fmtVND(s.totalOT)}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#B45309', fontWeight: 600 }}>{otPct}%</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {flag ? <Tag tone="danger">{t('finance.analytics.ot.flagHigh')}</Tag> : <Tag tone="warning">{t('finance.analytics.ot.flagNormal')}</Tag>}
              </div>
            </div>
          );
        })}
        {otStaff.length === 0 && (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: '#6B7E8E', fontSize: 14 }}>
            {t('finance.analytics.ot.empty')}
          </div>
        )}
        <div style={{ padding: '14px 24px', background: '#FFF9F0', borderTop: '1px solid #F0E0C0', fontSize: 12, color: '#B45309', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icons.clock size={14} stroke="#B45309"/>
          {t('finance.analytics.ot.warning')}
        </div>
      </Card>
    </div>
  );
}

function FinAnalyticsSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={280} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <SkeletonCard lines={5} style={{ height: 280 }} />
        <SkeletonCard lines={5} style={{ height: 280 }} />
      </div>
      <SkeletonCard lines={4} />
    </div>
  );
}
