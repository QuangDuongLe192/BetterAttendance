import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tag, Btn, Eyebrow, SectionHeader, Switch, Field, Input, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { PayPeriod, PayPeriodViz } from './Components/PayPeriodViz';

interface Props { isLoading?: boolean; error?: string | null; }

export function PayRules({ isLoading, error }: Props = {}) {
  const { t } = useTranslation('setup');
  const [period,    setPeriod]   = useState<PayPeriod>('monthly');
  const [splitDay,  setSplitDay] = useState('15');
  const [otEnabled, setOtEnabled] = useState(true);

  const [savedPay, setSavedPay] = useState({
    period: 'monthly' as PayPeriod, splitDay: '15', otEnabled: true,
  });

  const payDirty = (
    period    !== savedPay.period   ||
    splitDay  !== savedPay.splitDay ||
    otEnabled !== savedPay.otEnabled
  );

  const savePayRules = () => {
    console.log('[PUT] /api/pay-rules', {
      payPeriod: { type: period, splitDay: period === 'bimonthly' ? parseInt(splitDay) || 15 : null },
      overtime:  { enabled: otEnabled },
    });
    setSavedPay({ period, splitDay, otEnabled });
  };
  const cancelPayRules = () => {
    setPeriod(savedPay.period);
    setSplitDay(savedPay.splitDay);
    setOtEnabled(savedPay.otEnabled);
  };

  if (isLoading) return <SetupPayRulesSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div style={{ paddingBottom: payDirty ? 80 : 0 }}>
      <div style={{ marginBottom: 40 }}>
        <Eyebrow>{t('setup.payRules.eyebrow')}</Eyebrow>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 16, marginBottom: 12 }}>
          {t('setup.payRules.title')}
        </h1>
        <p style={{ fontSize: 15, color: '#3A4F63', lineHeight: 1.6, maxWidth: 600 }}>
          {t('setup.payRules.subtitle')}
        </p>
      </div>

      {/* ── Pay period ──────────────────────────────────────────────────────── */}
      <SectionHeader title={t('setup.payRules.period.sectionTitle')} style={{ marginBottom: 16 }} />
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #E8ECEF', overflow: 'hidden', marginBottom: 20 }}>
          {([
            { id: 'monthly',   label: t('setup.payRules.period.monthly') },
            { id: 'bimonthly', label: t('setup.payRules.period.bimonthly') },
            { id: 'weekly',    label: t('setup.payRules.period.weekly') },
          ] as { id: PayPeriod; label: string }[]).map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              style={{ flex: 1, padding: '12px 8px', border: 'none', borderLeft: i > 0 ? '1px solid #E8ECEF' : 'none', background: period === opt.id ? '#1E2D3D' : '#fff', cursor: 'pointer', transition: 'background 150ms', textAlign: 'center' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: period === opt.id ? '#fff' : '#1E2D3D' }}>{opt.label}</div>
            </button>
          ))}
        </div>

        <PayPeriodViz period={period} splitDay={parseInt(splitDay) || 15} />

        {period === 'bimonthly' && (
          <div style={{ marginTop: 16, padding: '14px 16px', background: '#F7F9FA', borderRadius: 8 }}>
            <Field label={t('setup.payRules.period.splitDay.label')} hint={t('setup.payRules.period.splitDay.hint')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Input value={splitDay} onChange={v => setSplitDay(String(Math.max(1, Math.min(28, parseInt(v) || 1))))} type="number" style={{ maxWidth: 100 }} />
                <span style={{ fontSize: 12, color: '#6B7E8E' }}>
                  {t('setup.payRules.period.splitDay.desc', { n: splitDay, m: parseInt(splitDay) + 1 })}
                </span>
              </div>
            </Field>
          </div>
        )}
      </Card>

      {/* ── Overtime ────────────────────────────────────────────────────────── */}
      <SectionHeader title={t('setup.payRules.ot.sectionTitle')} style={{ marginBottom: 16 }} />
      <Card style={{ marginBottom: 32 }}>
        <RuleRow
          label={t('setup.payRules.ot.label')}
          desc={t('setup.payRules.ot.desc')}
          enabled={otEnabled}
          onToggle={setOtEnabled}
        />
        {otEnabled && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#F0FBF9', borderRadius: 8, fontSize: 12, color: '#1A6B55', lineHeight: 1.6 }}>
            {t('setup.payRules.ot.rateHint', { roleLink: t('setup.payRules.ot.roleLinkLabel') })}
          </div>
        )}
      </Card>

      {/* ── Currency ────────────────────────────────────────────────────────── */}
      <SectionHeader title={t('setup.payRules.currency.sectionTitle')} style={{ marginBottom: 16 }} />
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D' }}>{t('setup.payRules.currency.name')}</div>
            <div style={{ fontSize: 12, color: '#6B7E8E' }}>{t('setup.payRules.currency.format')}</div>
          </div>
          <Tag tone="success" icon={<Icons.check size={10} />}>{t('setup.payRules.currency.defaultBadge')}</Tag>
        </div>
        <div style={{ marginTop: 8, padding: '10px 14px', background: '#F0FBF9', borderRadius: 6, fontSize: 12, color: '#1A6B55' }}>
          {t('setup.payRules.currency.note')}
        </div>
      </Card>

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      {payDirty && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1E2D3D', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.25)' }}>
          <Icons.alert size={16} stroke="#F59E0B" />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', flex: 1 }}>{t('setup.payRules.saveBar.unsaved')}</span>
          <Btn variant="ghost" size="sm" onClick={cancelPayRules} style={{ color: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.25)' }}>{t('setup.payRules.saveBar.cancel')}</Btn>
          <Btn variant="primary" size="sm" onClick={savePayRules}>{t('setup.payRules.saveBar.save')}</Btn>
        </div>
      )}
    </div>
  );
}

function SetupPayRulesSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 24 }} />
      <SkeletonCard lines={6} />
    </div>
  );
}

function RuleRow({ label, desc, enabled, onToggle }: {
  label: string; desc: string; enabled: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#3A4F63', marginTop: 4, lineHeight: 1.55 }}>{desc}</div>
      </div>
      <Switch checked={enabled} onChange={onToggle} />
    </div>
  );
}
