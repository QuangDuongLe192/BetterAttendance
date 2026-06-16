import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../../lib/usePageTitle';
import { useNavigate } from 'react-router';
import candylioLogoFull from '../../public/candylio-logo-full.svg';

const STYLES = `
@keyframes nf-lolliFloat {
  from { transform: translateX(-50%) translateY(0px)    rotate(-2deg); }
  to   { transform: translateX(-50%) translateY(-14px)  rotate( 2deg); }
}
@keyframes nf-shadowPulse {
  from { opacity: 1;   transform: translateX(-50%) scaleX(1);   }
  to   { opacity: 0.4; transform: translateX(-50%) scaleX(0.7); }
}
@keyframes nf-f1 {
  from { transform: translateY(0)     rotate(0deg);    opacity: 0.65; }
  to   { transform: translateY(-11px) rotate(22deg);   opacity: 1;    }
}
@keyframes nf-f2 {
  from { transform: translateY(0)     rotate(0deg);    }
  to   { transform: translateY(-16px) rotate(-18deg);  }
}
@keyframes nf-f3 {
  from { transform: translateY(0)     scale(1);    opacity: 0.5; }
  to   { transform: translateY(-8px)  scale(1.2);  opacity: 1;   }
}
@keyframes nf-f4 {
  from { transform: translateY(0)     rotate(45deg);  }
  to   { transform: translateY(-12px) rotate(75deg);  }
}
@keyframes nf-f5 {
  from { transform: translateY(0)     rotate(0deg);   opacity: 0.6; }
  to   { transform: translateY(-9px)  rotate(30deg);  opacity: 1;   }
}
@keyframes nf-f6 {
  from { transform: translateY(0)     rotate(0deg);    }
  to   { transform: translateY(-14px) rotate(-25deg);  }
}
@keyframes nf-f7 {
  from { transform: translateY(0)    scale(1);   }
  to   { transform: translateY(-7px) scale(1.3); }
}
`;

function useInjectStyles(css: string) {
  useEffect(() => {
    const id = 'nf-page-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
}

// ── Lollipop SVG ──────────────────────────────────────────────────────────────
function Lollipop() {
  return (
    <div style={{
      position: 'absolute', left: '50%', top: 0,
      transform: 'translateX(-50%)',
      animation: 'nf-lolliFloat 3.6s ease-in-out infinite alternate',
    }}>
      <svg width="196" height="296" viewBox="0 0 196 296" fill="none">
        {/* Stick */}
        <rect x="89" y="170" width="18" height="116" rx="9" fill="#1E2D3D"/>
        <rect x="93" y="178" width="5" height="100" rx="2.5" fill="#3A4F63" opacity="0.5"/>
        {/* Concentric rings */}
        <circle cx="98" cy="90" r="84" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="71" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="59" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="46" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="34" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="21" fill="#E6F8F6"/>
        <circle cx="98" cy="90" r="12" fill="#00B4A0"/>
        <circle cx="98" cy="90" r="5"  fill="#1E2D3D"/>
        {/* Shine */}
        <ellipse cx="70" cy="60" rx="24" ry="13" fill="white" opacity="0.18" transform="rotate(-22 70 60)"/>
        {/* "HẾT HÀNG" sticker */}
        <g transform="rotate(-11, 98, 90)">
          <rect x="20" y="80" width="156" height="32" rx="4" fill="#1E2D3D" opacity="0.15" transform="translate(2,2)"/>
          <rect x="20" y="80" width="156" height="32" rx="4" fill="#1E2D3D"/>
          <text x="100" y="102" textAnchor="middle" fill="white"
            fontSize="12.5" fontWeight="700"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            letterSpacing="3">
            404 NOT FOUND
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── Candy fragments ───────────────────────────────────────────────────────────
const FRAGS = [
  {
    style: { top: 18, left: 8, animation: 'nf-f1 2.8s ease-in-out infinite alternate' },
    svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6.5" fill="#00B4A0"/></svg>,
  },
  {
    style: { top: 50, right: 6, animation: 'nf-f2 3.4s ease-in-out 0.3s infinite alternate' },
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0" y="0" width="11" height="11" rx="2" fill="#1E2D3D" opacity="0.65"/></svg>,
  },
  {
    style: { top: 110, left: 4, animation: 'nf-f3 2.3s ease-in-out 0.6s infinite alternate' },
    svg: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="4" fill="none" stroke="#00B4A0" strokeWidth="2"/></svg>,
  },
  {
    style: { top: 140, right: 2, animation: 'nf-f4 3.9s ease-in-out 0.1s infinite alternate' },
    svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1" fill="#E6F8F6" stroke="#00B4A0" strokeWidth="1.5" transform="rotate(20 5 5)"/></svg>,
  },
  {
    style: { bottom: 80, left: 14, animation: 'nf-f5 3.1s ease-in-out 0.8s infinite alternate' },
    svg: <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="4" fill="#C8D4DC"/></svg>,
  },
  {
    style: { bottom: 60, right: 16, animation: 'nf-f6 2.6s ease-in-out 0.4s infinite alternate' },
    svg: <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><polygon points="6,0 12,10 0,10" fill="#1E2D3D" opacity="0.4"/></svg>,
  },
  {
    style: { top: 70, left: '50%', marginLeft: -4, animation: 'nf-f7 2.0s ease-in-out 1s infinite alternate' },
    svg: <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#00B4A0" opacity="0.5"/></svg>,
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const { t } = useTranslation('common');
  useInjectStyles(STYLES);
  usePageTitle(t('notfound.page_title'));
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
            transition: 'color 120ms',
            padding: 0,
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: hoverBack ? 'translateX(-3px)' : 'none', transition: 'transform 120ms' }}>
            <path d="M9 2.5L5 7l4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('notfound.nav.back')}
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
          {/* Ground shadow */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 100, height: 16,
            background: 'radial-gradient(ellipse, rgba(30,45,61,0.10) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'nf-shadowPulse 3.6s ease-in-out infinite alternate',
          }} />
          {/* Fragments */}
          {FRAGS.map((f, i) => (
            <div key={i} style={{ position: 'absolute', ...f.style as React.CSSProperties }}>
              {f.svg}
            </div>
          ))}
          {/* Lollipop */}
          <Lollipop />
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 42, color: '#1E2D3D', lineHeight: 1.1,
          letterSpacing: '-0.025em', margin: '0 0 18px',
        }}>
          {t('notfound.heading')}
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15,
          color: '#6B7E8E', lineHeight: 1.8,
          maxWidth: 500, margin: '0 auto 36px',
        }}>
          {t('notfound.body')}
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
            {t('notfound.back_home')}
          </button>
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 64,
          fontSize: 11, color: '#C8D4DC', letterSpacing: '0.05em',
        }}>
          {t('notfound.footer.copyright')}
        </p>
      </main>
    </div>
  );
}
