import React from 'react';

interface ScreenHeaderProps {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, right, onBack }: ScreenHeaderProps) {
  return (
    <div className="cd-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', padding: '0 4px 0 0',
                cursor: 'pointer', color: 'var(--c-teal)', fontSize: 22,
                lineHeight: 1, flexShrink: 0, display: 'flex', alignItems: 'center',
              }}
              aria-label="Quay lại"
            >
              ‹
            </button>
          )}
          <h1 className="cd-h1" style={{ marginTop: 0, marginBottom: 0 }}>
            {title}
          </h1>
        </div>
        {right && <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{right}</div>}
      </div>
    </div>
  );
}
