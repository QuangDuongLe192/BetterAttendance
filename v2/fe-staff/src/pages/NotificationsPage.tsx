import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ApiError } from '../shared/types';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { useMarkRead } from '../features/notifications/hooks/useMarkRead';
import { useMarkAllRead } from '../features/notifications/hooks/useMarkAllRead';
import { useNotificationStore } from '../store/notificationStore';
import { SkeletonList } from '../shared/components/ui/Skeleton';
import { usePullToRefresh } from '../shared/hooks/usePullToRefresh';
import { NotificationItem } from '../features/notifications/components/NotificationItem';
import type { NotificationDto, NotificationFilter } from '../features/notifications/types';

const FILTERS: NotificationFilter[] = ['all', 'unread'];

export function NotificationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const totalUnread = useNotificationStore((s) => s.unreadCount);

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const { data, fetchNextPage, hasNextPage, isLoading, refetch } = useNotifications(filter);
  const { containerRef, onTouchStart, onTouchEnd, dragOffset } = usePullToRefresh(() => { refetch(); });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const onSwipeStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  }, []);
  const onSwipeEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    const idx = FILTERS.indexOf(filter);
    if (dx < 0 && idx < FILTERS.length - 1) setFilter(FILTERS[idx + 1]);
    else if (dx > 0 && idx > 0) setFilter(FILTERS[idx - 1]);
  }, [filter]);

  const filterIdx = FILTERS.indexOf(filter);

  const allNotifications: NotificationDto[] = data?.pages.flatMap((p) => p.notifications) ?? [];
  const unread = allNotifications.filter((n) => !n.isRead);
  const read = allNotifications.filter((n) => n.isRead);

  const handleClick = (n: NotificationDto) => {
    if (!n.isRead) {
      markRead.mutate(n.id, {
        onSettled: () => navigate(n.actionTarget),
      });
    } else {
      navigate(n.actionTarget);
    }
  };

  return (
    <div className="cd-page" ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {dragOffset > 0 && (
        <div
          className="cd-ptr-indicator"
          style={{ '--ptr-progress': dragOffset / 72 } as React.CSSProperties}
        />
      )}
      <ScreenHeader title={t('notifications.title')} />

      <div className="cd-filter-tabs" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>
        <button className={`cd-filter-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          {t('notifications.all')}
        </button>
        <button className={`cd-filter-tab${filter === 'unread' ? ' active' : ''}`} onClick={() => setFilter('unread')}>
          {t('notifications.unread')}
          {totalUnread > 0 && <span className="cd-filter-badge">{totalUnread}</span>}
        </button>
        <div className="cd-filter-tab-indicator" style={{ transform: `translateX(${filterIdx * 100}%)` }} />
      </div>

      {totalUnread > 0 && (
        <div className="cd-noti-actions">
          <button
            className="cd-link"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            {markAllRead.isPending ? '…' : t('notifications.markAllRead')}
          </button>
          {markAllRead.isError && (
            <span style={{ fontSize: 12, color: 'var(--c-danger, #cf1322)', marginLeft: 8 }}>
              {t((markAllRead.error as unknown as ApiError)?.messageKey ?? 'error.generic', { defaultValue: t('error.generic') })}
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonList rows={5} />
      ) : allNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-3)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {filter === 'unread' ? t('notifications.emptyUnread') : t('notifications.empty')}
          </div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <div className="cd-noti-section">
              <div className="cd-section-label">{t('notifications.newSection')}</div>
              <div className="cd-inbox">
                {unread.map(n => (
                  <NotificationItem key={n.id} notification={n} unread onClick={handleClick} />
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && filter === 'all' && (
            <div>
              <div className="cd-section-label">{t('notifications.earlierSection')}</div>
              <div className="cd-inbox">
                {read.map(n => (
                  <NotificationItem key={n.id} notification={n} unread={false} onClick={handleClick} />
                ))}
                {hasNextPage && (
                  <button className="cd-link" style={{ padding: '12px 0', width: '100%' }} onClick={() => fetchNextPage()}>
                    {t('common.loadMore')}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
