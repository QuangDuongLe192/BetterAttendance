import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { Icons } from './Icons';
import { useAuth, getInitials } from '../stores/AuthContext';

const ChevD = Icons.chevD;
const Settings = Icons.settings;
const Alert = Icons.alert;
const Lock = Icons.lock;
const Bell = Icons.bell;
const Check = Icons.check;

// ─── Mock notifications ───────────────────────────────────────────────────────
interface Notif {
  id: string;
  type: 'overtime' | 'late' | 'absent' | 'system' | 'approval';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: Notif[] = [
  { id: 'n1',  type: 'overtime',  title: 'Yêu cầu tăng ca',          body: 'Nguyễn Văn An (Bến Thành) đề nghị tăng ca 30 phút — chờ duyệt.',        time: '5 phút trước',   read: false },
  { id: 'n2',  type: 'late',      title: 'Đến trễ',                   body: 'Trần Thị Bình vào ca 08:12 (trễ 12 phút) tại Thảo Điền.',                 time: '18 phút trước',  read: false },
  { id: 'n3',  type: 'overtime',  title: 'Yêu cầu tăng ca',          body: 'Lê Văn C (Phú Mỹ Hưng) đề nghị tăng ca 1 giờ — chờ duyệt.',              time: '42 phút trước',  read: false },
  { id: 'n4',  type: 'absent',    title: 'Vắng mặt tự động',         body: 'Hoàng Thị D không chấm công sau 120 phút — hệ thống ghi Vắng.',           time: '1 giờ trước',    read: true  },
  { id: 'n5',  type: 'approval',  title: 'Duyệt ca thành công',      body: 'Bạn đã duyệt tăng ca cho Phạm Văn E. Lương cập nhật tự động.',            time: '2 giờ trước',    read: true  },
  { id: 'n6',  type: 'system',    title: 'Cập nhật hệ thống',        body: 'Better Attendance v2.4 — thêm tính năng xếp ca nhiều địa điểm.',          time: 'Hôm qua',        read: true  },
  { id: 'n7',  type: 'late',      title: 'Đến trễ',                   body: 'Vũ Thị F (Quận 7) vào ca 09:21 (trễ 21 phút). Đã ghi nhận.',             time: '2 ngày trước',   read: true  },
  { id: 'n8',  type: 'overtime',  title: 'Tăng ca được duyệt',       body: 'Tăng ca 45 phút của Ngô Văn G (Bến Thành) đã được phê duyệt.',            time: '2 ngày trước',   read: true  },
  { id: 'n9',  type: 'absent',    title: 'Vắng không phép',          body: 'Đỗ Thị H vắng mặt không có lý do tại Thảo Điền — cần xác nhận.',          time: '3 ngày trước',   read: true  },
  { id: 'n10', type: 'approval',  title: 'Ca tuần mới đã xếp',       body: 'Lịch ca tuần 24 cho địa điểm Phú Mỹ Hưng đã được lưu thành công.',       time: '3 ngày trước',   read: true  },
  { id: 'n11', type: 'system',    title: 'Địa điểm mới được thêm',   body: 'Địa điểm "Bình Thạnh" vừa được khởi tạo — cần thiết lập ca và geofence.', time: '4 ngày trước',   read: true  },
  { id: 'n12', type: 'overtime',  title: 'Yêu cầu tăng ca',          body: 'Phạm Thị I (Quận 1) đề nghị tăng ca 2 giờ cuối tuần — chờ duyệt.',       time: '5 ngày trước',   read: true  },
  { id: 'n13', type: 'late',      title: 'Nhiều ca đến trễ',         body: '3 nhân viên đến trễ trong ca sáng tại Bến Thành — xem chi tiết báo cáo.',  time: '5 ngày trước',   read: true  },
  { id: 'n14', type: 'system',    title: 'Báo cáo tháng 5 sẵn sàng', body: 'Báo cáo chấm công & lương tháng 5/2025 đã có thể xuất ra Excel.',         time: '1 tuần trước',   read: true  },
];

const TYPE_CFG: Record<Notif['type'], { color: string; bg: string; icon: keyof typeof Icons; label: string }> = {
  overtime: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: 'clock',    label: 'Tăng ca'   },
  late:     { color: '#F97316', bg: 'rgba(249,115,22,0.1)',   icon: 'alert',    label: 'Đến trễ'   },
  absent:   { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',    icon: 'x',        label: 'Vắng mặt'  },
  approval: { color: '#00B4A0', bg: 'rgba(0,180,160,0.1)',    icon: 'check',    label: 'Duyệt'     },
  system:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   icon: 'settings', label: 'Hệ thống'  },
};

function CandylioMark({ size }: Readonly<{ size?: number }>) {
  return <img src="./src/public/candylio-logo-full.svg" style={{ height: size }} alt="Candylio Logo" />;
}

export function TopBar() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS);
  const [imgError, setImgError] = useState(false);

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-user-menu]')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-bell-menu]')) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  useEffect(() => { setImgError(false); }, [user?.avatarUrl]);

  if (!user) return null;

  const shortName = user.name.split(' ').slice(-2).join(' ');
  const showAvatar = user.avatarUrl && !imgError;

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #E8ECEF',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0 40px', height: 64,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CandylioMark size={35} />
          <span style={{ width: 1, height: 18, background: '#C8D4DC', margin: '0 6px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: '#1E2D3D' }}>
              Better Attendance
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div data-bell-menu style={{ position: 'relative' }}>
            <BellButton open={bellOpen} unread={unreadCount} onClick={() => { setBellOpen(v => !v); setMenuOpen(false); }} />
            {bellOpen && (
              <NotifPanel
                notifs={notifs}
                onMarkAll={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
                onRead={id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))}
              />
            )}
          </div>
          <span style={{ width: 1, height: 22, background: '#E8ECEF', margin: '0 8px' }} />

          {/* User pill */}
          <div data-user-menu style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 8px 6px 6px', borderRadius: 8, cursor: 'pointer',
                background: menuOpen ? '#F7F9FA' : 'transparent',
                border: `1px solid ${menuOpen ? '#C8D4DC' : 'transparent'}`,
              }}
            >
              {showAvatar ? (
                <img src={user.avatarUrl} alt={user.name} onError={() => setImgError(true)} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <span style={{ width: 32, height: 32, borderRadius: 999, background: '#2B7EC4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {getInitials(user.name)}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'left' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E2D3D' }}>{shortName}</span>
                <span style={{ fontSize: 10.5, color: '#6B7E8E' }}>{user.org}</span>
              </div>
              <ChevD size={13} stroke="#6B7E8E" />
            </button>

            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50, background: '#fff', border: '1px solid #E8ECEF', borderRadius: 10, boxShadow: '0 8px 24px rgba(30,45,61,0.12)', minWidth: 240, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8ECEF', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {showAvatar ? (
                    <img src={user.avatarUrl} onError={() => setImgError(true)} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 40, height: 40, borderRadius: 999, background: '#2B7EC4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {getInitials(user.name)}
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', lineHeight: 1.2 }}>{user.name}</div>
                    <div style={{ fontSize: 10.5, color: '#6B7E8E', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.title}</div>
                  </div>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[
                    { icon: <Settings size={14} stroke="#6B7E8E" />, label: t('userMenu.settings') },
                    { icon: <Alert size={14} stroke="#6B7E8E" />, label: t('userMenu.support') },
                  ].map(({ icon, label }) => (
                    <button key={label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1E2D3D' }}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E8ECEF', padding: '4px 0' }}>
                  <LanguageToggle flyoutDir="left" />
                </div>
                <div style={{ borderTop: '1px solid #E8ECEF', padding: '6px 0 8px' }}>
                  <button onClick={() => { logout(); nav('/login', { replace: true }); setMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#C0392B' }}>
                    <Lock size={14} stroke="#C0392B" /> {t('userMenu.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Bell button ──────────────────────────────────────────────────────────────

function BellButton({ open, unread, onClick }: Readonly<{ open: boolean; unread: number; onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
        background: open ? 'rgba(0,180,160,0.08)' : 'transparent',
        border: `1px solid ${open ? 'rgba(0,180,160,0.3)' : 'transparent'}`,
        transition: 'all 150ms',
      }}
      onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = '#F7F9FA'; (e.currentTarget as HTMLElement).style.borderColor = '#E8ECEF'; } }}
      onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}
    >
      <Bell size={17} stroke={open ? '#00B4A0' : '#3A4F63'} />
      {unread > 0 && (
        <span style={{
          position: 'absolute', top: 4, right: 4,
          minWidth: 16, height: 16, borderRadius: 999,
          background: '#DC2626', border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color: '#fff', lineHeight: 1,
          padding: '0 3px', fontFamily: 'var(--font-display)',
        }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

// ─── Notification panel ───────────────────────────────────────────────────────

const PAGE_SIZE = 6;

function NotifPanel({ notifs, onMarkAll, onRead }: Readonly<{
  notifs: Notif[];
  onMarkAll: () => void;
  onRead: (id: string) => void;
}>) {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const allLoaded = visibleCount >= notifs.length;
  const displayed = tab === 'unread'
    ? notifs.filter(n => !n.read)
    : notifs.slice(0, visibleCount);

  const loadMore = () => {
    if (loadingMore || allLoaded) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(c => c + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  };

  return (
    <div style={{
      position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 200,
      width: 400,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(200,212,220,0.5)',
      borderRadius: 14,
      boxShadow: '0 16px 48px rgba(30,45,61,0.16), 0 2px 8px rgba(30,45,61,0.06)',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#1E2D3D', letterSpacing: '-0.01em' }}>{t('notif.title')}</span>
            {unread > 0 && (
              <span style={{
                background: '#DC2626', color: '#fff',
                fontWeight: 800, fontSize: 10,
                padding: '2px 7px', borderRadius: 999,
                fontFamily: 'var(--font-display)', lineHeight: 1.6,
              }}>{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={onMarkAll}
              style={{ fontSize: 12, color: '#00B4A0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Check size={11} stroke="#00B4A0" />
              {t('notif.markAllRead')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(200,212,220,0.3)' }}>
          {(['all', 'unread'] as const).map(tabKey => {
            const unreadSuffix = unread > 0 ? ` (${unread})` : '';
            const labels = { all: t('notif.tab.all'), unread: `${t('notif.tab.unread')}${unreadSuffix}` };
            const active = tab === tabKey;
            return (
              <button key={tabKey} onClick={() => setTab(tabKey)} style={{
                padding: '7px 14px', fontSize: 12.5, fontWeight: active ? 700 : 500,
                color: active ? '#1E2D3D' : '#9BAAB5',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${active ? '#00B4A0' : 'transparent'}`,
                marginBottom: -1, transition: 'color 120ms',
              }}>
                {labels[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {displayed.length === 0 ? (
          <div style={{ padding: '48px 18px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,180,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Bell size={20} stroke="#00B4A0" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', marginBottom: 4 }}>{t('notif.empty.heading')}</div>
            <div style={{ fontSize: 12, color: '#9BAAB5' }}>{tab === 'unread' ? t('notif.empty.allRead') : t('notif.empty.noActivity')}</div>
          </div>
        ) : displayed.map((n, i) => {
          const cfg = TYPE_CFG[n.type];
          const IconComp = Icons[cfg.icon];
          return (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => onRead(n.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRead(n.id); }}
              style={{
                display: 'flex', gap: 12, padding: '13px 18px',
                borderTop: i > 0 ? '1px solid rgba(200,212,220,0.2)' : 'none',
                borderLeft: `3px solid ${n.read ? 'transparent' : cfg.color}`,
                background: n.read ? 'transparent' : `${cfg.bg}`,
                cursor: 'pointer', transition: 'background 100ms',
                position: 'relative',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = n.read ? 'rgba(247,249,250,0.8)' : `${cfg.bg}`)}
              onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : `${cfg.bg}`)}
            >
              {/* Icon chip */}
              <div style={{ flexShrink: 0, paddingTop: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: n.read ? 'rgba(200,212,220,0.18)' : cfg.bg,
                  border: `1px solid ${n.read ? 'rgba(200,212,220,0.3)' : `${cfg.color}28`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconComp size={15} stroke={n.read ? '#9BAAB5' : cfg.color} />
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontWeight: n.read ? 600 : 700, fontSize: 13,
                    color: n.read ? '#3A4F63' : '#1E2D3D',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{n.title}</span>
                  <span style={{ fontSize: 10.5, color: '#9BAAB5', flexShrink: 0, marginTop: 1 }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B7E8E', lineHeight: 1.55 }}>{n.body}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                    background: n.read ? 'rgba(200,212,220,0.2)' : cfg.bg,
                    color: n.read ? '#9BAAB5' : cfg.color,
                    border: `1px solid ${n.read ? 'rgba(200,212,220,0.3)' : `${cfg.color}30`}`,
                  }}>
                    {t(`notif.type.${n.type}`)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {tab === 'all' && (
        <div style={{
          padding: '11px 18px',
          borderTop: '1px solid rgba(200,212,220,0.3)',
          background: 'rgba(247,249,250,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {allLoaded ? (
            <span style={{ fontSize: 12, color: '#C8D4DC', fontWeight: 500 }}>
              {t('notif.footer.allShown')}
            </span>
          ) : (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                fontSize: 12.5, color: loadingMore ? '#9BAAB5' : '#6B7E8E', fontWeight: 600,
                background: 'none', border: 'none', cursor: loadingMore ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'color 120ms',
              }}
              onMouseEnter={e => { if (!loadingMore) (e.currentTarget.style.color = '#00B4A0'); }}
              onMouseLeave={e => { if (!loadingMore) (e.currentTarget.style.color = '#6B7E8E'); }}
            >
              {loadingMore ? (
                <>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid #C8D4DC', borderTopColor: '#00B4A0',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  {t('notif.footer.loading')}
                </>
              ) : (
                <>
                  {t('notif.footer.loadMore')}
                  <ChevD size={13} stroke="currentColor" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Standalone bell (reusable in SetupApp topbar) ────────────────────────────

export function NotifBell() {
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS);
  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-notif-bell]')) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  return (
    <div data-notif-bell style={{ position: 'relative' }}>
      <BellButton open={bellOpen} unread={unreadCount} onClick={() => setBellOpen(v => !v)} />
      {bellOpen && (
        <NotifPanel
          notifs={notifs}
          onMarkAll={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
          onRead={id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))}
        />
      )}
    </div>
  );
}
