import { useTranslation } from 'react-i18next';
import { getRequestStatusColor } from '../../../shared/lib/date';
import { StatusBadge } from './StatusBadge';
import type { RequestDto } from '../types';

export function RequestRow({
  req,
  isLast,
  onPress,
}: {
  req: RequestDto;
  isLast: boolean;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const dateStr = req.endDate
    ? `${new Date(req.startDate + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })} — ${new Date(req.endDate + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}`
    : new Date(req.startDate + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const leftBorderColor = getRequestStatusColor(req.status);

  return (
    <button
      onClick={onPress}
      style={{
        width: '100%', background: 'transparent', border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--line-2)',
        borderLeft: `3px solid ${leftBorderColor}`,
        padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background var(--t-fast) var(--ease-out)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>
          {t(`requests.types.${req.type}`)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
          {dateStr} · <span style={{ color: 'var(--fg-2)' }}>{req.reason}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <StatusBadge status={req.status} />
      </div>
    </button>
  );
}
