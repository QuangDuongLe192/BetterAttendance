import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tag, Eyebrow, Skeleton, SkeletonCard, ErrorBanner, Avatar } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
const Pin = Icons.pin;
const Briefcase = Icons.briefcase;
const Users = Icons.users;
const Arrow = Icons.arrow;
const Check = Icons.check;
const Dot = Icons.dot;
import { SETUP_STATS, SETUP_PROGRESS, TODAY_SUMMARY, AUDIT } from '../../../services/setup';
import type { ProgressKey, TodaySummary } from '../../../services/setup';
import { fmtMs } from '../../../lib/fmt';
import { useAuth } from '../../../stores/AuthContext';

interface Props { onNav: (id: string) => void; isLoading?: boolean; error?: string | null; }

export function Overview({ onNav, isLoading, error }: Readonly<Props>) {
  const { t } = useTranslation('setup');
  const { user } = useAuth();
  if (isLoading) return <SetupOverviewSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const progressLabels: Record<ProgressKey, string> = {
    roles: t('setup.overview.progress.roles'),
    locations: t('setup.overview.progress.locations'),
    shift_templates: t('setup.overview.progress.shiftTemplates'),
    delegated_perms: t('setup.overview.progress.delegatedPerms'),
  };

  function progressCount(key: ProgressKey, data: Record<string, unknown>): string {
    switch (key) {
      case 'roles': return t('setup.overview.progress.count.roles', { configured: data.configured, total: data.total });
      case 'locations': return t('setup.overview.progress.count.locations', { total: data.total });
      case 'shift_templates': return t('setup.overview.progress.count.shiftTemplates', { total: data.total });
      case 'delegated_perms': return t('setup.overview.progress.count.delegatedPerms', { configured: data.configured, total: data.total });
    }
  }

  const stats = SETUP_STATS ?? {};
  const { locations, roles, staff } = stats;
  const rateRange = roles ? `${new Intl.NumberFormat('vi-VN').format(roles.minRate)} – ${new Intl.NumberFormat('vi-VN').format(roles.maxRate)} /giờ` : '—';

  const progress = SETUP_PROGRESS ?? [];
  const progressDone  = progress.filter(p => p.done).length;
  const progressTotal = progress.length;
  const setupPct = progressTotal > 0 ? Math.round(progressDone / progressTotal * 100) : 0;
  const delegatedItem = progress.find(p => p.key === 'delegated_perms');

  return (
    <div style={{ margin: '-40px -40px -80px', padding: '36px 40px 80px', position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 72px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)' }}>

      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.4); opacity:.6; } }
        @keyframes pulseRing{ 0% { transform:scale(.85); opacity:.7; } 100% { transform:scale(2); opacity:0; } }
        @keyframes shimmer  { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        .anim-card { animation: fadeUp 480ms ease both; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%',  width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.26) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%',  width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '45%',  left: '50%',   width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,140,124,0.14) 0%, transparent 60%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Hero ── */}
      <div className="anim-card" style={{ marginBottom: 40, animationDelay: '0ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#00B4A0', animation: 'pulseRing 1.6s ease-out infinite' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#00B4A0', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#00B4A0' }}>
            {t('setup.overview.eyebrow')}
          </span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, maxWidth: 800 }}>
          {t('setup.overview.greeting')}{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00B4A0 0%, #008C7C 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {user?.name.split(' ').slice(-2).join(' ')}
          </span>
          .
        </h1>
        <p style={{ fontSize: 16, color: '#6B7E8E', marginTop: 10, lineHeight: 1.5 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1E2D3D' }}>
            {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}{' '}
          </span>
          {t('setup.overview.tagline')}
        </p>
      </div>

      {/* ── Bento stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'repeat(3, 1fr)', gap: 16, marginBottom: 36, minHeight: 340 }}>
        {/* Completion card: spans all 3 rows on left */}
        <CompletionCard pct={setupPct} done={progressDone} total={progressTotal} progress={progress} progressLabels={progressLabels} progressCount={progressCount} style={{ gridColumn: 1, gridRow: '1 / span 3' }} delay={80} t={t} />
        {/* 3 small stats stacked on right */}
        <StatCard label={t('setup.overview.stat.locations')} value={locations?.total.toString() ?? '—'} sub={t('setup.overview.stat.locations.sub', { n: locations?.active ?? 0 })} icon={<Pin size={18} stroke="#00B4A0" />} delay={160} />
        <StatCard label={t('setup.overview.stat.roles')} value={roles?.total.toString() ?? '—'} sub={`Lương ${rateRange}`} icon={<Briefcase size={18} stroke="#00B4A0" />} delay={220} />
        <StatCard label={t('setup.overview.stat.staff')} value={staff?.total.toString() ?? '—'} sub={t('setup.overview.stat.staff.sub', { n: staff?.managers ?? 0 })} icon={<Users size={18} stroke="#00B4A0" />} delay={280} />
      </div>

      {/* ── Today panel ── */}
      <div className="anim-card" style={{ marginBottom: 48, animationDelay: '320ms' }}>
        <TodayPanel summary={TODAY_SUMMARY ?? {} as TodaySummary} t={t} />
      </div>

      {/* ── Modules ── */}
      <div className="anim-card" style={{ marginBottom: 12, animationDelay: '380ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                      <Eyebrow style={{ marginBottom: 8 }}>{t('setup.overview.allModules')}</Eyebrow>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        <ModuleCard icon="pin"      title={t('setup.overview.module.locations.title')} desc={t('setup.overview.module.locations.desc')} count={t('setup.overview.module.locations.count', { n: locations?.total ?? 0 })} onClick={() => onNav('locations')} delay={400} />
        <ModuleCard icon="briefcase" title={t('setup.overview.module.roles.title')} desc={t('setup.overview.module.roles.desc')} count={t('setup.overview.module.roles.count', { n: roles?.total ?? 0 })} onClick={() => onNav('roles')} delay={450} />
        <ModuleCard icon="users"    title={t('setup.overview.module.staff.title')} desc={t('setup.overview.module.staff.desc')} count={t('setup.overview.module.staff.count', { n: staff?.total ?? 0 })} onClick={() => onNav('staff')} delay={500} />
        <ModuleCard icon="coins"    title={t('setup.overview.module.payRules.title')} desc={t('setup.overview.module.payRules.desc')} count="—" onClick={() => onNav('payrules')} delay={540} />
        <ModuleCard icon="shield"   title={t('setup.overview.module.delegated.title')} desc={t('setup.overview.module.delegated.desc')} count={delegatedItem ? progressCount('delegated_perms', delegatedItem.data) : '—'} onClick={() => onNav('delegated')} delay={580} />
      </div>

      {/* ── Audit log ── */}
      <div className="anim-card" style={{ marginTop: 48, animationDelay: '600ms' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>{t('setup.overview.recentActivity')}</Eyebrow>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E2D3D' }}>{t('setup.overview.recentChanges')}</h3>
          </div>
          <button onClick={() => onNav('audit')} style={{ background: 'transparent', border: 'none', color: '#00B4A0', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {t('setup.overview.viewAllLog')} <Arrow size={14} />
          </button>
        </div>
        <Card pad={false} style={glass}>
          {(AUDIT ?? []).slice(0, 4).map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 220px 1fr 1fr', padding: '18px 24px', gap: 24, alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(200,212,220,0.4)' : 'none' }}>
              <div style={{ fontSize: 12, color: '#6B7E8E' }}>{fmtMs(a.t)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={a.actor.name} size={26} />
                <span style={{ fontSize: 13, color: '#1E2D3D', fontWeight: 500 }}>{a.actor.name}</span>
              </div>
              <div style={{ fontSize: 13, color: '#3A4F63' }}>
                <span style={{ fontSize: 12, color: '#6B7E8E' }}>{a.event}</span>
                <span style={{ margin: '0 8px' }}>·</span>
                {a.target}
              </div>
              <div style={{ fontSize: 12, color: '#6B7E8E' }}>
                {a.before != null && <span style={{ textDecoration: 'line-through' }}>{a.before}</span>}
                {a.before != null && <span style={{ margin: '0 6px' }}>→</span>}
                <span style={{ color: '#1E2D3D', fontWeight: 500 }}>{a.after}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
      </div>
    </div>
  );
}

const glass = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
} satisfies React.CSSProperties;

function CompletionCard({ pct, done, total, progress, progressLabels, progressCount, style, delay = 0, t }: Readonly<{
  pct: number; done: number; total: number;
  progress: typeof SETUP_PROGRESS;
  progressLabels: Record<ProgressKey, string>;
  progressCount: (key: ProgressKey, data: Record<string, unknown>) => string;
  style?: React.CSSProperties; delay?: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}>) {
  const r = 48, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const today = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return (
    <div className="anim-card" style={{
      background: 'rgba(30,45,61,0.84)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(30,45,61,0.20), inset 0 1px 0 rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '28px 28px', display: 'flex', flexDirection: 'column',
      animationDelay: `${delay}ms`, ...style,
    }}>
      {/* Top: label + ring side by side */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(0,180,160,0.85)', marginBottom: 10 }}>{t('setup.overview.completion.label')}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 60, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1 }}>
            {pct}<span style={{ fontSize: 26, color: 'rgba(255,255,255,0.4)' }}>%</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>{t('setup.overview.completion.items', { done, total })}</div>
        </div>
        <svg width="108" height="108" viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle cx="54" cy="54" r={r} fill="none" stroke="#00B4A0" strokeWidth="8"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 54 54)" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          <text x="54" y="51" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800" fontFamily="var(--font-display)">{pct}%</text>
          <text x="54" y="66" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="var(--font-display)">{t('setup.overview.completion.done')}</text>
        </svg>
      </div>

      {/* Overall bar */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: 5, borderRadius: 999, background: 'linear-gradient(to right, #00B4A0, #007A6E)', width: `${pct}%`, transition: 'width 1.2s ease' }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 18 }} />

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {progress.map(p => (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{
              width: 20, height: 20, borderRadius: 999, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: p.done ? 'rgba(0,180,160,0.22)' : 'rgba(255,255,255,0.05)',
              border: `1.5px ${p.done ? 'solid #00B4A0' : 'dashed rgba(255,255,255,0.18)'}`,
            }}>
              {p.done && <Check size={10} stroke="#00B4A0" />}
            </span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: p.done ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)' }}>
              {progressLabels[p.key]}
            </span>
            <span style={{ fontSize: 11, color: p.done ? '#00B4A0' : 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
              {progressCount(p.key, p.data)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{today}</span>
        {total - done > 0
          ? <span style={{ fontSize: 11.5, color: 'rgba(0,180,160,0.75)', fontWeight: 600, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('setup.overview.completion.remaining', { n: total - done })}
            </span>
          : <span style={{ fontSize: 11.5, color: '#00B4A0', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{t('setup.overview.completion.allDone')}</span>
        }
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent, delay = 0 }: Readonly<{ label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean; delay?: number }>) {
  return (
    <div className="anim-card" style={{ animationDelay: `${delay}ms` }}>
    <Card style={{ padding: 20, height: '100%', ...glass,
      ...(accent ? { background: 'rgba(30,45,61,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 20px rgba(30,45,61,0.18)', color: '#fff' } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: accent ? '#6AB3E8' : '#6B7E8E', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{label}</div>
        </div>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: accent ? 'rgba(0,180,160,0.15)' : '#F7F9FA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', color: accent ? '#fff' : '#1E2D3D', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: accent ? '#C8D4DC' : '#6B7E8E' }}>{sub}</div>
    </Card>
    </div>
  );
}


function TodayPanel({ summary, t }: Readonly<{ summary: TodaySummary; t: (key: string, opts?: Record<string, unknown>) => string }>) {
  const d = new Date(summary.date);
  const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(d);
  const clockedPct = Math.round(summary.clockedIn / summary.scheduledShifts * 100);
  const latePct = Math.round(summary.late / summary.scheduledShifts * 100);
  const absentPct = Math.round(summary.absent / summary.scheduledShifts * 100);

  return (
    <Card style={{ background: 'rgba(30,45,61,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(30,45,61,0.18)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 28, background: 'linear-gradient(180deg, #1E2D3D 0%, #2A3B4D 100%)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, color: '#00B4A0', textTransform: 'uppercase' }}>{t('setup.overview.today.label')} · {dateLabel}</div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 12, textTransform: 'capitalize' }}>{weekday}</h3>
      </div>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <TodayStat label={t('setup.overview.today.scheduledShifts')} value={summary.scheduledShifts.toString()} />
        <TodayStat label={t('setup.overview.today.clockedIn')} value={summary.clockedIn.toString()} tag={<Tag tone="success">{clockedPct}%</Tag>} />
        <TodayStat label={t('setup.overview.today.late')} value={summary.late.toString()} tag={<Tag tone="warning">{latePct}%</Tag>} />
        <TodayStat label={t('setup.overview.today.absent')} value={summary.absent.toString()} tag={<Tag tone="danger">{absentPct}%</Tag>} />
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#C8D4DC' }}>{t('setup.overview.today.realtime')}</span>
        <a href="/manager/home/all" style={{ color: '#00B4A0', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {t('setup.overview.today.viewLive')} <Arrow size={13} />
        </a>
      </div>
    </Card>
  );
}

function TodayStat({ label, value, tag }: Readonly<{ label: string; value: string; tag?: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: '#fff' }}>{value}</span>
        {tag}
      </div>
    </div>
  );
}

function ModuleCard({ icon, title, desc, count, warn, onClick, delay = 0 }: Readonly<{ icon: string; title: string; desc: string; count: string; warn?: string; onClick: () => void; delay?: number }>) {
  const [hover, setHover] = useState(false);
  const IconComp = Icons[icon as keyof typeof Icons];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="anim-card"
      style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: 24, borderRadius: 8, cursor: 'pointer',
        animationDelay: `${delay}ms`,
        ...glass,
        transform: hover ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hover
          ? '0 16px 40px rgba(30,45,61,0.13), 0 0 0 1.5px rgba(0,180,160,0.35), inset 0 1px 0 rgba(255,255,255,0.85)'
          : glass.boxShadow,
        transition: 'transform 220ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 220ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{
          width: 40, height: 40, borderRadius: 8,
          background: hover ? '#00B4A0' : 'rgba(0,180,160,0.1)',
          border: `1.5px solid ${hover ? '#00B4A0' : 'rgba(0,180,160,0.2)'}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms, border-color 200ms',
        }}>
          <IconComp size={20} stroke={hover ? '#fff' : '#00B4A0'} />
        </span>
        <span style={{
          transform: hover ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 200ms cubic-bezier(0.2,0.7,0.2,1)',
          display: 'flex',
        }}>
          <Arrow size={16} stroke={hover ? '#00B4A0' : '#6B7E8E'} />
        </span>
      </div>
      <div>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', marginBottom: 4,
          transition: 'color 200ms' }}>{title}</h4>
        <p style={{ fontSize: 13, color: '#6B7E8E', lineHeight: 1.55 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
        <Tag tone="neutral">{count}</Tag>
        {warn && <Tag tone="warning" icon={<Dot size={8} />}>{warn}</Tag>}
      </div>
    </div>
  );
}

function SetupOverviewSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={240} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
