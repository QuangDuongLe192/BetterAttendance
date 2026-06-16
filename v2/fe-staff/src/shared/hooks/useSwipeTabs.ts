import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface TabDef { key: string; path: string; }

const BASE_TABS: TabDef[] = [
  { key: 'today',         path: '/' },
  { key: 'calendar',      path: '/calendar' },
  { key: 'notifications', path: '/notifications' },
  { key: 'profile',       path: '/profile' },
];

const ADMIN_TAB:   TabDef = { key: 'adminRequests',   path: '/admin/requests' };
const MANAGER_TAB: TabDef = { key: 'managerCalendar', path: '/manager/calendar' };

// Paths that are tab roots (swipe is active only on these)
const TAB_ROOTS = new Set(['/', '/calendar', '/notifications', '/profile', '/admin/requests', '/manager/calendar']);

export function useSwipeTabs(containerRef: React.RefObject<HTMLElement | null>) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = useAuthStore(s => s.role);
  const touchX    = useRef(0);
  const touchY    = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      touchX.current = e.touches[0].clientX;
      touchY.current = e.touches[0].clientY;
    };

    // Elements that own their own horizontal swipe — tab swipe must not fire when
    // the gesture starts inside one of these.
    const SWIPE_OWNERS = ['.cd-month-cal'];

    const onEnd = (e: TouchEvent) => {
      // Yield to components that own horizontal swipe (e.g. calendar grid)
      const target = e.target as Element | null;
      if (target && SWIPE_OWNERS.some(sel => target.closest(sel))) return;

      const dx = e.changedTouches[0].clientX - touchX.current;
      const dy = e.changedTouches[0].clientY - touchY.current;

      // Must be primarily horizontal, at least 80px, and 2× more horizontal than vertical
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.5) return;

      const path = location.pathname;
      if (!TAB_ROOTS.has(path)) return;

      const tabs: TabDef[] = [
        ...BASE_TABS,
        ...(role === 'admin' ? [ADMIN_TAB, MANAGER_TAB] : []),
        ...(role === 'manager' ? [MANAGER_TAB] : []),
      ];

      const idx = tabs.findIndex(t => t.path === path);
      if (idx === -1) return;

      // swipe left → next tab, swipe right → prev tab
      if (dx < 0 && idx < tabs.length - 1) {
        el.classList.add('cd-slide-left');
        setTimeout(() => el.classList.remove('cd-slide-left'), 160);
        navigate(tabs[idx + 1].path);
      } else if (dx > 0 && idx > 0) {
        el.classList.add('cd-slide-right');
        setTimeout(() => el.classList.remove('cd-slide-right'), 160);
        navigate(tabs[idx - 1].path);
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [containerRef, navigate, location.pathname, role]);
}
