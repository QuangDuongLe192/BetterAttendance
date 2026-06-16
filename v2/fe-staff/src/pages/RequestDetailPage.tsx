import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useRequestDetail } from '../features/requests/hooks/useRequestDetail';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: req, isPending } = useRequestDetail(id ?? '');

  if (isPending || !req) {
    return (
      <div className="cd-page">
        <ScreenHeader title="…" />
        <div className="cd-card" style={{ minHeight: 120 }} />
      </div>
    );
  }

  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const fmtDateTime = (d: string | number) => new Date(d).toLocaleString(
    lang === 'vi' ? 'vi-VN' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="cd-page">
      <ScreenHeader title={t(`requests.types.${req.type}`)} />

      {/* Status badge */}
      <div style={{
        marginBottom: 20, paddingBottom: 16,
        borderBottom: '1px solid var(--line-2)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span className={`cd-badge cd-badge--${req.status}`}>
          {t(`requests.status.${req.status}`)}
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
          {new Date(req.submittedAt).toLocaleDateString(
            i18n.language === 'vi' ? 'vi-VN' : 'en-US',
            { day: '2-digit', month: '2-digit', year: 'numeric' }
          )}
        </span>
      </div>

      <div className="cd-card">
        <div className="cd-detail" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="cd-muted">{t('requests.form.date')}</div>
            <div className="cd-detail__v">
              {req.endDate ? `${fmtDate(req.startDate)} — ${fmtDate(req.endDate)}` : fmtDate(req.startDate)}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="cd-muted">{t('requests.form.reason')}</div>
            <div className="cd-detail__v" style={{ fontSize: 15 }}>{req.reason}</div>
          </div>
        </div>
      </div>

      {req.reviewerName && (
        <div className="cd-card" style={{ borderLeft: '3px solid var(--c-teal)' }}>
          <div className="cd-detail" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <div className="cd-muted">{t('requests.detail.reviewer')}</div>
              <div className="cd-detail__v" style={{ fontSize: 15 }}>{req.reviewerName}</div>
            </div>
            {req.reviewedAt && (
              <div style={{ marginTop: 8 }}>
                <div className="cd-muted">{t('requests.detail.reviewedAt')}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 2 }}>{fmtDateTime(req.reviewedAt)}</div>
              </div>
            )}
            {req.reviewComment && (
              <div style={{ marginTop: 8 }}>
                <div className="cd-muted">{t('requests.detail.comment')}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 2, fontStyle: 'italic' }}>"{req.reviewComment}"</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
