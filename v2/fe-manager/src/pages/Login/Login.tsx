import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { toast } from 'sonner';
import { Icons } from '../../components/Icons';
import { useAuth, type CurrentUser, type AccessRow } from '../../stores/AuthContext';
import { STAFF, STAFF_ROLE_SCOPES, LOCATIONS } from '../../services/setup';

function scopeToAccess(larkUserId: string): AccessRow[] {
  const scope = STAFF_ROLE_SCOPES.find(s => s.larkUserId === larkUserId);
  if (!scope) return [];
  const rows: AccessRow[] = [];
  scope.orgRoles.forEach(r => rows.push({ type: r as AccessRow['type'], locationId: null, canAssignRoles: false }));
  scope.managedLocationIds.forEach(locId => {
    const del = LOCATIONS.find(l => l.locationId === locId)?.delegation;
    rows.push({ type: 'MANAGER', locationId: locId, canAssignRoles: del?.canAssignRoles ?? false });
  });
  return rows;
}

function staffToUser(larkUserId: string, title: string): CurrentUser {
  const s = STAFF.find(st => st.larkUserId === larkUserId)!;
  return { openId: larkUserId, name: s.name, avatarUrl: s.avatar, title, org: 'Better Coffee Co.', access: scopeToAccess(larkUserId) };
}
import candylioLogoDark from '../../public/candylio-logo-full-dark.svg';
import larkLogo from '../../public/lark-logo-mark.png';

declare global {
  interface Window { tt: any; }
}

type LoginState = 'idle' | 'loading' | 'error';

// ─── Dev demo users — derived from STAFF + STAFF_ROLE_SCOPES ─────────────────
const DEMO_USERS: { label: string; sublabel: string; badge: string; color: string; user: CurrentUser }[] = [
  { label: 'Admin',        sublabel: 'Hoàng Việt Hùng',     badge: 'ADMIN',    color: '#1E2D3D', user: staffToUser('lark_user_008', 'Quản trị viên hệ thống') },
  { label: 'Manager',      sublabel: 'Lê Thị Hồng Nhung',   badge: 'MANAGER',  color: '#008C7C', user: staffToUser('lark_user_003', 'Quản lý cửa hàng') },
  { label: 'Mgr + Finance',sublabel: 'Phạm Quốc Anh',       badge: 'MGR+FIN',  color: '#7C4FBF', user: staffToUser('lark_user_004', 'Quản lý & Kế toán') },
  { label: 'Finance',      sublabel: 'Vũ Hải Yến',          badge: 'FINANCE',  color: '#2B7EC4', user: staffToUser('lark_user_006', 'Kế toán') },
  { label: 'Nhân viên',    sublabel: 'Nguyễn Văn An',       badge: 'STAFF',    color: '#6B7E8E', user: staffToUser('lark_user_001', 'Nhân viên pha chế') },
];

function DevDemoPanel({ onLogin }: Readonly<{ onLogin: (user: CurrentUser) => void }>) {
  const { t } = useTranslation('common');
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{ width: '100%', maxWidth: 440, marginTop: 16, border: '1px dashed #C8D4DC', borderRadius: 12, padding: '16px 18px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9EAFBD' }}>DEV DEMO</span>
        <span style={{ flex: 1, height: 1, background: '#E8ECEF' }} />
        <span style={{ fontSize: 10.5, color: '#9EAFBD' }}>{t('login.demo.eyebrow')}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {DEMO_USERS.map((d, i) => (
          <button
            key={d.badge}
            onClick={() => onLogin(d.user)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              background: hovered === i ? '#F7F9FA' : 'transparent',
              border: `1px solid ${hovered === i ? '#C8D4DC' : '#E8ECEF'}`,
              transition: 'background 120ms, border-color 120ms',
              gridColumn: i === DEMO_USERS.length - 1 && DEMO_USERS.length % 2 !== 0 ? 'span 2' : undefined,
            }}
          >
            <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, background: d.color, color: '#fff', fontSize: 9.5, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>{d.badge}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E2D3D', fontFamily: 'var(--font-display)' }}>{d.label}</span>
            <span style={{ fontSize: 11, color: '#9EAFBD', marginTop: 1 }}>{d.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, icon }: Readonly<{ children: React.ReactNode; icon: React.ReactNode }>) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#E8ECEF', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
      {icon}{children}
    </span>
  );
}

function LeftPanel() {
  const { t } = useTranslation('common');
  const Shield = Icons.shield;
  const Users = Icons.users;
  const Clock = Icons.clock;
  return (
    <aside style={{ background: '#1E2D3D', color: '#fff', padding: '56px 56px 40px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at 70% 30%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 70% 30%, #000 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, rgba(0,180,160,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={candylioLogoDark} alt="Candylio" />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative', maxWidth: 460 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7BE4D6', marginBottom: 18 }}>
          {t('login.left.tagline')}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          {t('login.left.headline')}
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#C8D4DC', margin: '20px 0 0', maxWidth: 420 }}>
          {t('login.left.subtitle')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <Chip icon={<Shield size={13} stroke="#7BE4D6" />}>{t('login.left.chip.sso')}</Chip>
          <Chip icon={<Users size={13} stroke="#7BE4D6" />}>{t('login.left.chip.sync')}</Chip>
          <Chip icon={<Clock size={13} stroke="#7BE4D6" />}>{t('login.left.chip.onetouch')}</Chip>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9AABBC' }}>
        <span>{t('login.left.footer.copyright')}</span>
        <span style={{ display: 'flex', gap: 18 }}>
          <button type="button" style={{ color: '#9AABBC', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t('login.left.footer.privacy')}</button>
          <button type="button" style={{ color: '#9AABBC', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t('login.left.footer.terms')}</button>
          <button type="button" style={{ color: '#9AABBC', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t('login.left.footer.lang')}</button>
        </span>
      </div>
    </aside>
  );
}

function LarkButton({ state, onClick }: Readonly<{ state: LoginState; onClick: () => void }>) {
  const { t } = useTranslation('common');
  const [hover, setHover] = useState(false);
  const loading = state === 'loading';
  const ArrowR = Icons.arrowR;
  return (
    <button onClick={onClick} disabled={loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: hover && !loading ? '#13202F' : '#1E2D3D', color: '#fff', border: 'none', cursor: loading ? 'progress' : 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, transition: 'background 150ms, transform 150ms, box-shadow 150ms', transform: hover && !loading ? 'translateY(-1px)' : 'translateY(0)', boxShadow: hover && !loading ? '0 8px 24px rgba(30,45,61,0.18)' : '0 1px 2px rgba(30,45,61,0.06)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={larkLogo} alt="Lark" style={{ width: 20, height: 20 }} />
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{loading ? t('login.card.button.loading') : t('login.card.button.idle')}</span>
      {loading ? (
        <span style={{ width: 16, height: 16, borderRadius: 999, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'spin 700ms linear infinite', display: 'inline-block', flexShrink: 0 }} />
      ) : (
        <ArrowR size={16} stroke="#fff" />
      )}
    </button>
  );
}

function LoginCard({ state, onLogin }: Readonly<{ state: LoginState; onLogin: () => void }>) {
  const { t } = useTranslation('common');
  const [whyOpen, setWhyOpen] = useState(false);
  const Shield = Icons.shield;
  const ChevD = Icons.chevD;
  return (
    <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, padding: '40px 40px 32px', border: '1px solid #E8ECEF', boxShadow: '0 1px 2px rgba(30,45,61,0.03)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#00B4A0', marginBottom: 12 }}>{t('login.card.eyebrow')}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.015em', color: '#1E2D3D', margin: 0, lineHeight: 1.15 }}>{t('login.card.heading')}</h2>
      <p style={{ fontSize: 14, color: '#6B7E8E', margin: '8px 0 28px', lineHeight: 1.6 }}>{t('login.card.subtitle')}</p>
      <LarkButton state={state} onClick={onLogin} />
      {state === 'error' && (
        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#FFF8F8', border: '1px solid #F5C5C5', color: '#7C1D1D', fontSize: 12.5, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Shield size={14} stroke="#7C1D1D" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{t('login.card.error.title')}</div>
            <div>{t('login.card.error.body')}</div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 24, borderRadius: 8, background: '#F7F9FA', border: '1px solid #E8ECEF', overflow: 'hidden' }}>
        <button onClick={() => setWhyOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#1E2D3D', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12.5, textAlign: 'left' }}>
          <Shield size={13} stroke="#00B4A0" />
          <span style={{ flex: 1 }}>{t('login.card.why.label')}</span>
          <span style={{ transition: 'transform 200ms', transform: whyOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex' }}>
            <ChevD size={13} stroke="#6B7E8E" />
          </span>
        </button>
        {whyOpen && (
          <div style={{ padding: '0 14px 14px', fontSize: 12.5, color: '#3A4F63', lineHeight: 1.6 }}>
            {t('login.card.why.body')}
          </div>
        )}
      </div>
      <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #E8ECEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6B7E8E' }}>
        <span>{t('login.card.support')} <a href="#" style={{ color: '#00B4A0', fontWeight: 600, textDecoration: 'none' }}>{t('login.card.support.link')}</a></span>
        <span style={{ fontSize: 11, color: '#9EAFBD' }}>v2.4</span>
      </div>
    </div>
  );
}

function ProcessingScreen() {
  const { t } = useTranslation('common');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FA' }}>
      <div style={{ background: '#fff', border: '1px solid #E8ECEF', borderRadius: 16, padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, boxShadow: '0 4px 24px rgba(30,45,61,0.08)' }}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, display: 'block', border: '2px solid transparent', borderTopColor: '#00B4A0', borderRightColor: '#00B4A0', animation: 'spin 1.2s linear infinite' }} />
          <span style={{ position: 'absolute', inset: 6, borderRadius: 999, display: 'block', border: '2px solid transparent', borderBottomColor: '#2B7EC4', borderLeftColor: '#2B7EC4', animation: 'spin 800ms linear infinite reverse' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1E2D3D', margin: 0 }}>{t('login.processing.title')}</p>
        <p style={{ fontSize: 13, color: '#6B7E8E', margin: 0 }}>{t('login.processing.subtitle')}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const navigate = useNavigate();
  const { user, loginWithToken } = useAuth();
  usePageTitle(t('login.page_title'));

  if (user) return <Navigate to="/" replace />;

  const redirectUri = useMemo(() => window.location.origin + window.location.pathname, []);

  const handleCode = useCallback(async (code: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/lark/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });
      if (!res.ok) throw new Error('auth_failed');
      const { token, expiresAt } = await res.json() as { token: string; expiresAt: number };
      loginWithToken(token, expiresAt);
      toast.success(t('login.toast.success'));
      navigate('/', { replace: true });
    } catch {
      setIsProcessing(false);
      setLoginState('error');
      toast.error(t('login.toast.error'));
    }
  }, [navigate, redirectUri, loginWithToken, t]);

  const loginByLark = useCallback(() => {
    if (searchParams.get('code')) return;
    setLoginState('loading');
    // TODO: remove mock bypass when backend /api/auth/lark/token is ready
    loginWithToken('mock_token_dev', Date.now() / 1000 + 86400);
    toast.success(t('login.toast.success'));
    navigate('/', { replace: true });
  }, [searchParams, navigate, loginWithToken, t]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) { handleCode(code); }
    // TODO: restore Lark auto-login when backend is ready
    // else if (isLarkEnvironment()) { loginByLark(); }
  }, []);

  const loginAsDemo = useCallback((demoUser: CurrentUser) => {
    loginWithToken('mock_token_demo', Date.now() / 1000 + 86400, demoUser);
    toast.success(t('login.toast.success_user', { name: demoUser.name }));
    navigate('/', { replace: true });
  }, [loginWithToken, navigate, t]);

  const cardStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#F7F9FA', minHeight: '100vh' };

  if (isProcessing) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ProcessingScreen />
    </>
  );

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(520px, 1fr)', background: '#F7F9FA' }}>
        <LeftPanel />
        <main style={cardStyle}>
          <LoginCard state={loginState} onLogin={loginByLark} />
          <DevDemoPanel onLogin={loginAsDemo} />
        </main>
      </div>
    </>
  );
}
