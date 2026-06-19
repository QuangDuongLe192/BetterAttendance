import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Icons } from './Icons';
import { Avatar } from './UI';
import { useAuth } from '../stores/AuthContext';
import { LanguageToggle } from './LanguageToggle';

const ChevD = Icons.chevD;
const Settings = Icons.settings;
const Alert = Icons.alert;
const Lock = Icons.lock;

interface Props {
  avatarColor?: string;
}

export function SidebarUserMenu({ avatarColor = '#00B4A0' }: Readonly<Props>) {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-sidebar-user]')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  return (
    <div data-sidebar-user style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
          background: open ? 'rgba(255,255,255,0.10)' : 'transparent',
          border: `1px solid ${open ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
          transition: 'background 150ms, border-color 150ms',
          textAlign: 'left',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <Avatar name={user.name} src={user.avatarUrl} size={34} bg={avatarColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#6AB3E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.title}</div>
        </div>
        <ChevD
          size={13} stroke="#C8D4DC"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms' }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '1px solid #E8ECEF', borderRadius: 10,
          boxShadow: '0 -8px 32px rgba(30,45,61,0.18)', overflow: 'hidden',
        }}>
          {/* Profile header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8ECEF', display: 'flex', alignItems: 'center', gap: 10, background: '#F7F9FA' }}>
            <Avatar name={user.name} src={user.avatarUrl} size={40} bg={avatarColor} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: 10.5, color: '#6B7E8E', marginTop: 2 }}>{user.title}</div>
              <div style={{ fontSize: 10.5, color: '#9BAAB5', marginTop: 1 }}>{user.org}</div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '4px 0' }}>
            {[
              { icon: <Settings size={14} stroke="#6B7E8E" />, label: t('userMenu.settings') },
              { icon: <Alert size={14} stroke="#6B7E8E" />, label: t('userMenu.support') },
            ].map(({ icon, label }) => (
              <button
                key={label}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1E2D3D', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FA')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Language */}
          <div style={{ borderTop: '1px solid #E8ECEF', padding: '4px 0' }}>
            <LanguageToggle flyoutDir="right" />
          </div>

          {/* Logout */}
          <div style={{ borderTop: '1px solid #E8ECEF', padding: '6px 0 8px' }}>
            <button
              onClick={() => { logout(); nav('/login', { replace: true }); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#C0392B', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Lock size={14} stroke="#C0392B" /> {t('userMenu.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
