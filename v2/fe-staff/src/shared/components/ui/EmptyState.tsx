interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  sub?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, message, sub, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center',
    }}>
      {icon && (
        <div style={{ color: 'var(--fg-3)', marginBottom: 4, opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
        color: 'var(--fg-2)', margin: 0,
      }}>
        {message}
      </p>
      {sub && (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>
          {sub}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
