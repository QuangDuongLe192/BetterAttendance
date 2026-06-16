export function SignalBars({ bars, active }: { bars: number; active: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[1, 2, 3, 4].map(b => (
        <span key={b} style={{
          width: 3, height: 3 + b * 3, borderRadius: 1,
          background: b <= bars ? (active ? '#00B4A0' : '#3A4F63') : '#E8ECEF',
          transition: 'background 150ms',
        }} />
      ))}
    </span>
  );
}
