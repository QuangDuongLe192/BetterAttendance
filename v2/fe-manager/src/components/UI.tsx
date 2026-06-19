import { useState, createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { Icons } from './Icons';

interface Theme { density: 'spacious' | 'dense'; accent: string; }
export const ThemeCtx = createContext<Theme>({ density: 'spacious', accent: '#00B4A0' });
export const useTheme = () => useContext(ThemeCtx);

export function Eyebrow({ children, color, style }: Readonly<{ children: ReactNode; color?: string; style?: CSSProperties }>) {
  const { accent } = useTheme();
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: color || accent, ...style }}>
      {children}
    </div>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'border' | 'dark';

const VARIANT_STYLES: Record<BtnVariant, (h: boolean, accent: string) => CSSProperties> = {
  primary:   (h, accent) => ({ background: h ? '#008C7C' : accent, color: '#fff' }),
  secondary: (h) => ({ background: h ? '#1E2D3D' : 'transparent', color: h ? '#fff' : '#1E2D3D', border: '1.5px solid #1E2D3D' }),
  ghost:     (h) => ({ background: h ? '#F0F3F5' : 'transparent', color: '#1E2D3D' }),
  subtle:    (h) => ({ background: h ? '#E6F8F6' : '#F7F9FA', color: '#1E2D3D', border: '1px solid #E8ECEF' }),
  border:    (h) => ({ background: h ? '#E6F8F6' : '#fff', color: '#008C7C', border: '1px solid #008C7C' }),
  dark:      (h) => ({ background: h ? '#2c425aff' : '#1E2D3D', color: '#fff', border: '1px solid #008C7C' }),
};

function getVariantStyle(variant: BtnVariant, hovered: boolean, accent: string): CSSProperties {
  return VARIANT_STYLES[variant](hovered, accent);
}

interface BtnProps {
  children?: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  icon?: ReactNode;
  style?: CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
export function Btn({ children, variant = 'primary', onClick, icon, style, size = 'sm', disabled }: Readonly<BtnProps>) {
  const { accent } = useTheme();
  const [h, setH] = useState(false);
  let pad = '10px 18px';
  if (size === 'sm') pad = '8px 14px';
  else if (size === 'lg') pad = '14px 28px';
  let fs = 14;
  if (size === 'sm') fs = 13;
  else if (size === 'lg') fs = 15;
  let s: CSSProperties = getVariantStyle(variant, h, accent);
  if (disabled) s = { ...s, opacity: 0.4, cursor: 'not-allowed' };
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: fs, padding: pad, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', lineHeight: 1, transition: 'background 150ms, color 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...s, ...style }}>
      {icon}{children}
    </button>
  );
}

interface CardProps { children: ReactNode; style?: CSSProperties; hoverable?: boolean; onClick?: () => void; pad?: boolean; }
export function Card({ children, style, hoverable, onClick, pad = true }: Readonly<CardProps>) {
  const { density } = useTheme();
  const [h, setH] = useState(false);
  let padding = 0;
  if (pad) padding = density === 'dense' ? 20 : 28;
  const baseStyle: CSSProperties = { background: '#fff', border: `1px solid ${h ? '#1E2D3D' : '#C8D4DC'}`, borderRadius: 8, padding, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 180ms', ...style };
  if (onClick) {
    return (
      <button type="button" onClick={onClick}
        onMouseEnter={() => { if (hoverable) setH(true); }}
        onMouseLeave={() => { if (hoverable) setH(false); }}
        style={{ ...baseStyle, display: 'block', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>
        {children}
      </button>
    );
  }
  return (
    <div
      onMouseEnter={() => { if (hoverable) setH(true); }}
      onMouseLeave={() => { if (hoverable) setH(false); }}
      style={baseStyle}>
      {children}
    </div>
  );
}

type TagTone = 'teal' | 'blue' | 'success' | 'danger' | 'warning' | 'neutral' | 'slate';
export function Tag({ children, tone = 'neutral', icon, style }: Readonly<{ children: ReactNode; tone?: TagTone; icon?: ReactNode; style?: CSSProperties }>) {
  const tones: Record<TagTone, { bg: string; fg: string }> = {
    teal:    { bg: '#E6F8F6', fg: '#008C7C' },
    blue:    { bg: '#E8F2FB', fg: '#2B7EC4' },
    success: { bg: '#F0FAF7', fg: '#1A6B55' },
    danger:  { bg: '#FFF8F8', fg: '#7C1D1D' },
    warning: { bg: '#FFF3E0', fg: '#B45309' },
    neutral: { bg: '#F0F3F5', fg: '#1E2D3D' },
    slate:   { bg: '#1E2D3D', fg: '#fff' },
  };
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: t.bg, color: t.fg, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, letterSpacing: 0.2, lineHeight: 1.5, whiteSpace: 'nowrap', ...style }}>
      {icon}{children}
    </span>
  );
}

export function Switch({ checked, onChange, label, sub }: Readonly<{ checked: boolean; onChange?: (v: boolean) => void; label?: string; sub?: string }>) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <span style={{ width: 38, height: 22, borderRadius: 999, background: checked ? '#00B4A0' : '#C8D4DC', position: 'relative', transition: 'background 150ms', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', transition: 'left 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
      </span>
      {label && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{label}</span>
          {sub && <span style={{ fontSize: 12, color: '#6B7E8E' }}>{sub}</span>}
        </span>
      )}
      <input type="checkbox" checked={checked} onChange={e => onChange?.(e.target.checked)} style={{ display: 'none' }}/>
    </label>
  );
}

export function Field({ label, hint, children }: Readonly<{ label: string; hint?: string; children: ReactNode }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{label}</label>
      </div>
      {children}
      {hint && <div style={{ fontSize: 12, color: '#6B7E8E', lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

interface InputProps { value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string; mono?: boolean; suffix?: ReactNode; prefix?: ReactNode; readOnly?: boolean; defaultValue?: string; step?: string; style?: CSSProperties; }
export function Input({ value, onChange, placeholder, type = 'text', mono, suffix, prefix, readOnly, defaultValue, step, style }: Readonly<InputProps>) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: readOnly ? '#F7F9FA' : '#fff', border: `1px solid ${f ? '#00B4A0' : '#C8D4DC'}`, borderRadius: 6, boxShadow: f ? '0 0 0 3px rgba(0,180,160,0.15)' : 'none', transition: 'border-color 120ms, box-shadow 120ms', ...style }}>
      {prefix && <span style={{ paddingLeft: 12, fontSize: 13, color: '#6B7E8E' }}>{prefix}</span>}
      <input type={type} value={value} defaultValue={defaultValue} placeholder={placeholder} readOnly={readOnly} step={step}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: 14, background: 'transparent', color: '#1E2D3D', minWidth: 0 }}/>
      {suffix && <span style={{ paddingRight: 12, fontSize: 13, color: '#6B7E8E' }}>{suffix}</span>}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, en, sub, right, style }: Readonly<{ eyebrow?: string; title: string; en?: string; sub?: string; right?: ReactNode; style?: CSSProperties }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 720 }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.01em', color: '#1E2D3D' }}>{title}</h1>
          {en && <span style={{ fontSize: 17, color: '#6B7E8E', fontWeight: 500 }}>{en}</span>}
        </div>
        {sub && <p style={{ fontSize: 15, color: '#3A4F63', lineHeight: 1.6, marginTop: 4 }}>{sub}</p>}
      </div>
      {right && <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}

export function Avatar({ name, size = 32, bg, src }: Readonly<{ name: string; size?: number; bg?: string; src?: string }>) {
  const [imgError, setImgError] = useState(false);
  const showImg = !!src && src.trim() !== '' && !imgError;
  const initials = (name || '').split(' ').filter(Boolean).slice(-2).map(p => p[0]).join('').toUpperCase() || '?';
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: bg || '#1E2D3D', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0, overflow: 'hidden' }}>
      {showImg
        ? <img src={src} alt={name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </span>
  );
}

export function EmptyState({ icon, title, sub, action }: Readonly<{ icon: ReactNode; title: string; sub?: string; action?: ReactNode }>) {
  return (
    <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px dashed #C8D4DC', borderRadius: 12, background: '#FAFBFC' }}>
      <div style={{ color: '#6B7E8E' }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D' }}>{title}</h4>
        {sub && <p style={{ fontSize: 13, color: '#6B7E8E', maxWidth: 420 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ w, h = 16, radius = 6, style }: Readonly<{ w?: string | number; h?: string | number; radius?: number; style?: CSSProperties }>) {
  return (
    <div style={{
      width: w ?? '100%', height: h, borderRadius: radius, flexShrink: 0,
      background: 'linear-gradient(90deg, #E8ECEF 25%, #F4F6F8 50%, #E8ECEF 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s ease infinite',
      ...style,
    }} />
  );
}

export function SkeletonCard({ lines = 3, style }: Readonly<{ lines?: number; style?: CSSProperties }>) {
  return (
    <Card style={style}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton h={20} w="55%" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={'skel-' + i} h={14} w={i === lines - 1 ? '35%' : '100%'} />
        ))}
      </div>
    </Card>
  );
}

export function ErrorBanner({ message, onRetry }: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <div style={{
      padding: '12px 16px', background: '#FFF8F8', border: '1px solid #FED7D7',
      borderRadius: 8, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, marginBottom: 16,
    }}>
      <span style={{ fontSize: 13, color: '#7C1D1D' }}>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export const iconBtn: CSSProperties = {
  width: 28, height: 28, border: '1px solid transparent', background: 'transparent',
  cursor: 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', transition: 'background 120ms, border-color 120ms',
};

export const pageBtn: CSSProperties = {
  padding: '6px 12px', background: '#fff', border: '1px solid #C8D4DC', borderRadius: 6,
  fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1E2D3D', cursor: 'pointer',
};

interface FilterDropOption { value: string; label: string; }
interface FilterDropProps {
  label: string; en?: string; count?: string | number;
  options?: FilterDropOption[]; value?: string; onChange?: (v: string) => void;
}
export function FilterDrop({ label, en, count, options, value, onChange }: Readonly<FilterDropProps>) {
  const ChevD = Icons.chevD;
  const [open, setOpen] = useState(false);
  if (!options) {
    return (
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #C8D4DC', borderRadius: 6, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#1E2D3D', cursor: 'pointer' }}>
        <span>{label}</span>
        {count !== undefined && <span style={{ color: '#6B7E8E', fontWeight: 500, fontSize: 11 }}>· {count}</span>}
        <ChevD size={12} stroke="#6B7E8E"/>
      </button>
    );
  }
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #C8D4DC', borderRadius: 6, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#1E2D3D', cursor: 'pointer' }}
      >
        <span>{label}</span>
        <ChevD size={12} stroke="#6B7E8E"/>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #C8D4DC', borderRadius: 8, marginTop: 4, minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange?.(opt.value); setOpen(false); }}
              style={{ width: '100%', padding: '10px 14px', background: value === opt.value ? '#F0FBF9' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: value === opt.value ? '#008C7C' : '#1E2D3D', fontWeight: value === opt.value ? 600 : 400, borderBottom: '1px solid #F0F3F5' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
