import { useTranslation } from 'react-i18next';

export function SignOutModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 calc(80px + env(safe-area-inset-bottom))',
      }}
      onClick={onCancel}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div
        style={{
          background: 'var(--bg-surface)', borderRadius: '20px 20px 0 0',
          padding: '24px 20px 20px', width: '100%', maxWidth: 480,
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 16, color: 'var(--fg-1)', textAlign: 'center', marginBottom: 8,
        }}>
          {t('profile.signOut')}?
        </p>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', textAlign: 'center', marginBottom: 20 }}>
          {t('profile.signOutConfirm', 'You will be signed out of your account.')}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="cd-btn"
            style={{ flex: 1, background: 'transparent', border: '1px solid var(--line-1)', color: 'var(--fg-2)' }}
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
          <button
            className="cd-btn"
            style={{ flex: 1, background: 'var(--c-danger-light, #fef2f2)', border: '1px solid var(--c-danger)', color: 'var(--c-danger)' }}
            onClick={onConfirm}
          >
            {t('profile.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
