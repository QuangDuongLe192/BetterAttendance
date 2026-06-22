import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useParams, useNavigate } from 'react-router';
import { ThemeCtx } from '../../components/UI';
import { Icons } from '../../components/Icons';
import { NotifBell } from '../../components/TopBar';
import { SidebarUserMenu } from '../../components/SidebarUserMenu';
import candylioLogoDark from '../../public/candylio-logo-mark-dark.svg';
import { STORE_TODAY, APPROVALS } from '../../services/manager';
import { LOCATIONS, locById } from '../../services/setup';
import { ApprovalDetailDrawer, APPROVAL_CTX } from './Approval/MgrApprovals';
import { useAuth } from '../../stores/AuthContext';
import { MgrHome } from './Home/MgrHome';
import { MgrAttendance } from './Roster/MgrAttendance';
import { MgrApprovals } from './Approval/MgrApprovals';
import { MgrSchedule } from './Schedule/MgrSchedule';
import { MgrStaff } from './Staff/MgrStaff';
import { MgrAnnounce } from './Announce/MgrAnnounce';

const NAV = [
  { id: 'home',      tKey: 'manager.nav.home',      icon: 'grid'     as const },
  { id: 'roster',    tKey: 'manager.nav.roster',    icon: 'check'    as const },
  { id: 'schedule',  tKey: 'manager.nav.schedule',  icon: 'calendar' as const },
  { id: 'staff',     tKey: 'manager.nav.staff',     icon: 'user'     as const },
  { id: 'approvals', tKey: 'manager.nav.approvals', icon: 'clock'    as const, badge: 6 },
  { id: 'announce',  tKey: 'manager.nav.announce',  icon: 'send'     as const },
] as const;

type SectionId = typeof NAV[number]['id'];

export function ManagerApp() {
  const { section, locId } = useParams<{ section?: string; locId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const active = (section as SectionId) || 'home';

  const { t } = useTranslation('manager');

  const curNav = NAV.find(n => n.id === active);
  usePageTitle(curNav ? t(curNav.tKey) : undefined, t('manager.breadcrumb.workspace'));

  const isAdmin = user?.access.some(a => a.type === 'ADMIN') ?? false;
  const mgrStores = isAdmin
    ? LOCATIONS.map(l => l.locationId)
    : [...new Set((user?.access ?? []).filter(a => a.type === 'MANAGER' && a.locationId).map(a => a.locationId as string))];

  const activeStore = locId ?? mgrStores[0] ?? 'all';
  const [storeOpen, setStoreOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const [handled, setHandled]         = useState<Record<string, 'approved' | 'rejected'>>({});
  const [rejectedReasons, setRejected] = useState<Record<string, string>>({});
  const [handledBy, setHandledBy]     = useState<Record<string, string>>({});
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [initReject, setInitReject]   = useState(false);

  const actorName = user?.name ?? t('manager.fallback.actor');

  const approve = (id: string) => {
    setHandled(prev => ({ ...prev, [id]: 'approved' }));
    setHandledBy(prev => ({ ...prev, [id]: actorName }));
    const a = (APPROVALS ?? []).find(x => x.id === id);
    toast.success(t('manager.toast.approved', { name: a?.staffName ?? id }));
  };
  const reject = (id: string, reason: string) => {
    setHandled(prev => ({ ...prev, [id]: 'rejected' }));
    if (reason) setRejected(prev => ({ ...prev, [id]: reason }));
    setHandledBy(prev => ({ ...prev, [id]: actorName }));
    const a = (APPROVALS ?? []).find(x => x.id === id);
    toast.error(t('manager.toast.rejected', { name: a?.staffName ?? id }));
  };
  const openDetail = (id: string, rejectMode = false) => {
    setDetailId(id);
    setInitReject(rejectMode);
  };

  const detailApproval = detailId ? (APPROVALS ?? []).find(a => a.id === detailId) ?? null : null;

  const workspaces = [
    ...(isAdmin ? [{ id: 'setup', label: t('manager.sidebar.workspace.setup'), sub: t('manager.sidebar.workspace.setupSub'), path: '/setup', current: false }] : []),
    { id: 'manager', label: t('manager.sidebar.workspace.manager'), sub: t('manager.sidebar.workspace.managerSub'), path: `/manager/home/${mgrStores[0] ?? 'all'}`, current: true },
    ...(isAdmin || (user?.access.some(a => a.type === 'FINANCE') ?? false) ? [{ id: 'finance', label: t('manager.sidebar.workspace.finance'), sub: t('manager.sidebar.workspace.financeSub'), path: '/finance', current: false }] : []),
  ];

  const onNav = (id: string) => navigate(`/manager/${id}/${activeStore}`);
  const store = activeStore === 'all' ? { name: t('manager.sidebar.store.all') } : locById(activeStore);
  const storeData = activeStore !== 'all' ? STORE_TODAY[activeStore] : undefined;

  const content: Record<SectionId, React.ReactNode> = {
    home: <MgrHome activeStore={activeStore} isLoading={isLoading} error={error} handled={handled} approve={approve} openDetail={openDetail} />,
    roster: <MgrAttendance activeStore={activeStore} isLoading={isLoading} error={error} />,
    schedule: <MgrSchedule activeStore={activeStore} isLoading={isLoading} error={error} />,
    staff: <MgrStaff activeStore={activeStore} isLoading={isLoading} error={error} />,
    approvals: <MgrApprovals isLoading={isLoading} error={error} handled={handled} handledBy={handledBy} approve={approve} openDetail={openDetail} />,
    announce: <MgrAnnounce isLoading={isLoading} error={error} />,
  };

  const cur = NAV.find(n => n.id === active);

  return (
    <>
    <ThemeCtx.Provider value={{ density: 'spacious', accent: '#00B4A0' }}>
      <style>{`
        .mgr-nav-item { transition: background 150ms, color 150ms; }
        .mgr-nav-item:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FA' }}>
        {/* Sidebar */}
        <aside style={{ width: 260, background: '#1E2D3D', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {/* Brand + Workspace switcher */}
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
            <button onClick={() => setWsOpen(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: wsOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}
              onMouseEnter={e => { if (!wsOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!wsOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
              <img src={candylioLogoDark} alt="Logo" style={{ height: 26, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Better Attendance</div>
                <div style={{ fontSize: 11, color: '#6AB3E8', fontWeight: 500, marginTop: 1 }}>{t('manager.sidebar.workspace.manager')}</div>
              </div>
              <Icons.chevD size={13} stroke="rgba(200,212,220,0.5)" style={{ flexShrink: 0, transform: wsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} />
            </button>

            {wsOpen && (
              <>
                <div onClick={() => setWsOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setWsOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 12, right: 12, zIndex: 50, background: '#243344', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
                  <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(106,179,232,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t('manager.sidebar.workspace.label')}</div>
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
                      <Icons.chevR size={11} stroke="currentColor" style={{ transform: 'scaleX(-1)' }} /> {t('manager.sidebar.workspace.backHub')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Store picker */}
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6AB3E8', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, paddingLeft: 4 }}>{t('manager.sidebar.store.label')}</div>
            {mgrStores.length === 1 ? (
              /* Single location — no dropdown */
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: locById(mgrStores[0])?.style.color ?? '#6B7E8E', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store?.name ?? mgrStores[0]}</span>
              </div>
            ) : (
              /* Multiple locations — dropdown with "Tất cả" */
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setStoreOpen(!storeOpen)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store?.name ?? t('manager.sidebar.store.all')}</span>
                    <span style={{ fontSize: 10, color: '#6AB3E8' }}>{t('manager.sidebar.store.countLocations', { count: mgrStores.length })}</span>
                  </span>
                  <Icons.chevD size={13} stroke="#C8D4DC" style={{ flexShrink: 0, transform: storeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                </button>

                {storeOpen && (
                  <>
                    <div onClick={() => setStoreOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setStoreOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#2A3B4D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
                      <button
                        onClick={() => { navigate(`/manager/${active}/all`); setStoreOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: activeStore === 'all' ? 'rgba(0,180,160,0.15)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <span style={{ width: 24, height: 24, borderRadius: 4, background: '#6B7E8E', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>All</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{t('manager.sidebar.store.all')}</div>
                        </div>
                        {activeStore === 'all' && <Icons.check size={12} stroke="#00B4A0" />}
                      </button>
                      {mgrStores.map(sid => {
                        const s = locById(sid);
                        return (
                          <button
                            key={sid}
                            onClick={() => { navigate(`/manager/${active}/${sid}`); setStoreOpen(false); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: activeStore === sid ? 'rgba(0,180,160,0.15)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <span style={{ width: 24, height: 24, borderRadius: 4, background: s?.style.color ?? '#6B7E8E', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s?.name ?? sid}</div>
                            </div>
                            {activeStore === sid && <Icons.check size={12} stroke="#00B4A0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
                  className="mgr-nav-item"
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 8, background: isActive ? 'rgba(0,180,160,0.15)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: isActive ? '#fff' : 'rgba(200,212,220,0.75)', borderLeft: isActive ? '3px solid #00B4A0' : '3px solid transparent', paddingLeft: isActive ? 9 : 11 }}
                >
                  <IconComp size={16} stroke={isActive ? '#5AE4D4' : 'rgba(200,212,220,0.65)'} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: isActive ? 600 : 450, letterSpacing: isActive ? '-0.01em' : 'normal' }}>{t(s.tKey)}</span>
                  {'badge' in s && s.badge ? (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: isActive ? 'rgba(90,228,212,0.2)' : '#B45309', color: isActive ? '#5AE4D4' : '#fff' }}>
                      {s.badge}
                    </span>
                  ) : null}
                  {isActive && !('badge' in s && s.badge) && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5AE4D4', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 12 }}>
            <SidebarUserMenu avatarColor="#00B4A0" />
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: 'rgba(247,249,250,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,212,220,0.45)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 12px rgba(30,45,61,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 40px', height: 72 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <span style={{ color: '#9BAAB5', fontWeight: 500 }}>{t('manager.breadcrumb.workspace')}</span>
                <Icons.chevR size={12} stroke="#C8D4DC" />
                {cur && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {(() => { const I = Icons[cur.icon]; return <I size={14} stroke="#00B4A0" />; })()}
                    <span style={{ color: '#1E2D3D', fontWeight: 700 }}>{t(cur.tKey)}</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }} />
              {/* Pulse indicator */}

              {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F7F9FA', border: '1px solid #E8ECEF', borderRadius: 6, width: 240 }}>
                <Icons.search size={14} stroke="#6B7E8E" />
                <input placeholder="Tìm kiếm…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1E2D3D', flex: 1, minWidth: 0 }} />
              </div> */}
              <NotifBell />
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: '35px 40px 80px' }}>
            {content[active] ?? <MgrHome activeStore={activeStore} isLoading={isLoading} error={error} />}
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
    {detailApproval && (
      <ApprovalDetailDrawer
        approval={detailApproval}
        ctx={APPROVAL_CTX[detailApproval.id]}
        handled={handled[detailApproval.id]}
        handledBy={handledBy[detailApproval.id]}
        rejectedReason={rejectedReasons[detailApproval.id]}
        initialRejectMode={initReject}
        onClose={() => { setDetailId(null); setInitReject(false); }}
        onApprove={id => { approve(id); setDetailId(null); }}
        onReject={(id, reason) => { reject(id, reason); setDetailId(null); }}
      />
    )}
    </>
  );
}
