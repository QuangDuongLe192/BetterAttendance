import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';

interface TabDef {
  key: string;
  label: string;
  path: string;
}

const BASE_TABS: TabDef[] = [
  { key: 'today',         label: 'nav.today',         path: '/' },
  { key: 'calendar',      label: 'nav.calendar',      path: '/calendar' },
  { key: 'notifications', label: 'nav.notifications', path: '/notifications' },
  { key: 'profile',       label: 'nav.profile',       path: '/profile' },
];

const ADMIN_TAB: TabDef = {
  key: 'adminRequests',
  label: 'nav.adminRequests',
  path: '/admin/requests',
};

const MANAGER_TAB: TabDef = {
  key: 'managerCalendar',
  label: 'nav.managerCalendar',
  path: '/manager/calendar',
};

type TabIconRenderer = (color: string, s: number, active: boolean) => React.ReactElement | null;

const TAB_ICONS: Record<string, TabIconRenderer> = {
  today: (color, s, active) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {active && <circle cx="12" cy="16" r="1.5" fill={color} />}
      {!active && <path d="M8 14h2M14 14h2M8 17.5h2M14 17.5h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  ),
  calendar: (color, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 14.5h3v2.5h-3z" fill={color} rx="0.5" />
      <path d="M13.5 14.5h3v2.5h-3z" fill={color} rx="0.5" />
    </svg>
  ),
  notifications: (color, s, active) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 3.5-1.5 5-1.5 5h16s-1.5-1.5-1.5-5A6.5 6.5 0 0 0 12 3z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? `${color}22` : 'none'} />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  profile: (color, s, active) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.8"
        fill={active ? `${color}22` : 'none'} />
      <path d="M4 19.5C4 16.46 7.58 14 12 14s8 2.46 8 5.5"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  adminRequests: (color, s, active) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={color} strokeWidth="1.8"
        fill={active ? `${color}15` : 'none'} />
      <path d="M8 8h8M8 12h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.5" cy="16.5" r="3" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" />
      <path d="M15.5 16.5l.8.8 1.5-1.5" stroke={active ? 'white' : color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  managerCalendar: (color, s, active) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.8"
        fill={active ? `${color}15` : 'none'} />
      <path d="M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 15l2.5 2.5L17 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function TabIcon({ tabKey, active }: { tabKey: string; active: boolean }) {
  const color = active ? 'var(--c-teal)' : 'var(--fg-3)';
  const s = 22;
  return TAB_ICONS[tabKey]?.(color, s, active) ?? null;
}

export function TabBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const role = useAuthStore(s => s.role);

  const tabs: TabDef[] = [
    BASE_TABS[0],
    BASE_TABS[1],
    BASE_TABS[2],
    ...(role === 'admin' ? [ADMIN_TAB, MANAGER_TAB] : []),
    ...(role === 'manager' ? [MANAGER_TAB] : []),
    BASE_TABS[3],
  ];

  const isActive = (tab: TabDef) => {
    const p = location.pathname;
    if (tab.key === 'calendar') return p === '/calendar' || p.startsWith('/shifts/');
    if (tab.key === 'notifications') return p === '/notifications';
    if (tab.key === 'profile') return p === '/profile' || p.startsWith('/profile/') || p === '/requests' || p.startsWith('/requests/');
    if (tab.key === 'adminRequests') return p === '/admin/requests' || p.startsWith('/admin/requests/');
    if (tab.key === 'managerCalendar') return p === '/manager/calendar';
    return p === tab.path;
  };

  return (
    <div className="cd-tabs">
      {tabs.map(tab => {
        const active = isActive(tab);
        return (
          <button
            key={tab.key}
            className={active ? 'is-active' : ''}
            onClick={() => navigate(tab.path)}
            aria-label={t(tab.label)}
            aria-current={active ? 'page' : undefined}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TabIcon tabKey={tab.key} active={active} />
              {tab.key === 'notifications' && unreadCount > 0 && (
                <i className="cd-tabdot" aria-label={`${unreadCount} unread`} />
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }} aria-hidden="true">
              {t(tab.label)}
            </span>
            {active && <span className="cd-tab-pill" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
