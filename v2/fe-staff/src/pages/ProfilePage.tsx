import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { Icons } from '../shared/components/Icons';
import { useProfile } from '../features/profile/hooks/useProfile';
import { SignOutModal } from '../features/profile/components/SignOutModal';
import { useMe } from '../features/auth/hooks/useMe';
import { usePullToRefresh } from '../shared/hooks/usePullToRefresh';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, userId, name, initials, clearAuth } = useProfile();
  const { refetch } = useMe();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const { containerRef, onTouchStart, onTouchEnd, dragOffset } = usePullToRefresh(() => refetch());

  return (
    <div className="cd-page" ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {dragOffset > 0 && (
        <div className="cd-ptr-indicator" style={{ '--ptr-progress': dragOffset / 72 } as React.CSSProperties} />
      )}
      <ScreenHeader title={t('profile.eyebrow')} />

      {/* Identity card */}
      <div className="cd-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'var(--c-teal)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
            letterSpacing: '-0.02em',
            boxShadow: '0 0 0 3px var(--c-teal-light), 0 0 0 5px var(--c-teal)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
              color: 'var(--fg-1)', letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              {name}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                background: 'var(--c-teal-light)', color: 'var(--c-teal-dark)',
                borderRadius: 'var(--r-pill)', padding: '2px 10px',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}>
                {t('profile.role.staff')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{userId}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icons.globe size={12} sw={1.5} />
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="cd-card">
        <div className="cd-section-label" style={{ marginBottom: 4 }}>
          {t('profile.settings')}
        </div>
        <button className="cd-setting" onClick={() => navigate('/profile/salary')}>
          <div>
            <span className="cd-setting__icon cd-setting__icon--green">
              <Icons.arrowUp size={16} sw={2} />
            </span>
            {t('profile.payInfo')}
          </div>
          <Icons.chevR size={16} />
        </button>
        <button className="cd-setting" onClick={() => navigate('/profile/language')}>
          <div>
            <span className="cd-setting__icon cd-setting__icon--blue">
              <Icons.globe size={16} sw={2} />
            </span>
            {t('profile.language')}
          </div>
          <Icons.chevR size={16} />
        </button>
        <button className="cd-setting" onClick={() => navigate('/requests')}>
          <div>
            <span className="cd-setting__icon cd-setting__icon--orange">
              <Icons.activity size={16} sw={2} />
            </span>
            {t('nav.requests')}
          </div>
          <Icons.chevR size={16} />
        </button>
        <button className="cd-setting">
          <div>
            <span className="cd-setting__icon" style={{ background: 'var(--line-2)', color: 'var(--fg-3)' }}>
              <Icons.more size={16} sw={2} />
            </span>
            {t('profile.about')}
          </div>
          <Icons.chevR size={16} />
        </button>
        <button className="cd-setting cd-setting--danger cd-setting--last" onClick={() => setConfirmSignOut(true)}>
          <div>
            <span className="cd-setting__icon cd-setting__icon--red">
              <Icons.logout size={16} sw={2} />
            </span>
            {t('profile.signOut')}
          </div>
          <Icons.chevR size={16} />
        </button>
      </div>

      <div className="cd-version">{t('profile.version')}</div>

      {confirmSignOut && (
        <SignOutModal onConfirm={clearAuth} onCancel={() => setConfirmSignOut(false)} />
      )}
    </div>
  );
}
