import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../../../shared/lib/date';
import type { NotificationDto } from '../types';

export function NotificationItem({
  notification,
  unread,
  onClick,
}: {
  notification: NotificationDto;
  unread: boolean;
  onClick: (n: NotificationDto) => void;
}) {
  const { i18n } = useTranslation();
  const cls = unread ? 'cd-note cd-note--unread cd-note--btn' : 'cd-note cd-note--btn cd-note--read';

  return (
    <button key={notification.id} className={cls} onClick={() => onClick(notification)}>
      <div className="cd-note__body">
        <div className="cd-note__head">
          <strong>{notification.title}</strong>
          <span>{formatRelativeTime(notification.timestamp, i18n.language)}</span>
        </div>
        <p>{notification.message}</p>
      </div>
    </button>
  );
}
