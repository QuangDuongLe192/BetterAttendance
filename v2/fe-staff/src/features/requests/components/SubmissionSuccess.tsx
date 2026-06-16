import { useTranslation } from 'react-i18next';

export function SubmissionSuccess() {
  const { t } = useTranslation();
  return (
    <div className="cd-page" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', minHeight: '70vh',
    }}>
      <div className="cd-success" />
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 18, marginTop: 20, textAlign: 'center',
      }}>
        {t('requests.submitted')}
      </div>
      <p style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 8, textAlign: 'center' }}>
        {t('requests.submittedSub')}
      </p>
    </div>
  );
}
