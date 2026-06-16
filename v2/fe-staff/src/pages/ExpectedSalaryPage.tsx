import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { Skeleton } from '../shared/components/ui/Skeleton';
import { Icons } from '../shared/components/Icons';
import { useEarnings, currentMonth } from '../features/attendance/hooks/useEarnings';
import { vndFormatter } from '../shared/lib/date';
import type { EarningsShift } from '../features/attendance/types';

const CHEVRON_STYLE: React.CSSProperties = {
  transition: 'transform 200ms ease',
  flexShrink: 0,
};

function addMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}


interface RoleGroup {
  roleName: string;
  rateVnd: number;
  shifts: EarningsShift[];
  totalEarningsVnd: number;
  totalHours: number;
}

interface LocationGroup {
  locationName: string;
  roles: RoleGroup[];
  totalEarningsVnd: number;
  totalHours: number;
}

function groupByLocationAndRole(shifts: EarningsShift[]): LocationGroup[] {
  const locMap = new Map<string, LocationGroup>();

  for (const shift of shifts) {
    const locKey = shift.locationName;
    if (!locMap.has(locKey)) {
      locMap.set(locKey, { locationName: locKey, roles: [], totalEarningsVnd: 0, totalHours: 0 });
    }
    const loc = locMap.get(locKey)!;
    loc.totalEarningsVnd += shift.earningsVnd;
    loc.totalHours += shift.hoursWorked;

    let role = loc.roles.find(r => r.roleName === shift.roleName);
    if (!role) {
      role = { roleName: shift.roleName, rateVnd: shift.rateVnd, shifts: [], totalEarningsVnd: 0, totalHours: 0 };
      loc.roles.push(role);
    }
    role.shifts.push(shift);
    role.totalEarningsVnd += shift.earningsVnd;
    role.totalHours += shift.hoursWorked;
  }

  return Array.from(locMap.values());
}

function LocationCard({ group }: { group: LocationGroup }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="cd-card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
      {/* Header — bấm để toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
          padding: '14px 16px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'var(--c-teal-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.pin size={14} sw={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: 'var(--fg-1)',
              fontFamily: 'var(--font-display)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {group.locationName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>
              {group.roles.reduce((s, r) => s + r.shifts.length, 0)} {t('expectedSalary.shiftsUnit')}
              <span style={{ margin: '0 5px', color: 'var(--line-1)' }}>·</span>
              {group.totalHours % 1 === 0 ? group.totalHours : group.totalHours.toFixed(1)} {t('expectedSalary.hoursUnit')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            color: 'var(--c-teal)', fontVariantNumeric: 'tabular-nums',
          }}>
            {vndFormatter.format(group.totalEarningsVnd)}₫
          </div>
          <Icons.chevR
            size={16}
            sw={2}
            style={{ ...CHEVRON_STYLE, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Danh sách vai trò — mỗi role là 1 row tổng hợp */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--line-2)', padding: '0 16px' }}>
          {group.roles.map((role, i) => {
            const isLast = i === group.roles.length - 1;
            const hrs = role.totalHours % 1 === 0 ? role.totalHours : role.totalHours.toFixed(1);
            return (
              <div key={role.roleName} className={`cd-break${isLast ? ' cd-break--last' : ''}`}>
                <div className="cd-break__lbl">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--fg-1)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icons.user size={12} sw={2} />
                      {role.roleName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                      {role.shifts.length} {t('expectedSalary.shiftsUnit')}
                      <span style={{ margin: '0 4px', color: 'var(--line-1)' }}>·</span>
                      {hrs} {t('expectedSalary.hoursUnit')}
                      <span style={{ margin: '0 4px', color: 'var(--line-1)' }}>·</span>
                      {vndFormatter.format(role.rateVnd)}₫/giờ
                    </div>
                  </div>
                </div>
                <div className="cd-break__amt">{vndFormatter.format(role.totalEarningsVnd)}₫</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ExpectedSalaryPage() {
  const { t } = useTranslation();
  const thisMonth = currentMonth();
  const [month, setMonth] = useState(thisMonth);
  const { data, isLoading, isError } = useEarnings(month);

  const [mYear, mMonth] = month.split('-').map(Number);
  const isCurrentMonth = month === thisMonth;
  const locationGroups = data?.shiftBreakdown ? groupByLocationAndRole(data.shiftBreakdown) : [];

  return (
    <div className="cd-page">
      <ScreenHeader title={t('expectedSalary.title')} />

      {/* Month navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 6px',
      }}>
        <button
          onClick={() => setMonth(m => addMonth(m, -1))}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icons.arrowL size={16} />
        </button>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
          {t('expectedSalary.monthNav', { month: mMonth, year: mYear })}
        </div>

        <button
          onClick={() => !isCurrentMonth && setMonth(m => addMonth(m, 1))}
          disabled={isCurrentMonth}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isCurrentMonth ? 'transparent' : 'var(--bg-surface)',
            border: `1px solid ${isCurrentMonth ? 'transparent' : 'var(--line-1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isCurrentMonth ? 'default' : 'pointer',
            opacity: isCurrentMonth ? 0.3 : 1,
          }}
        >
          <Icons.arrowR size={16} />
        </button>
      </div>

      {/* Card tổng quan */}
      <div className="cd-card">
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--c-teal)',
          textTransform: 'uppercase', letterSpacing: '3px',
          fontFamily: 'var(--font-display)', marginBottom: 12,
        }}>
          {t('expectedSalary.eyebrow')}
        </div>

        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          {t('expectedSalary.monthNav', { month: mMonth, year: mYear })}
        </div>

        {isLoading && <div style={{ marginTop: 4 }}><Skeleton height={48} width={200} borderRadius={8} /></div>}
        {isError && <div style={{ color: 'var(--fg-3)', fontSize: 14, marginTop: 8 }}>{t('error.generic')}</div>}
        {!isLoading && !isError && !data && (
          <div style={{ color: 'var(--fg-3)', fontSize: 14, marginTop: 8 }}>{t('expectedSalary.empty')}</div>
        )}
        {!isLoading && !isError && data && (
          <div className="cd-earn__num" style={{ marginTop: 4 }}>
            {vndFormatter.format(data.grossEarningsVnd)} <span>₫</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
          {isLoading ? (
            <>
              <Skeleton height={36} width={72} borderRadius={6} />
              <Skeleton height={36} width={72} borderRadius={6} />
            </>
          ) : data ? (
            <>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('expectedSalary.shifts')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', marginTop: 2 }}>
                  {data.shifts} <span style={{ fontSize: 12, fontWeight: 500 }}>{t('expectedSalary.shiftsUnit')}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('expectedSalary.hours')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', marginTop: 2 }}>
                  {data.hours} <span style={{ fontSize: 12, fontWeight: 500 }}>{t('expectedSalary.hoursUnit')}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

      </div>

      {/* Card cách tính lương */}
      <div className="cd-card" style={{ marginTop: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--c-teal)',
          textTransform: 'uppercase', letterSpacing: '3px',
          fontFamily: 'var(--font-display)', marginBottom: 8,
        }}>
          {t('expectedSalary.payPeriod')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6 }}>
          {t('expectedSalary.payPeriodDesc')}
        </div>
      </div>

      {/* Breakdown theo địa điểm */}
      <div style={{ paddingTop: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--c-teal)',
          textTransform: 'uppercase', letterSpacing: '3px',
          fontFamily: 'var(--font-display)',
          padding: '4px 16px 10px',
        }}>
          {t('expectedSalary.howCalc')}
        </div>

        {/* Skeleton */}
        {isLoading && (
          <>
            {[2, 3].map((rows, i) => (
              <div key={i} className="cd-card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Skeleton width={30} height={30} borderRadius={8} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <Skeleton height={14} width={120} borderRadius={4} />
                      <Skeleton height={11} width={80} borderRadius={4} />
                    </div>
                  </div>
                  <Skeleton height={18} width={80} borderRadius={4} />
                </div>
                <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 0 }}>
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: j < rows - 1 ? '1px solid var(--line-2)' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <Skeleton height={13} width={100} borderRadius={4} />
                        <Skeleton height={11} width={130} borderRadius={4} />
                      </div>
                      <Skeleton height={14} width={70} borderRadius={4} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Location group cards */}
        {!isLoading && locationGroups.length > 0 && (
          <>
            {locationGroups.map(group => (
              <LocationCard key={group.locationName} group={group} />
            ))}

            {/* Total */}
            <div className="cd-card" style={{
              background: 'var(--c-teal-light)',
              border: '1px solid var(--c-teal)',
              marginTop: 4,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>
                  {t('expectedSalary.total')}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                  color: 'var(--c-teal-dark)', fontVariantNumeric: 'tabular-nums',
                }}>
                  {vndFormatter.format(data!.grossEarningsVnd)}₫
                </div>
              </div>
            </div>
          </>
        )}

        {!isLoading && data && locationGroups.length === 0 && (
          <div className="cd-card">
            <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>{t('expectedSalary.noShiftData')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
