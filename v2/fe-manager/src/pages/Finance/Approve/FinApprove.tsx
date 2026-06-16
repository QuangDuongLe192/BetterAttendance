import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Card, Tag, Btn, Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { type FinSummary, type FinByLoc, type FinPeriod, fmtVND } from '../../../services/finance';

interface Props {
  summary: FinSummary;
  byLoc: FinByLoc[];
  period: FinPeriod;
  isLoading?: boolean;
  error?: string | null;
}

export function FinApprove({ summary, byLoc, period, isLoading, error }: Props) {
  const { t } = useTranslation('finance');
  const [approved, setApproved] = useState(false);

  if (isLoading) return <FinApproveSkeleton />;
  if (error) return <ErrorBanner message={error} />;
  if (!summary || !byLoc || !period) return null;

  const canApprove = summary.pending === 0;

  if (approved) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: '#F0FAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.check size={36} stroke="#1A6B55" sw={2}/>
      </div>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.01em', marginBottom: 8 }}>{t('finance.approve.done.title')}</h2>
        <p style={{ fontSize: 15, color: '#3A4F63', marginBottom: 0 }}>{t('finance.approve.done.subtitle', { period: period.label, total: fmtVND(summary.total), count: summary.staff })}</p>
        <p style={{ fontSize: 13, color: '#6B7E8E', marginTop: 6 }}>
          {t('finance.approve.done.lockedAt', {
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('vi-VN'),
          })}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" icon={<Icons.download size={14}/>}>{t('finance.approve.done.exportCsvBtn')}</Btn>
        <Btn variant="primary" icon={<Icons.download size={14}/>}>{t('finance.approve.done.exportMisaBtn')}</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 8 }}>{t('finance.approve.eyebrow')}</Eyebrow>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{t('finance.approve.title', { period: period.label })}</h1>
      </div>

      {/* Period summary dark card */}
      <Card style={{ background: '#1E2D3D', borderColor: '#1E2D3D', marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: 'none' }}>
          {[
            { label: t('finance.approve.summary.period'),   val: t('finance.approve.summary.periodVal', { start: period.start.slice(0, 5), end: period.end }), sub: period.label },
            { label: t('finance.approve.summary.total'),    val: fmtVND(summary.total), sub: t('finance.approve.summary.staffCount', { count: summary.staff }), big: true },
            { label: t('finance.approve.summary.reviewed'), val: `${summary.reviewed}/${summary.staff}`, sub: canApprove ? t('finance.approve.summary.done') : t('finance.approve.summary.remaining', { count: summary.pending }), warn: !canApprove },
            { label: t('finance.approve.summary.lockDate'), val: period.lockDate, sub: t('finance.approve.summary.lockDeadline') },
          ].map((c, i) => (
            <div key={i} style={{ padding: '22px 24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontSize: 11, color: '#6AB3E8', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: c.big ? 20 : 17, color: c.warn ? '#F4B26E' : '#fff', letterSpacing: '-0.01em' }}>{c.val}</div>
              <div style={{ fontSize: 11, color: c.warn ? '#F4B26E' : '#C8D4DC', marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Review checklist */}
        <Card>
          <Eyebrow style={{ marginBottom: 6 }}>{t('finance.approve.checklist.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', marginBottom: 20, marginTop: 4 }}>{t('finance.approve.checklist.title')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byLoc.map(l => {
              const allDone = l.reviewed === l.count;
              return (
                <div key={l.id} style={{ padding: '14px 16px', borderRadius: 8, border: `1px solid ${allDone ? '#A8E4DC' : '#F5E2A8'}`, background: allDone ? '#F0FAF7' : '#FFF9F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: allDone ? 0 : 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }}/>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{l.name}</span>
                    </div>
                    {allDone
                      ? <Tag tone="success" icon={<Icons.check size={10}/>}>{t('finance.approve.checklist.allDone', { count: l.count })}</Tag>
                      : <Tag tone="warning">{t('finance.approve.checklist.partial', { reviewed: l.reviewed, count: l.count })}</Tag>}
                  </div>
                  {!allDone && (
                    <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {l.staff.filter(p => p.status === 'pending').map(p => (
                        <div key={p.id} style={{ fontSize: 12, color: '#B45309', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 999, background: '#B45309', flexShrink: 0 }}/>
                          {p.name} <span style={{ fontSize: 10, color: '#6B7E8E' }}>{p.code}</span>
                          <span style={{ color: '#6B7E8E' }}>·</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{fmtVND(p.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!canApprove && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#FFF3E0', borderRadius: 8, fontSize: 13, color: '#B45309', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icons.clock size={16} stroke="#B45309" style={{ flexShrink: 0, marginTop: 1 }}/>
              {t('finance.approve.checklist.pendingWarning', { count: summary.pending })}
            </div>
          )}
        </Card>

        {/* Export formats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: 'download' as const, titleKey: 'finance.approve.export.csvTitle',  enKey: 'finance.approve.export.csvEn',  descKey: 'finance.approve.export.csvDesc',  btnKey: 'finance.approve.export.csvBtn',  tone: 'secondary' as const },
            { icon: 'link'     as const, titleKey: 'finance.approve.export.misaTitle', enKey: 'finance.approve.export.misaEn', descKey: 'finance.approve.export.misaDesc', btnKey: 'finance.approve.export.misaBtn', tone: 'primary' as const },
            { icon: 'scroll'   as const, titleKey: 'finance.approve.export.pdfTitle',  enKey: 'finance.approve.export.pdfEn',  descKey: 'finance.approve.export.pdfDesc',  btnKey: 'finance.approve.export.pdfBtn',  tone: 'secondary' as const },
          ].map((f, i) => {
            const IconComp = Icons[f.icon];
            return (
              <div key={i} style={{ padding: '18px 20px', background: '#fff', border: '1px solid #E8ECEF', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 40, height: 40, borderRadius: 8, background: '#F7F9FA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={18} stroke="#00B4A0"/>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1E2D3D' }}>{t(f.titleKey)}</span>
                    <span style={{ fontSize: 11, color: '#6B7E8E' }}>{t(f.enKey)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7E8E', margin: 0, lineHeight: 1.5 }}>{t(f.descKey)}</p>
                </div>
                <Btn variant={f.tone} size="sm" icon={<Icons.download size={12}/>}>{t(f.btnKey)}</Btn>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve CTA */}
      <div style={{ padding: '28px 32px', background: canApprove ? '#1E2D3D' : '#F7F9FA', borderRadius: 12, border: `1px solid ${canApprove ? '#1E2D3D' : '#E8ECEF'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: canApprove ? '#fff' : '#C8D4DC', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {canApprove ? t('finance.approve.cta.readyTitle') : t('finance.approve.cta.notReadyTitle')}
          </h3>
          <p style={{ fontSize: 13, color: canApprove ? '#A8B5C0' : '#6B7E8E', margin: 0 }}>
            {canApprove
              ? t('finance.approve.cta.readyBody', { period: period.label })
              : t('finance.approve.cta.notReadyBody', { count: summary.pending })}
          </p>
        </div>
        <Btn variant="primary" size="lg" disabled={!canApprove} onClick={() => setApproved(true)} icon={<Icons.lock size={16}/>}
          style={{ fontSize: 16, padding: '16px 32px', opacity: canApprove ? 1 : 0.4 }}>
          {t('finance.approve.cta.lockBtn')}
        </Btn>
      </div>
    </div>
  );
}

function FinApproveSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={260} style={{ marginBottom: 32 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
