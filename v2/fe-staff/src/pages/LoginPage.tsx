import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../features/auth/hooks/useLogin';
import { getLarkAuthCode } from '../shared/lib/lark';
import { useAuthStore } from '../store/authStore';
import { DemoButtons } from '../features/auth/components/DemoButtons';

const LARK_APP_ID = import.meta.env.VITE_LARK_APP_ID as string ?? '';
const IS_DEV = import.meta.env.DEV;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    setError(null);
    try {
      const code = await getLarkAuthCode(LARK_APP_ID);
      await login.mutateAsync(code);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { messageKey?: string };
      setError(t(apiErr?.messageKey ?? 'auth.error.generic'));
    }
  };

  const handleDemoLogin = () => {
    setAuth('NV001', 'mock-token-demo-2026');
    setUser({ id: 'NV001', name: 'Nguyễn Văn An', email: 'nva@candylio.com', avatar: null, role: 'staff' });
    navigate('/', { replace: true });
  };

  const handleDemoAdmin = () => {
    setAuth('ADMIN001', 'mock-token-admin-2026');
    setUser({ id: 'ADMIN001', name: 'Admin Hệ thống', email: 'admin@candylio.com', avatar: null, role: 'admin' });
    navigate('/', { replace: true });
  };

  const handleDemoManager = () => {
    setAuth('MGR001', 'mock-token-mgr-2026');
    setUser({ id: 'MGR001', name: 'Nguyễn Thị Quản lý', email: 'manager@candylio.com', avatar: null, role: 'manager' });
    navigate('/', { replace: true });
  };

  return (
    <div className="cd-page" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', gap: 24, padding: '0 24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--fg-1)', marginBottom: 8,
        }}>
          {t('auth.title')}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg-3)' }}>{t('auth.sub')}</p>
      </div>

      {error && (
        <p style={{ color: 'var(--c-danger)', fontSize: 14, textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button
        className="cd-btn cd-btn--primary cd-btn--full"
        onClick={handleLogin}
        disabled={login.isPending}
        style={{ maxWidth: 320 }}
      >
        {login.isPending ? '…' : t('auth.signIn')}
      </button>

      <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>
        {t('auth.poweredBy')}
      </p>

      {IS_DEV && (
        <DemoButtons
          onDemoLogin={handleDemoLogin}
          onDemoManager={handleDemoManager}
          onDemoAdmin={handleDemoAdmin}
        />
      )}
    </div>
  );
}
