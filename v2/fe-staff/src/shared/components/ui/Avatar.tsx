interface AvatarProps {
  name: string;
  size?: number;
  tone?: 'teal' | 'gray';
  ring?: boolean;
}

export function Avatar({ name, size = 36, tone = 'teal', ring = false }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).slice(-2).join('');
  const bg = tone === 'teal' ? 'var(--c-teal)' : 'var(--c-gray-tint)';
  const fg = tone === 'teal' ? 'white' : 'var(--c-slate)';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.36,
      flexShrink: 0, letterSpacing: '-0.02em',
      ...(ring ? {
        boxShadow: '0 0 0 3px var(--c-teal-light), 0 0 0 5px var(--c-teal)',
      } : {}),
    }}>
      {initials}
    </div>
  );
}
