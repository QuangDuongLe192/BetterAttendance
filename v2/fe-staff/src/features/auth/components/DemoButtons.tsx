export function DemoButtons({
  onDemoLogin,
  onDemoManager,
  onDemoAdmin,
}: {
  onDemoLogin: () => void;
  onDemoManager: () => void;
  onDemoAdmin: () => void;
}) {
  return (
    <div style={{ marginTop: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
        ── Dev mode ──
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onDemoLogin}
          style={{
            background: 'transparent', border: '1px dashed var(--c-teal)',
            borderRadius: 'var(--r-md)', padding: '12px 20px',
            fontSize: 14, color: 'var(--c-teal)', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, width: 240, minHeight: 48,
          }}
        >
          🚀 Demo nhân viên
        </button>
        <button
          onClick={onDemoManager}
          style={{
            background: 'transparent', border: '1px dashed var(--c-warning)',
            borderRadius: 'var(--r-md)', padding: '12px 20px',
            fontSize: 14, color: 'var(--c-warning)', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, width: 240, minHeight: 48,
          }}
        >
          🏪 Demo quản lý chi nhánh
        </button>
        <button
          onClick={onDemoAdmin}
          style={{
            background: 'transparent', border: '1px dashed var(--c-danger)',
            borderRadius: 'var(--r-md)', padding: '12px 20px',
            fontSize: 14, color: 'var(--c-danger)', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, width: 240, minHeight: 48,
          }}
        >
          👑 Demo admin
        </button>
      </div>
    </div>
  );
}
