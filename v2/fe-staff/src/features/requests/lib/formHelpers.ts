export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)', fontWeight: 600,
  fontSize: 12, color: 'var(--fg-3)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
};

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-page)', border: '1px solid var(--line-1)',
  borderRadius: 'var(--r-md)', fontSize: 15, color: 'var(--fg-1)',
  fontFamily: 'var(--font-display)',
};

export function formatShiftDate(isoDate: string, lang: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (isoDate === today) return lang === 'vi' ? 'Hôm nay' : 'Today';
  const [y, m, d] = isoDate.split('-');
  return lang === 'vi' ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
}
