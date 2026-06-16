import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';


interface ActivityRow {
  date: string;
  locationName: string;
  clockIn: string;
  clockOut: string;
  durationLabel: string;
}

const SEED_ACTIVITY: ActivityRow[] = [
  { date: '11/05', locationName: 'Crescent Mall · Q7', clockIn: '09:02', clockOut: '17:05', durationLabel: '8h03' },
  { date: '10/05', locationName: 'Crescent Mall · Q7', clockIn: '09:00', clockOut: '17:00', durationLabel: '8h00' },
  { date: '09/05', locationName: 'Vincom · Q1',         clockIn: '13:04', clockOut: '21:00', durationLabel: '7h56' },
  { date: '08/05', locationName: 'Vincom · Q1',         clockIn: '13:00', clockOut: '21:03', durationLabel: '8h03' },
  { date: '07/05', locationName: 'Crescent Mall · Q7', clockIn: '10:01', clockOut: '18:00', durationLabel: '7h59' },
];

export function ActivityPage() {
  const { t } = useTranslation();

  return (
    <div className="cd-page">
      <ScreenHeader title={t('attendance.activity.title')} />

      <div className="cd-card">
        <div className="cd-stats">
          <div>
            <span style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {t('attendance.activity.shiftsLogged')}
            </span>
            <strong>{SEED_ACTIVITY.length}</strong>
          </div>
          <div className="cd-stats__div" />
          <div>
            <span style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {t('attendance.earnings.hoursWorked')}
            </span>
            <strong>40h01</strong>
          </div>
        </div>
      </div>

      <div className="cd-card">
        <div style={{ marginTop: 8 }}>
          {SEED_ACTIVITY.map((row, i) => (
            <div key={i} className={`cd-act${i === SEED_ACTIVITY.length - 1 ? ' cd-act--last' : ''}`}>
              <div>
                <div className="cd-act__date">{row.date}</div>
                <div className="cd-act__loc">{row.locationName}</div>
              </div>
              <div className="cd-act__times">
                <div>
                  <span>{row.clockIn}</span>
                  <span style={{ color: 'var(--fg-3)' }}>—</span>
                  <span>{row.clockOut}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{row.durationLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
