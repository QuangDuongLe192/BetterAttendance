import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useRequests } from '../features/requests/hooks/useRequests';
import { usePullToRefresh } from '../shared/hooks/usePullToRefresh';
import { CreateTab } from '../features/requests/components/CreateTab';
import { HistoryTab } from '../features/requests/components/HistoryTab';
import type { StatusFilter } from '../features/requests/types';

export function RequestsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [tab, setTab] = useState<'create' | 'history'>(location.state?.tab ?? 'create');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, fetchNextPage, hasNextPage, refetch } = useRequests(statusFilter);
  const { containerRef, onTouchStart, onTouchEnd, dragOffset } = usePullToRefresh(() => { refetch(); });

  const allRequests = data?.pages.flatMap((p) => p.requests) ?? [];
  const counts = data?.pages[0]?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="cd-page" ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {dragOffset > 0 && (
        <div
          className="cd-ptr-indicator"
          style={{ '--ptr-progress': dragOffset / 72 } as React.CSSProperties}
        />
      )}
      <ScreenHeader title={t('requests.title')} />

      <div className="cd-filter-tabs">
        <button
          className={`cd-filter-tab${tab === 'create' ? ' active' : ''}`}
          onClick={() => setTab('create')}
        >
          {t('requests.createNew')}
        </button>
        <button
          className={`cd-filter-tab${tab === 'history' ? ' active' : ''}`}
          onClick={() => setTab('history')}
        >
          {t('requests.history')}
        </button>
        <div
          className="cd-filter-tab-indicator"
          style={{ transform: `translateX(${(['create', 'history'] as const).indexOf(tab) * 100}%)` }}
        />
      </div>

      {tab === 'create' && <CreateTab />}

      {tab === 'history' && (
        <HistoryTab
          requests={allRequests}
          counts={counts}
          hasNextPage={!!hasNextPage}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onLoadMore={() => fetchNextPage()}
        />
      )}
    </div>
  );
}
