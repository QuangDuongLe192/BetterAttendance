import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Btn, Field, Input, Switch, Tag } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { LOCATIONS } from '../../../services/setup';
import type { Location, WifiNetwork } from '../../../services/setup';
import { GeofencePicker } from './Components/GeofencePicker';

const Check = Icons.check;
const ChevR = Icons.chevR;
const Plus = Icons.plus;
const Edit = Icons.edit;
const Pin = Icons.pin;
const Users = Icons.users;
const Alert = Icons.alert;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraftLocation {
  color: string;
  name: string;
  address: string;
  networks: WifiNetwork[];
  lat: string;
  long: string;
  radius: number;
  mode: 'wifi' | 'geo' | 'wifi+geo' | 'none';
  autoIn: boolean;
  autoOut: boolean;
}

const DRAFT_DEFAULT: DraftLocation = {
  color: '#00B4A0',
  name: '',
  address: '',
  networks: [],
  lat: '10.7724',
  long: '106.6983',
  radius: 80,
  mode: 'wifi',
  autoIn: true,
  autoOut: false,
};

type StepKey = 'basic' | 'mode' | 'wifi' | 'geo' | 'auto' | 'review';
interface StepDef { id: number; key: StepKey; label: string; icon: keyof typeof Icons }

function getSteps(mode: DraftLocation['mode'], t: (k: string) => string): StepDef[] {
  const defs: Omit<StepDef, 'id'>[] = [
    { key: 'basic',  label: t('setup.wizard.step.basic'),  icon: 'pin' },
    { key: 'mode',   label: t('setup.wizard.step.mode'),   icon: 'shield' },
    ...(mode === 'wifi' || mode === 'wifi+geo' ? [{ key: 'wifi' as StepKey, label: t('setup.wizard.step.wifi'), icon: 'wifi' as const }] : []),
    ...(mode === 'geo' || mode === 'wifi+geo'  ? [{ key: 'geo' as StepKey,  label: t('setup.wizard.step.geo'),  icon: 'target' as const }] : []),
    ...(mode !== 'none' ? [{ key: 'auto' as StepKey, label: t('setup.wizard.step.auto'), icon: 'clock' as const }] : []),
    { key: 'review', label: t('setup.wizard.step.review'), icon: 'check' },
  ];
  return defs.map((s, i) => ({ ...s, id: i + 1 }));
}

const COLOR_PALETTE = [
  '#EF4444', '#F43F5E', '#EA580C', '#F97316', '#D97706',
  '#EAB308', '#65A30D', '#16A34A', '#10B981', '#00B4A0',
  '#0891B2', '#2B7EC4', '#4338CA', '#7C4FBF', '#9333EA',
  '#DB2777', '#EC4899', '#1E2D3D', '#64748B', '#92400E',
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#9BAAB5',
  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8,
};

// ─── Validators ───────────────────────────────────────────────────────────────

function validateBasic(draft: DraftLocation, t: (k: string) => string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!draft.name.trim()) errs.name = t('setup.wizard.basic.errName');
  if (!draft.address.trim()) errs.address = t('setup.wizard.basic.errAddress');
  return errs;
}

const BSSID_RE = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

function validateWifi(draft: DraftLocation, t: (k: string) => string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (draft.networks.length === 0 || !draft.networks.some(n => n.bssid.trim() !== ''))
    errs.wifi = t('setup.wizard.wifi.errRequired');
  draft.networks.forEach((n, i) => {
    if (n.bssid.trim() && !BSSID_RE.test(n.bssid.trim()))
      errs[`bssid_${i}`] = t('setup.wizard.wifi.errBssid');
  });
  return errs;
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function NewLocationWizard({ onDone }: Readonly<{ onDone: () => void }>) {
  const { t } = useTranslation('setup');
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<DraftLocation>(DRAFT_DEFAULT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState(false);
  const [createdId, setCreatedId] = useState('');

  const steps = getSteps(draft.mode, t);
  const activeStep = Math.min(step, steps.length);
  const currentKey = steps[activeStep - 1]?.key ?? 'basic';

  const set = <K extends keyof DraftLocation>(k: K, v: DraftLocation[K]) =>
    setDraft(d => ({ ...d, [k]: v }));

  const validate = (s: number): boolean => {
    const key = steps[s - 1]?.key;
    let errs: Record<string, string>;
    if (key === 'basic') errs = validateBasic(draft, t);
    else if (key === 'wifi') errs = validateWifi(draft, t);
    else errs = {};
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goTo = (n: number) => { setDir(n > step ? 1 : -1); setErrors({}); setStep(n); };
  const goToKey = (key: StepKey) => { const found = steps.findIndex(s => s.key === key); if (found >= 0) goTo(found + 1); };
  const next = () => { if (validate(activeStep)) goTo(Math.min(activeStep + 1, steps.length)); };
  const back = () => goTo(Math.max(activeStep - 1, 1));

  const handleModeSelect = (newMode: DraftLocation['mode']) => {
    set('mode', newMode);
  };

  const create = () => {
    const newId = `L${LOCATIONS.length + 1}`;
    const singleValidation = draft.mode === 'none' ? [] : [draft.mode];
    const activeValidation = draft.mode === 'wifi+geo' ? ['wifi', 'geo'] : singleValidation;
    const newLoc: Location = {
      locationId: newId,
      name: draft.name,
      address: draft.address,
      long: draft.long === '' ? 0 : Number(draft.long),
      lat: draft.lat === '' ? 0 : Number(draft.lat),
      validationConfig: {
        radiusMeters: draft.radius,
        allowed_bssid: draft.networks.map(n => n.bssid).filter(Boolean),
      },
      activeValidation,
      style: { color: draft.color },
      status: 'Active',
      delegation: { enabled: false, canAssignRoles: false, canEditAttendance: false, canApproveOT: false },
      staffCount: 0,
      autoIn: draft.autoIn,
      autoOut: draft.autoOut,
    };
    LOCATIONS.push(newLoc);
    setCreatedId(newId);
    setCreated(true);
  };

  const stepCompMap: Partial<Record<StepKey, ReactNode>> = {
    basic: <Step1Basic key="basic" draft={draft} set={set} errors={errors} t={t} />,
    mode: <StepMode key="mode" draft={draft} onSelect={handleModeSelect} t={t} />,
    wifi: <StepWifi key="wifi" draft={draft} set={set} errors={errors} t={t} />,
    geo: <StepGeo key="geo" draft={draft} set={set} t={t} />,
    auto: <StepAuto key="auto" draft={draft} set={set} t={t} />,
    review: <StepReview key="review" draft={draft} onEdit={goToKey} onCreate={create} created={created} createdId={createdId} onDone={onDone} t={t} />,
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', position: 'relative',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)'
    }}>

      <style>{`
        @keyframes wizEnterRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes wizEnterLeft  { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        .wiz-enter-right { animation: wizEnterRight 280ms cubic-bezier(0.2,0.7,0.2,1) both; }
        .wiz-enter-left  { animation: wizEnterLeft  280ms cubic-bezier(0.2,0.7,0.2,1) both; }
        .geo-slider { -webkit-appearance:none; width:100%; height:6px; border-radius:999px; outline:none; cursor:pointer; background: linear-gradient(to right, #00B4A0 var(--pct,40%), #E8ECEF var(--pct,40%)); }
        .geo-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:999px; background:#00B4A0; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,180,160,0.35); cursor:pointer; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.22) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.08) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', padding: '44px 44px 160px' }}>
        <WizardStepper steps={steps} current={activeStep} onGo={goTo} draft={draft} newLocationLabel={t('setup.wizard.newLocationPreview')} />
        <div key={activeStep} className={dir > 0 ? 'wiz-enter-right' : 'wiz-enter-left'} style={{ flex: 1, paddingLeft: 48 }}>
          {stepCompMap[currentKey]}
        </div>
      </div>

      <WizardFooter step={activeStep} total={steps.length} onBack={back} onNext={next} isLast={activeStep === steps.length} onCancel={onDone}
        cancelLabel={t('setup.wizard.footer.cancel')} backLabel={t('setup.wizard.footer.back')} nextLabel={t('setup.wizard.footer.next')} />
    </div>
  );
}

// ─── Vertical Stepper ─────────────────────────────────────────────────────────

function WizardStepper({ steps, current, onGo, draft, newLocationLabel }: Readonly<{ steps: StepDef[]; current: number; onGo: (n: number) => void; draft: DraftLocation; newLocationLabel: string }>) {
  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 84 }}>
        {/* Color preview chip */}
        <div style={{ ...glass, borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: draft.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: draft.name ? '#1E2D3D' : '#C8D4DC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {draft.name || newLocationLabel}
          </span>
        </div>

        {/* Step list */}
        <div style={{ ...glass, borderRadius: 14, padding: '16px 12px' }}>
          {steps.map((s, i) => {
            const done = current > s.id;
            const active = current === s.id;
            const IconComp = Icons[s.icon];
            const inactiveBg = active ? '#1E2D3D' : 'rgba(200,212,220,0.25)';
            const stepBg = done ? '#00B4A0' : inactiveBg;
            const doneShadow = done ? '0 2px 8px rgba(0,180,160,0.25)' : 'none';
            const stepShadow = active ? '0 0 0 4px rgba(30,45,61,0.12)' : doneShadow;
            const iconContent = active
              ? <IconComp size={13} stroke="#fff" />
              : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11 }}>{s.id}</span>;
            const doneLabelColor = done ? '#3A4F63' : '#C8D4DC';
            const stepLabelColor = active ? '#1E2D3D' : doneLabelColor;
            return (
              <div key={s.key} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30, flexShrink: 0 }}>
                  <button
                    onClick={() => done ? onGo(s.id) : undefined}
                    style={{
                      width: 30, height: 30, borderRadius: 999, border: 'none',
                      background: stepBg,
                      color: (done || active) ? '#fff' : '#9BAAB5',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: done ? 'pointer' : 'default', flexShrink: 0,
                      boxShadow: stepShadow,
                      transition: 'all 220ms',
                    }}>
                    {done ? <Check size={13} stroke="#fff" sw={2.5} /> : iconContent}
                  </button>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 24, margin: '4px 0', borderRadius: 999,
                      background: done ? '#00B4A0' : 'rgba(200,212,220,0.4)', transition: 'background 350ms'
                    }} />
                  )}
                </div>
                <div style={{ paddingTop: 6, paddingBottom: i < steps.length - 1 ? 24 : 0, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 600, fontSize: 12.5,
                    color: stepLabelColor, transition: 'color 220ms', lineHeight: 1.3
                  }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function WizardFooter({ step, total, onBack, onNext, isLast, onCancel, cancelLabel, backLabel, nextLabel }: Readonly<{ step: number; total: number; onBack: () => void; onNext: () => void; isLast: boolean; onCancel: () => void; cancelLabel: string; backLabel: string; nextLabel: string }>) {
  const ghostBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
  };
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 260, right: 0, zIndex: 30,
      background: 'rgba(22,34,46,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 40px', display: 'flex', alignItems: 'center'
    }}>
      <div style={{ width: 130 }}>
        {step === 1 ? (
          <button onClick={onCancel} style={ghostBtn}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
            <Icons.x size={13} stroke="rgba(255,255,255,0.65)" />
            {cancelLabel}
          </button>
        ) : (
          <button onClick={onBack} style={ghostBtn}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
            <ChevR size={13} stroke="rgba(255,255,255,0.65)" style={{ transform: 'scaleX(-1)' }} />
            {backLabel}
          </button>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => {
          const activeDotBg = step === i + 1 ? '#fff' : 'rgba(255,255,255,0.2)';
          const dotBg = i + 1 < step ? '#00B4A0' : activeDotBg;
          return (
            <div key={`dot-${i}`} style={{
              height: 6, width: step === i + 1 ? 22 : 6, borderRadius: 999,
              background: dotBg,
              transition: 'all 280ms cubic-bezier(0.2,0.7,0.2,1)'
            }} />
          );
        })}
      </div>
      <div style={{ width: 130, display: 'flex', justifyContent: 'flex-end' }}>
        {!isLast && (
          <Btn variant="primary" size="sm" icon={<ChevR size={14} stroke="#fff" />} onClick={onNext}>{nextLabel}</Btn>
        )}
      </div>
    </div>
  );
}

// ─── Step Header ──────────────────────────────────────────────────────────────

function StepHeader({ vi, sub, icon }: Readonly<{ vi: string; sub?: string; icon?: keyof typeof Icons }>) {
  const IconComp = icon ? Icons[icon] : null;
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
      {IconComp && (
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: 'rgba(0,180,160,0.1)', border: '1px solid rgba(0,180,160,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <IconComp size={20} stroke="#00B4A0" />
        </div>
      )}
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', marginBottom: sub ? 10 : 0, margin: 0 }}>{vi}</h2>
        {sub && <p style={{ fontSize: 14, color: '#6B7E8E', lineHeight: 1.7,  marginTop: 10, marginBottom: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

function Step1Basic({ draft, set, errors, t }: Readonly<{ draft: DraftLocation; set: <K extends keyof DraftLocation>(k: K, v: DraftLocation[K]) => void; errors: Record<string, string>; t: (k: string) => string }>) {
  return (
    <div>
      <StepHeader vi={t('setup.wizard.basic.title')} sub={t('setup.wizard.basic.sub')} icon="pin" />
      <div style={{ ...glass, borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 620 }}>
        <Field label={t('setup.wizard.basic.nameLabel')} hint={t('setup.wizard.basic.nameHint')}>
          <Input value={draft.name} onChange={v => set('name', v)} placeholder={t('setup.wizard.basic.namePlaceholder')} />
          {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
        </Field>
        <Field label={t('setup.wizard.basic.addressLabel')}>
          <Input value={draft.address} onChange={v => set('address', v)} placeholder={t('setup.wizard.basic.addressPlaceholder')} />
          {errors.address && <ErrMsg>{errors.address}</ErrMsg>}
        </Field>
        <Field label={t('setup.wizard.basic.colorLabel')} hint={t('setup.wizard.basic.colorHint')}>
          <WizColorPicker value={draft.color} onChange={v => set('color', v)} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Validation Mode ──────────────────────────────────────────────────

function StepMode({ draft, onSelect, t }: Readonly<{ draft: DraftLocation; onSelect: (m: DraftLocation['mode']) => void; t: (k: string) => string }>) {
  const modes: { id: DraftLocation['mode']; icon: keyof typeof Icons; vi: string; sub: string; pros: string[]; cons: string[]; recommended?: boolean }[] = [
    { id: 'wifi',     icon: 'wifi',   vi: t('setup.wizard.mode.wifiOnly.title'),  sub: t('setup.wizard.mode.wifiOnly.sub'),  pros: [t('setup.wizard.mode.wifiOnly.pro1'), t('setup.wizard.mode.wifiOnly.pro2')], cons: [t('setup.wizard.mode.wifiOnly.con1')] },
    { id: 'geo',      icon: 'target', vi: t('setup.wizard.mode.gpsOnly.title'),   sub: t('setup.wizard.mode.gpsOnly.sub'),   pros: [t('setup.wizard.mode.gpsOnly.pro1'), t('setup.wizard.mode.gpsOnly.pro2')], cons: [t('setup.wizard.mode.gpsOnly.con1'), t('setup.wizard.mode.gpsOnly.con2')] },
    { id: 'wifi+geo', icon: 'shield', vi: t('setup.wizard.mode.both.title'),      sub: t('setup.wizard.mode.both.sub'),      pros: [t('setup.wizard.mode.both.pro1'), t('setup.wizard.mode.both.pro2')], cons: [t('setup.wizard.mode.both.con1')], recommended: true },
    { id: 'none',     icon: 'x',      vi: t('setup.wizard.mode.none.title'),      sub: t('setup.wizard.mode.none.sub'),      pros: [t('setup.wizard.mode.none.pro1')], cons: [t('setup.wizard.mode.none.con1'), t('setup.wizard.mode.none.con2')] },
  ];

  return (
    <div>
      <StepHeader vi={t('setup.wizard.step.mode')} sub={t('setup.wizard.mode.sub')} icon="shield" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
        {modes.map(m => {
          const sel = draft.mode === m.id;
          const IconComp = Icons[m.icon];
          return (
            <button key={m.id} onClick={() => onSelect(m.id)} style={{
              width: '100%', textAlign: 'left', display: 'flex', gap: 14, padding: '18px 20px',
              borderRadius: 12, border: `2px solid ${sel ? '#00B4A0' : 'rgba(200,212,220,0.4)'}`,
              background: sel ? 'rgba(0,180,160,0.07)' : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              cursor: 'pointer', transition: 'all 180ms', alignItems: 'flex-start', position: 'relative',
              boxShadow: sel ? '0 4px 20px rgba(0,180,160,0.12)' : '0 2px 8px rgba(30,45,61,0.04)'
            }}>
              {m.recommended && (
                <span style={{
                  position: 'absolute', top: -1, right: 18, background: '#00B4A0', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: 1.5,
                  padding: '3px 9px', borderRadius: '0 0 5px 5px', textTransform: 'uppercase'
                }}>{t('setup.wizard.mode.both.recommended')}</span>
              )}
              <div style={{
                width: 18, height: 18, borderRadius: 999, marginTop: 3, flexShrink: 0,
                border: `2px solid ${sel ? '#00B4A0' : 'rgba(200,212,220,0.6)'}`,
                background: sel ? '#00B4A0' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms'
              }}>
                {sel && <span style={{ width: 5, height: 5, borderRadius: 999, background: '#fff' }} />}
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: sel ? 'rgba(0,180,160,0.15)' : 'rgba(200,212,220,0.2)',
                border: `1px solid ${sel ? 'rgba(0,180,160,0.25)' : 'rgba(200,212,220,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms'
              }}>
                <IconComp size={18} stroke={sel ? '#00B4A0' : '#9BAAB5'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{m.vi}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7E8E', lineHeight: 1.6, marginBottom: 10 }}>{m.sub}</div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1A6B55', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{t('setup.wizard.mode.pros')}</div>
                    {m.pros.map((p) => <div key={p} style={{ fontSize: 12, color: '#3A4F63', lineHeight: 1.7 }}>{p}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#B45309', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{t('setup.wizard.mode.cons')}</div>
                    {m.cons.map((c) => <div key={c} style={{ fontSize: 12, color: '#3A4F63', lineHeight: 1.7 }}>{c}</div>)}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Wi-Fi ──────────────────────────────────────────────────────────────

function StepWifi({ draft, set, errors, t }: Readonly<{ draft: DraftLocation; set: <K extends keyof DraftLocation>(k: K, v: DraftLocation[K]) => void; errors: Record<string, string>; t: (k: string) => string }>) {
  const addBlank = () => set('networks', [...draft.networks, { ssid: '', bssid: '' }]);
  const removeAt = (i: number) => set('networks', draft.networks.filter((_, idx) => idx !== i));
  const updateAt = (i: number, field: keyof WifiNetwork, val: string) =>
    set('networks', draft.networks.map((n, idx) => idx === i ? { ...n, [field]: val } : n));

  return (
    <div>
      <StepHeader vi={t('setup.wizard.step.wifi')} sub={t('setup.wizard.wifi.sub')} icon="wifi" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
        <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px',
            borderBottom: draft.networks.length > 0 ? '1px solid rgba(200,212,220,0.3)' : 'none',
            background: 'rgba(247,249,250,0.5)'
          }}>
            <div>
              <div style={sectionLabel}>{t('setup.wizard.wifi.allowedNetworks')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>
                {t('setup.wizard.wifi.listTitle')}{' '}
                <span style={{ fontSize: 12, color: '#9BAAB5', fontWeight: 400 }}>
                  {draft.networks.length > 0 ? t('setup.wizard.wifi.countN', { n: draft.networks.length }) : t('setup.wizard.wifi.countNone')}
                </span>
              </div>
            </div>
            <Btn variant="ghost" size="sm" icon={<Plus size={13} />} onClick={addBlank}>{t('setup.wizard.wifi.addBtn')}</Btn>
          </div>
          {draft.networks.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#C8D4DC', fontSize: 13 }}>
              {t('setup.wizard.wifi.emptyHint')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {draft.networks.map((net, i) => (
                <div key={net.bssid || net.ssid || `net-${i}`} style={{ padding: '16px 20px', borderTop: i > 0 ? '1px solid rgba(200,212,220,0.25)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('setup.wizard.wifi.networkLabel', { n: i + 1 })}</span>
                    <button onClick={() => removeAt(i)} style={{
                      background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)',
                      cursor: 'pointer', padding: '3px 6px', borderRadius: 5, display: 'flex', alignItems: 'center'
                    }}>
                      <Icons.x size={12} stroke="#DC2626" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label={t('setup.wizard.wifi.fieldSsid')} hint={t('setup.wizard.wifi.fieldSsidHint')}>
                      <Input value={net.ssid} onChange={v => updateAt(i, 'ssid', v)} placeholder="BetterCoffee-Store" mono />
                    </Field>
                    <Field label={t('setup.wizard.wifi.fieldBssid')} hint={errors[`bssid_${i}`] ?? t('setup.wizard.wifi.fieldBssidHint')}>
                      <Input value={net.bssid} onChange={v => updateAt(i, 'bssid', v.toUpperCase())} placeholder="04:F0:21:A1:88:2C" mono
                        style={errors[`bssid_${i}`] ? { borderColor: '#DC2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.1)' } : undefined} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.wifi && <ErrMsg>{errors.wifi}</ErrMsg>}
        <div style={{ fontSize: 12, color: '#9BAAB5', lineHeight: 1.7, padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: 10, border: '1px solid rgba(200,212,220,0.3)', backdropFilter: 'blur(8px)' }}>
          {t('setup.wizard.wifi.note')}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Geofence ───────────────────────────────────────────────────────────

function StepGeo({ draft, set, t }: Readonly<{ draft: DraftLocation; set: <K extends keyof DraftLocation>(k: K, v: DraftLocation[K]) => void; t: (k: string) => string }>) {
  const radius = draft.radius;
  const latNum = Number.parseFloat(draft.lat) || 10.7724;
  const lngNum = Number.parseFloat(draft.long) || 106.6983;

  const presets = [
    { label: t('setup.wizard.geo.preset.street'),    r: 60 },
    { label: t('setup.wizard.geo.preset.office'),    r: 80 },
    { label: t('setup.wizard.geo.preset.mall'),      r: 100 },
    { label: t('setup.wizard.geo.preset.warehouse'), r: 150 },
  ];

  return (
    <div>
      <StepHeader vi={t('setup.wizard.step.geo')} sub={t('setup.wizard.geo.sub')} icon="target" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
        <div style={{ ...glass, borderRadius: 14, padding: '20px' }}>
          <div style={sectionLabel}>{t('setup.wizard.geo.centerLabel')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label={t('setup.wizard.geo.latLabel')}><Input value={draft.lat} onChange={v => set('lat', v)} mono prefix="N" /></Field>
            <Field label={t('setup.wizard.geo.lngLabel')}><Input value={draft.long} onChange={v => set('long', v)} mono prefix="E" /></Field>
          </div>
        </div>
        <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ isolation: 'isolate' }}>
            <GeofencePicker lat={latNum} lng={lngNum} radius={radius} height={290} onChange={(lat, lng) => { set('lat', lat.toFixed(6)); set('long', lng.toFixed(6)); }} />
          </div>
          <div style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{t('setup.wizard.geo.radiusLabel')}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#00B4A0' }}>{radius}m</span>
            </div>
            <input type="range" min={20} max={200} step={1} value={radius} onChange={e => set('radius', Number(e.target.value))} className="geo-slider" style={{ '--pct': `${((radius - 20) / 180) * 100}%` } as React.CSSProperties} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#C8D4DC' }}>
              <span>20m</span><span>60m</span><span>100m</span><span>150m</span><span>200m</span>
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
              {presets.map(p => (
                <button key={p.r} onClick={() => set('radius', p.r)} style={{
                  padding: '4px 12px', borderRadius: 999,
                  border: `1.5px solid ${radius === p.r ? '#00B4A0' : 'rgba(200,212,220,0.5)'}`,
                  background: radius === p.r ? 'rgba(0,180,160,0.09)' : 'rgba(255,255,255,0.7)',
                  color: radius === p.r ? '#00897B' : '#6B7E8E',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, cursor: 'pointer', transition: 'all 150ms'
                }}>
                  {p.label}<span style={{ opacity: 0.6, marginLeft: 5 }}>({p.r}m)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Auto Clock-in/out ──────────────────────────────────────────────────

function StepAuto({ draft, set, t }: Readonly<{ draft: DraftLocation; set: <K extends keyof DraftLocation>(k: K, v: DraftLocation[K]) => void; t: (k: string) => string }>) {
  const rows = [
    { field: 'autoIn' as const,  vi: t('setup.wizard.auto.autoIn.label'),    sub: t('setup.wizard.auto.autoIn.sub'),    disabled: false },
    { field: 'autoOut' as const, vi: t('setup.wizard.auto.autoOut.label'),   sub: t('setup.wizard.auto.autoOut.sub'),   disabled: false },
    { field: null,               vi: t('setup.wizard.auto.biometric.label'), sub: t('setup.wizard.auto.biometric.sub'), disabled: true },
  ];

  return (
    <div>
      <StepHeader vi={t('setup.wizard.step.auto')} sub={t('setup.wizard.auto.sub')} icon="clock" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 620 }}>
        {rows.map((r, idx) => {
          const on = r.field ? draft[r.field] : false;
          const onActiveBg = !r.disabled && on ? 'rgba(0,180,160,0.06)' : 'rgba(255,255,255,0.72)';
          const rowBg = r.disabled ? 'rgba(247,249,250,0.5)' : onActiveBg;
          return (
            <div key={r.field ?? 'biometric'} style={{
              display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px', borderRadius: 12,
              border: `1.5px solid ${!r.disabled && on ? 'rgba(0,180,160,0.3)' : 'rgba(200,212,220,0.35)'}`,
              background: rowBg,
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              opacity: r.disabled ? 0.55 : 1, transition: 'all 150ms'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{r.vi}</div>
                <div style={{ fontSize: 13, color: '#6B7E8E', lineHeight: 1.5 }}>{r.sub}</div>
                {r.disabled && <div style={{ marginTop: 8 }}><Tag tone="warning">{t('setup.wizard.auto.comingSoon')}</Tag></div>}
              </div>
              <Switch checked={!r.disabled && !!on} onChange={v => r.field && !r.disabled && set(r.field, v)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Review & Create ────────────────────────────────────────────────────

function StepReview({ draft, onEdit, onCreate, created, createdId, onDone, t }: Readonly<{
  draft: DraftLocation; onEdit: (key: StepKey) => void; onCreate: () => void;
  created: boolean; createdId: string; onDone: () => void; t: (k: string) => string;
}>) {
  const modeLabel: Record<DraftLocation['mode'], string> = {
    'wifi+geo': t('setup.wizard.review.modeWifiGps'),
    wifi:       t('setup.wizard.review.modeWifi'),
    geo:        t('setup.wizard.review.modeGps'),
    none:       t('setup.wizard.review.modeNone'),
  };

  if (created) return <SuccessState name={draft.name} locId={createdId} onDone={onDone} t={t} />;

  const hasWifi = draft.mode === 'wifi' || draft.mode === 'wifi+geo';
  const hasGeo = draft.mode === 'geo' || draft.mode === 'wifi+geo';

  const wifiRows: { label: string; value: ReactNode }[] = draft.networks.length === 0
    ? [{ label: t('setup.wizard.review.row.network', { n: 1 }), value: <Tag tone="warning">{t('setup.wizard.review.row.networkUnconfigured')}</Tag> }]
    : draft.networks.map((n, i) => ({
      label: t('setup.wizard.review.row.network', { n: i + 1 }),
      value: (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <Mono>{n.ssid || <Em>{t('setup.wizard.review.row.noSsid')}</Em>}</Mono>
          {n.bssid && <span style={{ fontSize: 10, color: '#9BAAB5' }}>{n.bssid}</span>}
        </span>
      ),
    }));

  return (
    <div>
      <StepHeader vi={t('setup.wizard.step.review')} sub={t('setup.wizard.review.sub')} icon="check" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 660 }}>
        <ReviewBlock title={t('setup.wizard.review.block.basic')} stepKey="basic" onEdit={onEdit} editLabel={t('setup.wizard.review.editBtn')} rows={[
          { label: t('setup.wizard.review.row.name'),    value: draft.name    || <Em>—</Em> },
          { label: t('setup.wizard.review.row.address'), value: draft.address || <Em>—</Em> },
        ]} />
        <ReviewBlock title={t('setup.wizard.review.block.mode')} stepKey="mode" onEdit={onEdit} editLabel={t('setup.wizard.review.editBtn')} rows={[
          { label: t('setup.wizard.review.row.mode'), value: modeLabel[draft.mode] },
        ]} />
        {hasWifi && <ReviewBlock title={t('setup.wizard.review.block.wifi')} stepKey="wifi" onEdit={onEdit} editLabel={t('setup.wizard.review.editBtn')} rows={wifiRows} />}
        {hasGeo && (
          <ReviewBlock title={t('setup.wizard.review.block.geo')} stepKey="geo" onEdit={onEdit} editLabel={t('setup.wizard.review.editBtn')} rows={[
            { label: t('setup.wizard.review.row.coords'), value: <Mono>{draft.lat}, {draft.long}</Mono> },
            { label: t('setup.wizard.review.row.radius'), value: <strong style={{ color: '#00B4A0' }}>{draft.radius}m</strong> },
          ]} />
        )}
        {draft.mode !== 'none' && (
          <ReviewBlock title={t('setup.wizard.review.block.auto')} stepKey="auto" onEdit={onEdit} editLabel={t('setup.wizard.review.editBtn')} rows={[
            { label: t('setup.wizard.review.row.autoIn'),  value: draft.autoIn  ? <Tag tone="success" icon={<Check size={10} />}>{t('setup.wizard.review.on')}</Tag>  : <Tag tone="neutral">{t('setup.wizard.review.off')}</Tag> },
            { label: t('setup.wizard.review.row.autoOut'), value: draft.autoOut ? <Tag tone="success" icon={<Check size={10} />}>{t('setup.wizard.review.on')}</Tag>  : <Tag tone="neutral">{t('setup.wizard.review.off')}</Tag> },
          ]} />
        )}

        {/* Create CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px',
          background: 'linear-gradient(135deg, rgba(30,45,61,0.94) 0%, rgba(0,60,52,0.92) 100%)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14, marginTop: 4,
          boxShadow: '0 8px 32px rgba(30,45,61,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,160,0.25) 0%, transparent 70%)', pointerEvents: 'none'
          }} />
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>{t('setup.wizard.review.cta.title')}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{t('setup.wizard.review.cta.sub')}</div>
          </div>
          <Btn variant="primary" size="lg" onClick={onCreate}>{t('setup.wizard.review.createBtn')}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Em({ children }: Readonly<{ children: ReactNode }>) {
  return <span style={{ color: '#C8D4DC' }}>{children}</span>;
}
function Mono({ children }: Readonly<{ children: ReactNode }>) {
  return <span style={{ fontSize: 12 }}>{children}</span>;
}

function ReviewBlock({ title, stepKey, onEdit, rows, editLabel }: Readonly<{
  title: string; stepKey: StepKey; onEdit: (k: StepKey) => void;
  rows: { label: string; value: ReactNode }[];
  editLabel: string;
}>) {
  return (
    <div style={{ ...glass, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px',
        background: 'rgba(247,249,250,0.6)', borderBottom: '1px solid rgba(200,212,220,0.25)'
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1E2D3D' }}>{title}</span>
        <button onClick={() => onEdit(stepKey)} style={{
          fontSize: 12, color: '#00B4A0', fontWeight: 600,
          background: 'rgba(0,180,160,0.07)', border: '1px solid rgba(0,180,160,0.15)',
          cursor: 'pointer', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 6
        }}>
          <Edit size={11} stroke="#00B4A0" /> {editLabel}
        </button>
      </div>
      {rows.map((r, i) => (
        <div key={r.label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px',
          borderTop: i > 0 ? '1px solid rgba(200,212,220,0.2)' : 'none'
        }}>
          <span style={{ fontSize: 12, color: '#9BAAB5' }}>{r.label}</span>
          <span style={{ fontSize: 13, color: '#1E2D3D', fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function SuccessState({ name, locId, onDone, t }: Readonly<{ name: string; locId: string; onDone: () => void; t: (k: string) => string }>) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 999, background: 'linear-gradient(135deg, #00B4A0, #00C9B0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 12px rgba(0,180,160,0.1), 0 8px 32px rgba(0,180,160,0.25)'
        }}>
          <Check size={36} stroke="#fff" sw={2.5} />
        </div>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', marginBottom: 12, letterSpacing: '-0.02em' }}>{t('setup.wizard.success.title')}</h2>
      <p style={{ fontSize: 14, color: '#6B7E8E', lineHeight: 1.8, marginBottom: 32 }}>
        <strong style={{ color: '#1E2D3D' }}>{name || t('setup.wizard.newLocationPreview')}</strong> {t('setup.wizard.success.body')}<br />
        {t('setup.wizard.success.next')}
      </p>
      <div style={{ ...glass, borderRadius: 14, padding: '16px', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn variant="ghost" icon={<ChevR size={14} style={{ transform: 'scaleX(-1)' }} />} onClick={onDone}>{t('setup.wizard.success.backToList')}</Btn>
        <Btn variant="secondary" icon={<Pin size={14} />} onClick={() => navigate(`/setup/locations/${locId}`)}>{t('setup.wizard.success.viewLocation')}</Btn>
        <Btn variant="primary" icon={<Users size={14} />} onClick={() => navigate(`/setup/locations/${locId}`, { state: { scrollTo: 'staff' } })}>{t('setup.wizard.success.assignStaff')}</Btn>
      </div>
    </div>
  );
}

function WizColorPicker({ value, onChange }: Readonly<{ value: string; onChange: (c: string) => void }>) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
      {COLOR_PALETTE.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 28, height: 28, borderRadius: 7, background: c, border: 'none',
          cursor: 'pointer', outline: c === value ? `3px solid ${c}` : '2px solid transparent', outlineOffset: 2,
          boxShadow: c === value ? '0 0 0 1.5px #fff inset, 0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.12)',
          transform: c === value ? 'scale(1.18)' : 'scale(1)', transition: 'all 120ms'
        }} />
      ))}
    </div>
  );
}

function ErrMsg({ children }: Readonly<{ children: ReactNode }>) {
  return <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
    <Alert size={12} stroke="#DC2626" />{children}
  </div>;
}
