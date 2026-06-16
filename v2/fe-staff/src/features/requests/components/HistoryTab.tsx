import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusDropdown } from './StatusDropdown';
import { RequestRow } from './RequestRow';
import { groupByMonth } from '../lib/requestHelpers';
import type { RequestDto, StatusFilter } from '../types';

export function HistoryTab({
  requests,
  counts,
  hasNextPage,
  statusFilter,
  onStatusChange,
  onLoadMore,
}: {
  requests: RequestDto[];
  counts: Record<StatusFilter, number>;
  hasNextPage: boolean;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  onLoadMore: () => void;
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const grouped = groupByMonth(requests, i18n.language);

  return (
    <>
      <StatusDropdown value={statusFilter} counts={counts} onChange={onStatusChange} />

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--fg-3)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            {t('requests.empty')}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: 'var(--c-teal)', marginBottom: 10,
              }}>
                {label}
              </div>
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
                borderRadius: 'var(--r-lg)', overflow: 'hidden',
              }}>
                {items.map((req, idx) => (
                  <RequestRow
                    key={req.id}
                    req={req}
                    isLast={idx === items.length - 1}
                    onPress={() => navigate(`/requests/${req.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          className="cd-link"
          style={{ padding: '12px 0', textAlign: 'center', width: '100%' }}
          onClick={onLoadMore}
        >
          {t('common.loadMore')}
        </button>
      )}
    </>
  );
}
