interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, className }: SkeletonProps) {
  return (
    <div
      className={`cd-skeleton${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="cd-card">
      <Skeleton height={14} width="45%" borderRadius={4} />
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={13} width={i === lines - 1 ? '60%' : '100%'} borderRadius={4} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="cd-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
          <Skeleton width={36} height={36} borderRadius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton height={13} width="55%" borderRadius={4} />
            <Skeleton height={11} width="35%" borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}
