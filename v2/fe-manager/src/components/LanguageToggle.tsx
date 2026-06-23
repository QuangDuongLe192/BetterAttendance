import { Globe } from 'lucide-react';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  flyoutDir?: 'left' | 'right';
}

const LANGS = [
  { lang: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { lang: 'en', flag: '🇬🇧', label: 'English' },
] as const;

const FLYOUT_W = 152;

export function LanguageToggle({ flyoutDir = 'right' }: Readonly<Props>) {
  const { t, i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rowRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timer.current) clearTimeout(timer.current);
    if (rowRef.current) {
      const r = rowRef.current.getBoundingClientRect();
      setPos({
        top: r.top,
        left: flyoutDir === 'right' ? r.right + 4 : r.left - FLYOUT_W - 4,
      });
    }
    setOpen(true);
  }

  function hide() {
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  function pick(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setOpen(false);
    if (timer.current) clearTimeout(timer.current);
  }

  const cur = LANGS.find(l => l.lang === i18n.language) ?? LANGS[0];

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 16px',
          background: open ? '#F7F9FA' : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontSize: 13, color: '#1E2D3D', fontFamily: 'inherit',
          transition: 'background 120ms',
        }}
      >
        <Globe size={14} />
        <span style={{ flex: 1 }}>{t('userMenu.language')}</span>
        <span style={{ fontSize: 12, color: '#9BAAB5', marginRight: 2 }}>
          {cur.flag} {cur.label}
        </span>
        <svg
          width="11" height="11" viewBox="0 0 11 11" fill="none"
          style={{ transform: flyoutDir === 'left' ? 'scaleX(-1)' : undefined }}
        >
          <path d="M4 2L7.5 5.5L4 9" stroke="#C8D4DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && createPortal(
        <div
          role="menu"
          tabIndex={0}
          onMouseEnter={show}
          onMouseLeave={hide}
          onMouseDown={e => e.nativeEvent.stopImmediatePropagation()}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: FLYOUT_W,
            background: '#fff',
            border: '1px solid #E8ECEF',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(30,45,61,0.12)',
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          {LANGS.map(({ lang, flag, label }) => {
            const active = i18n.language === lang;
            return (
              <button
                key={lang}
                onClick={() => pick(lang)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 14px',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 13,
                  color: active ? '#00B4A0' : '#1E2D3D',
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FA')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 15 }}>{flag}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {active && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5 9.5L11 3.5" stroke="#00B4A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
