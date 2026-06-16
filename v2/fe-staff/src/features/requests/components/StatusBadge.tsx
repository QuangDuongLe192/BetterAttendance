import { useTranslation } from 'react-i18next';

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span className={`cd-badge cd-badge--${status}`}>
      {t(`requests.status.${status}`)}
    </span>
  );
}
