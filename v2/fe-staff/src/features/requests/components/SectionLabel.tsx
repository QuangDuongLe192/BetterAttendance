export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
      letterSpacing: '2.5px', textTransform: 'uppercase',
      color: 'var(--c-teal)', marginBottom: 10,
    }}>
      {children}
    </div>
  );
}
