import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useNavigate } from 'react-router';
import { Icons } from '../../components/Icons';
import { useAuth, type AccessRow, type CurrentUser } from '../../stores/AuthContext';
import { TopBar } from '../../components/TopBar';
import { LOCATIONS, locById } from '../../services/setup';

const locDelegation = (locId: string) =>
  LOCATIONS.find(l => l.locationId === locId)?.delegation;


// ─── Workspace definitions ────────────────────────────────────────────────────
interface WorkspaceDef {
  id: 'setup' | 'manager' | 'finance';
  code: string;
  full: string;
  desc: string;
  role: 'ADMIN' | 'MANAGER' | 'FINANCE';
  accent: string;
  icon: keyof typeof Icons;
  route: string;
}
const WORKSPACES: Record<string, WorkspaceDef> = {
  setup: {
    id: 'setup', code: '01',
    full: 'landing.workspace.setup.full',
    desc: 'landing.workspace.setup.desc',
    role: 'ADMIN', accent: '#1E2D3D', icon: 'settings', route: '/setup',
  },
  manager: {
    id: 'manager', code: '02',
    full: 'landing.workspace.manager.full',
    desc: 'landing.workspace.manager.desc',
    role: 'MANAGER', accent: '#00B4A0', icon: 'briefcase', route: '/manager',
  },
  finance: {
    id: 'finance', code: '03',
    full: 'landing.workspace.finance.full',
    desc: 'landing.workspace.finance.desc',
    role: 'FINANCE', accent: '#2B7EC4', icon: 'coins', route: '/finance',
  },
};

// ─── Live stats per workspace ─────────────────────────────────────────────────
interface Stat { k: string; v: string; }
interface WsLive { stats: Stat[]; }
// Stat keys are i18n keys resolved at render time
const WS_LIVE_KEYS: Record<string, WsLive> = {
  setup:   { stats: [{ k: 'landing.stats.setup.locations', v: '5' }, { k: 'landing.stats.setup.staff', v: '78' }, { k: 'landing.stats.setup.roles', v: '6' }] },
  manager: { stats: [{ k: 'landing.stats.manager.working', v: '24/32' }, { k: 'landing.stats.manager.pending', v: '6' }, { k: 'landing.stats.manager.late', v: '3' }] },
  finance: { stats: [{ k: 'landing.stats.finance.period', v: 'T5/26' }, { k: 'landing.stats.finance.review', v: '2/12' }, { k: 'landing.stats.finance.closing', v: '05/06' }] },
};

// ─── Access derivation ────────────────────────────────────────────────────────
interface DerivedAccess {
  visible: (WorkspaceDef & { locs: string[]; scope: 'global' | 'scoped' })[];
  defaultId: string | null;
  hasAdmin: boolean;
  mgrLocs: string[];
  finLocs: string[];
}

function resolveDefaultId(hasAdmin: boolean, mgrLocs: string[], finLocs: string[]): string | null {
  if (hasAdmin) return 'setup';
  if (mgrLocs.length) return 'manager';
  if (finLocs.length) return 'finance';
  return null;
}

function deriveAccess(access: AccessRow[]): DerivedAccess {
  const hasAdmin = access.some(a => a.type === 'ADMIN');
  const mgrLocs = [...new Set(access.filter(a => a.type === 'MANAGER' && a.locationId).map(a => a.locationId as string))];
  const finEntries = access.filter(a => a.type === 'FINANCE');
  const finOrgWide = finEntries.some(a => a.locationId === null);
  const finLocsRaw = [...new Set(finEntries.filter(a => a.locationId).map(a => a.locationId as string))];
  const allLocIds = LOCATIONS.map(l => l.locationId);
  const finGlobal = hasAdmin || finOrgWide;
  const finLocs = finOrgWide ? allLocIds : finLocsRaw;

  const visible: DerivedAccess['visible'] = [];
  if (hasAdmin) {
    visible.push({ ...WORKSPACES.setup, locs: allLocIds, scope: 'global' });
  }
  if (hasAdmin || mgrLocs.length) {
    visible.push({
      ...WORKSPACES.manager,
      locs: hasAdmin ? allLocIds : mgrLocs,
      scope: hasAdmin ? 'global' : 'scoped',
    });
  }
  if (finGlobal || finLocs.length) {
    visible.push({
      ...WORKSPACES.finance,
      locs: finGlobal ? allLocIds : finLocs,
      scope: finGlobal ? 'global' : 'scoped',
    });
  }

  return { visible, defaultId: resolveDefaultId(hasAdmin, mgrLocs, finLocs), hasAdmin, mgrLocs, finLocs };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const DAY_KEYS = [
  'landing.date.sunday',
  'landing.date.monday',
  'landing.date.tuesday',
  'landing.date.wednesday',
  'landing.date.thursday',
  'landing.date.friday',
  'landing.date.saturday',
] as const;

function useFormattedDate() {
  const { t } = useTranslation('common');
  const d = new Date();
  return t('landing.date.format', {
    day: t(DAY_KEYS[d.getDay()]),
    date: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  });
}

function useGreeting() {
  const { t } = useTranslation('common');
  const h = new Date().getHours();
  if (h < 10) return t('landing.greeting.morning');
  if (h < 13) return t('landing.greeting.noon');
  if (h < 18) return t('landing.greeting.afternoon');
  return t('landing.greeting.evening');
}

// ─── Small atoms ──────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'STAFF' }) {
  const palette = {
    ADMIN:   { bg: '#1E2D3D', fg: '#fff' },
    MANAGER: { bg: '#E6F8F6', fg: '#008C7C' },
    FINANCE: { bg: '#e9f6ff', fg: '#2B7EC4' },
    STAFF:   { bg: '#F0F3F5', fg: '#6B7E8E' },
  }[role];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: palette.bg, color: palette.fg, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />
      {role}
    </span>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function Hero({ user, derived }: { user: CurrentUser; derived: DerivedAccess }) {
  const { t } = useTranslation('common');
  const greeting = useGreeting();
  const dateStr = useFormattedDate();

  return (
    <section style={{
      background: 'rgba(255,255,255,0.52)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderBottom: '1px solid rgba(255,255,255,0.55)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6), 0 4px 24px rgba(30,45,61,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 40px 48px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#00B4A0', marginBottom: 14 }}>
          {dateStr}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.025em', color: '#1E2D3D', margin: 0, maxWidth: 900 }}>
          {greeting}, <span style={{ color: '#00B4A0' }}>{user.name.split(' ').slice(-2).join(' ')}</span>.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: '#3A4F63', marginTop: 14, marginBottom: 0, maxWidth: 680 }}>
          {t('landing.hero.subtitle')}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 26, paddingTop: 24, borderTop: '1px solid #E8ECEF' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#6B7E8E', marginRight: 4 }}>{t('landing.hero.grantedRoles')}</span>
          {derived.hasAdmin && <RoleBadge role="ADMIN" />}
          {derived.mgrLocs.length > 0 && <RoleBadge role="MANAGER" />}
          {derived.finLocs.length > 0 && <RoleBadge role="FINANCE" />}
          {!derived.hasAdmin && !derived.mgrLocs.length && !derived.finLocs.length && <RoleBadge role="STAFF" />}
        </div>
      </div>
    </section>
  );
}

// ─── Workspace card ───────────────────────────────────────────────────────────
type VisibleWorkspace = DerivedAccess['visible'][number];

function WorkspaceCard({ ws, onOpen }: { ws: VisibleWorkspace; onOpen: () => void }) {
  const { t } = useTranslation('common');
  const [hover, setHover] = useState(false);
  const live = WS_LIVE_KEYS[ws.id];
  const Icon = Icons[ws.icon];
  const Grid = Icons.grid;
  const ArrowR = Icons.arrowR;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', color: '#1E2D3D',
        background: 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.65)',
        borderTop: `3px solid ${ws.accent}`,
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover
          ? `0 20px 48px rgba(30,45,61,0.14), 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.85)`
          : `0 4px 16px rgba(30,45,61,0.07), 0 0 0 1px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.7)`,
        transition: 'transform 220ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 220ms',
        minHeight: 440,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 26px', borderBottom: '1px solid rgba(200,212,220,0.45)', background: `linear-gradient(to right, ${ws.accent}20, transparent 80%)` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9EAFBD' }}>{ws.code}</span>
        <span style={{ width: 1, height: 14, background: '#E8ECEF', margin: '0 12px' }} />
        <RoleBadge role={ws.role} />
      </div>

      <div style={{ padding: '28px 26px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 10, background: '#F7F9FA', border: '1px solid #E8ECEF', marginBottom: 18 }}>
            <Icon size={22} stroke={ws.accent} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.015em', color: '#1E2D3D', margin: 0, lineHeight: 1.15 }}>{t(ws.full)}</h2>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#3A4F63', margin: '14px 0 0' }}>{t(ws.desc)}</p>
      </div>

      <div style={{ padding: '18px 26px', borderTop: '1px solid #E8ECEF', display: 'grid', gridTemplateColumns: `repeat(${live.stats.length}, 1fr)`, gap: 12 }}>
        {live.stats.map((s, i) => (
          <div key={i} style={{ minWidth: 0, paddingLeft: i > 0 ? 12 : 0, borderLeft: i > 0 ? '1px solid #E8ECEF' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: '#1E2D3D', letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.v}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#00B4A0', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(s.k)}</div>
          </div>
        ))}
      </div>


      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px 26px 22px', borderTop: '1px solid #E8ECEF' }}>
        {/* Scope header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Icons.pin size={11} stroke="#6B7E8E" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B7E8E' }}>
            {ws.scope === 'global'
              ? t('landing.workspace.scope.global', { count: LOCATIONS.length })
              : t('landing.workspace.scope.scoped', { count: ws.locs.length })}
          </span>
        </div>

        {/* Scope content */}
        {ws.scope === 'global' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#EAF3FB', border: '1px solid rgba(43,126,196,0.15)' }}>
            <Grid size={13} stroke="#2B7EC4" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2B7EC4', fontFamily: 'var(--font-display)' }}>{t('landing.workspace.scope.admin_badge')}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ws.locs.slice(0, 4).map(id => {
              const loc = locById(id);
              if (!loc) return null;
              return (
                <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: '#F0F3F5', border: '1px solid #E8ECEF', fontSize: 11.5, fontWeight: 600, color: '#1E2D3D', fontFamily: 'var(--font-body)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: loc.style.color, flexShrink: 0 }} />
                  {loc.name}
                </span>
              );
            })}
            {ws.locs.length > 4 && (
              <span style={{ padding: '4px 10px', borderRadius: 6, background: '#F0F3F5', border: '1px solid #E8ECEF', fontSize: 11.5, fontWeight: 700, color: '#6B7E8E' }}>
                {t('landing.workspace.card.more', { count: ws.locs.length - 4 })}
              </span>
            )}
          </div>
        )}

        {/* Permissions row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, background: hover ? '#008C7C' : '#1E2D3D', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, transition: 'background 150ms' }}>
            {t('landing.workspace.card.open')} <ArrowR size={14} stroke="#fff" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Locked card ──────────────────────────────────────────────────────────────
function LockedCard({ ws }: Readonly<{ ws: WorkspaceDef }>) {
  const { t } = useTranslation('common');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: '#6B7E8E', borderRadius: 14, padding: '24px 26px', minHeight: 440, justifyContent: 'space-between', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px dashed rgba(200,212,220,0.8)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9EAFBD' }}>{ws.code}</span>
          <span style={{ width: 1, height: 14, background: '#C8D4DC' }} />
          <RoleBadge role={ws.role} />
        </div>
        <Icons.lock size={22} stroke="#9EAFBD" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#3A4F63', margin: '14px 0 4px', letterSpacing: '-0.01em' }}>{t(ws.full)}</h2>
        <p style={{ fontSize: 13, color: '#6B7E8E', margin: '8px 0 0', lineHeight: 1.55 }}>
          {t('landing.workspace.locked.no_access', { role: ws.role })}
        </p>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: '#9EAFBD' }}>{t('landing.workspace.locked.hidden')}</div>
    </div>
  );
}

// ─── Landing root ─────────────────────────────────────────────────────────────
export function Landing() {
  const { t } = useTranslation('common');
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const derived = useMemo(() => deriveAccess(user?.access ?? []), [user]);
  usePageTitle('Workspace Hub');

  if (!user) return null;

  const allCards = (['setup', 'manager', 'finance'] as const).map(id => {
    const own = derived.visible.find(w => w.id === id);
    return own
      ? { kind: 'open' as const, ws: own }
      : { kind: 'locked' as const, ws: WORKSPACES[id] };
  });
  const showCards = allCards.filter(c => c.kind === 'open');
  const n = showCards.length;
  const gridCols = n === 1 ? '460px' : n === 2 ? '1fr 1fr' : '1fr 1fr 1fr';

  const openWorkspace = (id: string) => {
    const routes: Record<string, string> = { setup: '/setup', manager: '/manager', finance: '/finance' };
    nav(routes[id] || '/');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)' }}>

      {/* Background blobs — brand teal + slate only */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.30) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%',  width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '35%',  left: '40%',    width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,140,124,0.16) 0%, transparent 60%)' }} />
      </div>

      {/* Content — above blobs */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
        <Hero user={user} derived={derived} />

        <section style={{ padding: '40px 40px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#007A6E', marginBottom: 8 }}>{t('landing.workspace.section.eyebrow')}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.015em', color: '#1E2D3D', margin: 0 }}>
                {derived.visible.length === 0
                  ? t('landing.workspace.section.heading_none')
                  : t('landing.workspace.section.heading_count', { count: derived.visible.length })}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 18, justifyContent: n === 1 ? 'center' : 'stretch' }}>
              {showCards.map(c =>
                c.kind === 'open'
                  ? <WorkspaceCard key={c.ws.id} ws={c.ws} onOpen={() => openWorkspace(c.ws.id)} />
                  : <LockedCard key={c.ws.id} ws={c.ws as WorkspaceDef} />
              )}
            </div>
          </div>
        </section>

        <section style={{ padding: '24px 40px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4A6070', fontSize: 12 }}>
              <span>{t('landing.footer.copyright')}</span>
              <span style={{ display: 'flex', gap: 18 }}>
                <a href="#" style={{ color: '#4A6070', textDecoration: 'none' }}>{t('landing.footer.privacy')}</a>
                <a href="#" style={{ color: '#4A6070', textDecoration: 'none' }}>{t('landing.footer.terms')}</a>
                <a href="#" onClick={e => { e.preventDefault(); logout(); nav('/login', { replace: true, state: { fromLogout: true } }); }} style={{ color: '#4A6070', textDecoration: 'none' }}>{t('landing.footer.logout')}</a>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
