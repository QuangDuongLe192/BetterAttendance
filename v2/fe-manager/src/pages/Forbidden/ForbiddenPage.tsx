import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useNavigate } from 'react-router';
import candylioLogoFull from '../../public/candylio-logo-full.svg';

const STYLES = `
@keyframes fb-lolliFloat {
  from { transform: translateX(-50%) translateY(0px)    rotate(-2deg); }
  to   { transform: translateX(-50%) translateY(-14px)  rotate( 2deg); }
}
@keyframes fb-shadowPulse {
  from { opacity: 1;   transform: translateX(-50%) scaleX(1);   }
  to   { opacity: 0.4; transform: translateX(-50%) scaleX(0.7); }
}
@keyframes fb-f1 {
  from { transform: translateY(0)     rotate(0deg);    opacity: 0.65; }
  to   { transform: translateY(-11px) rotate(22deg);   opacity: 1;    }
}
@keyframes fb-f2 {
  from { transform: translateY(0)     rotate(0deg);    }
  to   { transform: translateY(-16px) rotate(-18deg);  }
}
@keyframes fb-f3 {
  from { transform: translateY(0)     scale(1);    opacity: 0.5; }
  to   { transform: translateY(-8px)  scale(1.2);  opacity: 1;   }
}
@keyframes fb-f4 {
  from { transform: translateY(0)     rotate(45deg);  }
  to   { transform: translateY(-12px) rotate(75deg);  }
}
@keyframes fb-f5 {
  from { transform: translateY(0)     rotate(0deg);   opacity: 0.6; }
  to   { transform: translateY(-9px)  rotate(30deg);  opacity: 1;   }
}
@keyframes fb-f6 {
  from { transform: translateY(0)     rotate(0deg);    }
  to   { transform: translateY(-14px) rotate(-25deg);  }
}
@keyframes fb-f7 {
  from { transform: translateY(0)    scale(1);   }
  to   { transform: translateY(-7px) scale(1.3); }
}
`;

function useInjectStyles(css: string) {
  useEffect(() => {
    const id = 'fb-page-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
}

function Lollipop() {
  return (
    <div style={{
      position: 'absolute', left: '50%', top: 0,
      transform: 'translateX(-50%)',
      animation: 'fb-lolliFloat 3.6s ease-in-out infinite alternate',
    }}>
      <svg width="196" height="296" viewBox="0 0 196 296" fill="none">
        <rect x="89" y="170" width="18" height="116" rx="9" fill="#1E2D3D"/>
        <rect x="93" y="178" width="5" height="100" rx="2.5" fill="#3A4F63" opacity="0.5"/>
        <circle cx="98" cy="90" r="84" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="71" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="59" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="46" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="34" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="21" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="12" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="5"  fill="#1E2D3D"/>
        <ellipse cx="70" cy="60" rx="24" ry="13" fill="white" opacity="0.18" transform="rotate(-22 70 60)"/>
        <g transform="rotate(-11, 98, 90)">
          <rect x="20" y="80" width="156" height="32" rx="4" fill="#1E2D3D" opacity="0.15" transform="translate(2,2)"/>
          <rect x="20" y="80" width="156" height="32" rx="4" fill="#DC2626"/>
          <text x="100" y="102" textAnchor="middle" fill="white"
            fontSize="12.5" fontWeight="700"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            letterSpacing="3">
            403 FORBIDDEN
          </text>
        </g>
      </svg>
    </div>
  );
}

const FRAGS = [
  {
    id: 'frag-1',
    style: { top: 18, left: 8, animation: 'fb-f1 2.8s ease-in-out infinite alternate' },
    svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6.5" fill="#DC2626" opacity="0.7"/></svg>,
  },
  {
    id: 'frag-2',
    style: { top: 50, right: 6, animation: 'fb-f2 3.4s ease-in-out 0.3s infinite alternate' },
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0" y="0" width="11" height="11" rx="2" fill="#1E2D3D" opacity="0.65"/></svg>,
  },
  {
    id: 'frag-3',
    style: { top: 110, left: 4, animation: 'fb-f3 2.3s ease-in-out 0.6s infinite alternate' },
    svg: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="4" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.6"/></svg>,
  },
  {
    id: 'frag-4',
    style: { top: 140, right: 2, animation: 'fb-f4 3.9s ease-in-out 0.1s infinite alternate' },
    svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" transform="rotate(20 5 5)"/></svg>,
  },
  {
    id: 'frag-5',
    style: { bottom: 80, left: 14, animation: 'fb-f5 3.1s ease-in-out 0.8s infinite alternate' },
    svg: <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="4" fill="#C8D4DC"/></svg>,
  },
  {
    id: 'frag-6',
    style: { bottom: 60, right: 16, animation: 'fb-f6 2.6s ease-in-out 0.4s infinite alternate' },
    svg: <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><polygon points="6,0 12,10 0,10" fill="#1E2D3D" opacity="0.4"/></svg>,
  },
  {
    id: 'frag-7',
    style: { top: 70, left: '50%', marginLeft: -4, animation: 'fb-f7 2.0s ease-in-out 1s infinite alternate' },
    svg: <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#DC2626" opacity="0.5"/></svg>,
  },
] as const;

export function ForbiddenPage() {
  const { t } = useTranslation('common');
  useInjectStyles(STYLES);
  usePageTitle(t('forbidden.page_title'));
  const navigate = useNavigate();
  const [hoverBack, setHoverBack] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#F7F9FA' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: '#F7F9FA',
        borderBottom: '1px solid #C8D4DC', zIndex: 20,
      }}>
        <img src={candylioLogoFull} alt="Candylio" style={{ height: 28 }} />
        <button
          onClick={() => navigate('/')}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: hoverBack ? '#1E2D3D' : '#6B7E8E',
            transition: 'color 120ms', padding: 0,
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: hoverBack ? 'translateX(-3px)' : 'none', transition: 'transform 120ms' }}>
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('forbidden.nav.back')}
        </button>
      </nav>

      {/* Main */}
      <main style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px', textAlign: 'center',
      }}>
        {/* Candy scene */}
        <div style={{ position: 'relative', width: 260, height: 310, marginBottom: 36, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 100, height: 16,
            background: 'radial-gradient(ellipse, rgba(30,45,61,0.10) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'fb-shadowPulse 3.6s ease-in-out infinite alternate',
          }} />
          {FRAGS.map((f) => (
            <div key={f.id} style={{ position: 'absolute', ...f.style as React.CSSProperties }}>
              {f.svg}
            </div>
          ))}
          <Lollipop />
        </div>
        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 42, color: '#1E2D3D', lineHeight: 1.1,
          letterSpacing: '-0.025em', margin: '0 0 18px',
        }}>
          {t('forbidden.heading')}
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15,
          color: '#6B7E8E', lineHeight: 1.8,
          maxWidth: 500, margin: '0 auto 36px',
        }}>
          {t('forbidden.body')}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              padding: '13px 28px',
              background: '#00B4A0', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#008C7C')}
            onMouseLeave={e => (e.currentTarget.style.background = '#00B4A0')}
          >
            {t('forbidden.back_home')}
          </button>
        </div>

        <p style={{
          marginTop: 64,
          fontSize: 11, color: '#C8D4DC', letterSpacing: '0.05em',
        }}>
          {t('forbidden.footer.copyright')}
        </p>
      </main>
    </div>
  );
}

