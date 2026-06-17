import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../stores/AuthContext';
import { ThemeCtx } from '../../components/UI';
import { Icons } from '../../components/Icons';
import { NotifBell } from '../../components/TopBar';
import { SidebarUserMenu } from '../../components/SidebarUserMenu';
import candylioLogoDark from '../../public/candylio-logo-mark-dark.svg';
import { ConfirmLeaveDialog } from '../../components/ConfirmLeaveDialog';
import { NewLocationWizard } from './Locations/NewLocationWizard';
import { Overview } from './OverView/Overview';
import { Locations } from './Locations/Locations';
import { LocationsList } from './Locations/LocationsList';
import { Roles } from './Roles/Roles';
import { Staff } from './Staff/Staff';
import { Delegated } from './Delegated/Delegated';
import { AuditLog } from './AuditLog/AuditLog';

const NAV_IDS = ['overview', 'locations', 'roles', 'staff', 'delegated', 'audit'] as const;

type SectionId = typeof NAV_IDS[number];

interface WorkspaceDef {
  id: string;
  label: string;
  sub: string;
  path: string;
  current: boolean;
}

function buildWorkspaces(
  isAdmin: boolean,
  hasMgr: boolean,
  hasFinance: boolean,
  mgrPath: string,
  t: (k: string) => string,
): WorkspaceDef[] {
  return [
    { id: 'setup', label: t('setup.workspace.title'), sub: t('setup.workspace.sub'), path: '/setup', current: true },
    ...(hasMgr ? [{ id: 'manager', label: t('setup.workspace.manager.title'), sub: t('setup.workspace.manager.sub'), path: mgrPath, current: false }] : []),
    ...(hasFinance ? [{ id: 'finance', label: t('setup.workspace.finance.title'), sub: t('setup.workspace.finance.sub'), path: '/finance', current: false }] : []),
  ];
}

interface SectionProps {
  active: SectionId;
  subId?: string;
  onNav: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  onEditingChange: (v: boolean) => void;
  onDirtyRoles: (v: boolean) => void;
  onDirtyDelegated: (v: boolean) => void;
}

function renderSection({ active, subId, onNav, isLoading, error, onEditingChange, onDirtyRoles, onDirtyDelegated }: SectionProps) {
  if (active === 'overview') return <Overview onNav={onNav} isLoading={isLoading} error={error} />;
  if (active === 'locations') return subId
    ? <Locations openId={subId} isLoading={isLoading} error={error} onEditingChange={onEditingChange} />
    : <LocationsList isLoading={isLoading} error={error} />;
  if (active === 'roles') return <Roles isLoading={isLoading} error={error} onDirtyChange={onDirtyRoles} />;
  if (active === 'staff') return <Staff isLoading={isLoading} error={error} />;
  if (active === 'delegated') return <Delegated isLoading={isLoading} error={error} onDirtyChange={onDirtyDelegated} />;
  if (active === 'audit') return <AuditLog isLoading={isLoading} error={error} />;
  return <Overview onNav={onNav} isLoading={isLoading} error={error} />;
}

export function SetupApp() {
  const { t } = useTranslation('setup');
  const { section, subId } = useParams<{ section?: string; subId?: string }>();
  const navigate = useNavigate();
  const isNewLocation = section === 'locations-new';
  const active: SectionId = isNewLocation ? 'locations' : ((section as SectionId) || 'overview');

  const NAV = [
    { id: 'overview' as const, label: t('setup.nav.overview'), icon: 'grid' as const },
    { id: 'locations' as const, label: t('setup.nav.locations'), icon: 'pin' as const },
    { id: 'roles' as const, label: t('setup.nav.roles'), icon: 'briefcase' as const },
    { id: 'staff' as const, label: t('setup.nav.staff'), icon: 'users' as const },
    { id: 'delegated' as const, label: t('setup.nav.delegated'), icon: 'shield' as const },
    { id: 'audit' as const, label: t('setup.nav.audit'), icon: 'scroll' as const },
  ];

  const curNav = NAV.find(n => n.id === active);
  const setupSectionLabel = isNewLocation ? t('setup.breadcrumb.newLocation') : curNav?.label;
  usePageTitle(setupSectionLabel, t('setup.breadcrumb.root'));

  const [confirmPending, setConfirmPending] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isDirtyRoles, setIsDirtyRoles] = useState(false);
  const [isDirtyDelegated, setIsDirtyDelegated] = useState(false);

  const navigateSafe = (path: string) => {
    if (isNewLocation || isEditingLocation || isDirtyRoles || isDirtyDelegated) { setConfirmPending(path); return; }
    navigate(path);
  };

  const onNav = (id: string) => navigateSafe(`/setup/${id}`);
  const routerLocation = useLocation();
  const { user } = useAuth();
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [wsOpen, setWsOpen] = useState(false);

  const isAdmin = user?.access.some(a => a.type === 'ADMIN') ?? false;
  const mgrStores = isAdmin
    ? []
    : [...new Set((user?.access ?? []).filter(a => a.type === 'MANAGER' && a.locationId).map(a => a.locationId as string))];
  const mgrPath = mgrStores[0] ? `/manager/home/${mgrStores[0]}` : '/manager/home/all';
  const hasMgr = isAdmin || mgrStores.length > 0;
  const hasFinance = isAdmin || (user?.access.some(a => a.type === 'FINANCE') ?? false);
  const workspaces = buildWorkspaces(isAdmin, hasMgr, hasFinance, mgrPath, t);

  const cur = NAV.find(n => n.id === active);

  return (
    <ThemeCtx.Provider value={{ density: 'spacious', accent: '#00B4A0' }}>
      <style>{`
        @keyframes sectionFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-item { transition: background 150ms, color 150ms; }
        .nav-item:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FA' }}>

        {/* Sidebar */}
        <aside style={{
          width: 260, background: '#1E2D3D', color: '#fff',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }}>
          {/* Brand + Workspace switcher */}
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
            <button onClick={() => setWsOpen(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: wsOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}
              onMouseEnter={e => { if (!wsOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!wsOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
              <img src={candylioLogoDark} alt="Logo" style={{ height: 26, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Better Attendance</div>
                <div style={{ fontSize: 11, color: '#6AB3E8', fontWeight: 500, marginTop: 1 }}>{t('setup.workspace.title')}</div>
              </div>
              <Icons.chevD size={13} stroke="rgba(200,212,220,0.5)" style={{ flexShrink: 0, transform: wsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} />
            </button>

            {wsOpen && (
              <>
                <div onClick={() => setWsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 12, right: 12, zIndex: 50, background: '#243344', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
                  <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(106,179,232,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t('setup.workspace.switcher.label')}</div>
                  {workspaces.map(ws => (
                    <button key={ws.id} onClick={() => { navigate(ws.path); setWsOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: 'none', background: ws.current ? 'rgba(0,180,160,0.14)' : 'transparent', cursor: ws.current ? 'default' : 'pointer', textAlign: 'left', transition: 'background 100ms' }}
                      onMouseEnter={e => { if (!ws.current) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { if (!ws.current) e.currentTarget.style.background = 'transparent'; }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: ws.current ? 'rgba(0,180,160,0.25)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={candylioLogoDark} alt="" style={{ height: 16, opacity: ws.current ? 1 : 0.5 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: ws.current ? 700 : 500, color: ws.current ? '#fff' : 'rgba(200,212,220,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(155,170,181,0.7)', marginTop: 1 }}>{ws.sub}</div>
                      </div>
                      {ws.current && <Icons.check size={13} stroke="#5AE4D4" />}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6px 8px' }}>
                    <button onClick={() => { navigate('/'); setWsOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(200,212,220,0.5)', fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'color 120ms' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C8D4DC')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,212,220,0.5)')}>
                      <Icons.chevR size={11} stroke="currentColor" style={{ transform: 'scaleX(-1)' }} /> {t('setup.workspace.hub')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 10px', gap: 1 }}>
            {NAV.map(s => {
              const IconComp = Icons[s.icon];
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => onNav(s.id)}
                  className="nav-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '9px 11px', borderRadius: 8,
                    background: isActive ? 'rgba(0,180,160,0.15)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    color: isActive ? '#fff' : 'rgba(200,212,220,0.75)',
                    borderLeft: isActive ? '3px solid #00B4A0' : '3px solid transparent',
                    paddingLeft: isActive ? 9 : 11,
                  }}
                >
                  <IconComp size={16} stroke={isActive ? '#5AE4D4' : 'rgba(200,212,220,0.65)'} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: isActive ? 600 : 450, letterSpacing: isActive ? '-0.01em' : 'normal' }}>
                    {s.label}
                  </span>
                  {isActive && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5AE4D4', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: 12 }}>
            <SidebarUserMenu avatarColor="#2B7EC4" />
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Glass topbar */}
          <header style={{
            background: 'rgba(247,249,250,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(200,212,220,0.45)',
            position: 'sticky', top: 0, zIndex: 50,
            boxShadow: '0 1px 12px rgba(30,45,61,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', height: 72 }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <span style={{ color: '#9BAAB5', fontWeight: 500 }}>{t('setup.breadcrumb.root')}</span>
                <Icons.chevR size={12} stroke="#C8D4DC" />
                {isNewLocation ? (
                  <>
                    <button
                      onClick={() => navigateSafe('/setup/locations')}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#6B7E8E', fontFamily: 'inherit', fontWeight: 500 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#00B4A0')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6B7E8E')}
                    >{t('setup.breadcrumb.locations')}</button>
                    <Icons.chevR size={12} stroke="#C8D4DC" />
                    <span style={{ color: '#1E2D3D', fontWeight: 700 }}>{t('setup.breadcrumb.newLocation')}</span>
                  </>
                ) : active === 'locations' && subId ? (
                  <>
                    <button
                      onClick={() => navigate('/setup/locations')}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#6B7E8E', fontFamily: 'inherit', fontWeight: 500 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#00B4A0')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6B7E8E')}
                    >{t('setup.breadcrumb.locations')}</button>
                    <Icons.chevR size={12} stroke="#C8D4DC" />
                    <span style={{ color: '#1E2D3D', fontWeight: 700 }}>
                      {(routerLocation.state as { locationName?: string } | null)?.locationName ?? subId}
                    </span>
                  </>
                ) : (
                  <>
                    {cur && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {(() => { const I = Icons[cur.icon]; return <I size={14} stroke="#00B4A0" />; })()}
                        <span style={{ color: '#1E2D3D', fontWeight: 700 }}>{cur.label}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ flex: 1 }} />
              <NotifBell />
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: isNewLocation ? 0 : '40px 40px 80px' }}>
            {isNewLocation
              ? <NewLocationWizard onDone={() => navigate('/setup/locations')} />
              : renderSection({ active, subId, onNav, isLoading, error, onEditingChange: setIsEditingLocation, onDirtyRoles: setIsDirtyRoles, onDirtyDelegated: setIsDirtyDelegated })
            }
          </main>
        </div>
      </div>

      <ConfirmLeaveDialog
        open={confirmPending !== null}
        title={isNewLocation ? t('setup.wizard.leaveConfirm.title') : t('setup.locations.leaveConfirm.title')}
        body={isNewLocation ? t('setup.wizard.leaveConfirm.body') : t('setup.locations.leaveConfirm.body')}
        confirmLabel={isNewLocation ? t('setup.wizard.leaveConfirm.confirm') : t('setup.locations.leaveConfirm.confirm')}
        cancelLabel={isNewLocation ? t('setup.wizard.leaveConfirm.cancel') : t('setup.locations.leaveConfirm.cancel')}
        onConfirm={() => { const dest = confirmPending!; setConfirmPending(null); setIsEditingLocation(false); setIsDirtyRoles(false); setIsDirtyDelegated(false); navigate(dest); }}
        onCancel={() => setConfirmPending(null)}
      />
    </ThemeCtx.Provider>
  );
}
