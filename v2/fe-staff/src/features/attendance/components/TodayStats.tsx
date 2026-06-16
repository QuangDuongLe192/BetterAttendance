import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ShiftItemDto } from '../types';
import { formatMinutes } from '../../../shared/lib/date';
import { Skeleton } from '../../../shared/components/ui/Skeleton';

function shiftDurationMinutes(shift: ShiftItemDto): number {
  return Math.round((shift.end - shift.start) / 60000);
}

export function TodayStats({ shifts, isPending }: { shifts: ShiftItemDto[]; isPending: boolean }) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const totalShifts = shifts.length;
  const totalMinutes = useMemo(
    () => shifts.reduce((acc, s) => acc + shiftDurationMinutes(s), 0),
    [shifts],
  );

  if (isPending) {
    return (
      <div className="cd-stats-backdrop" style={{ marginBottom: 16 }}>
        <div className="cd-glass-stats">
          {[0, 1].map((i) => (
            <div key={i} className="cd-glass-card" style={{ minHeight: 60, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              <Skeleton height={11} width="50%" borderRadius={4} />
              <Skeleton height={20} width="70%" borderRadius={4} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (totalShifts === 0) return null;

  const items = [
    { label: isVi ? 'Số ca' : 'Shifts', value: `${totalShifts}` },
    { label: isVi ? 'Tổng giờ' : 'Hours', value: formatMinutes(totalMinutes) },
  ];

  return (
    <div
      className="cd-stats-backdrop"
      style={{ animation: 'cd-page-enter 300ms 40ms var(--ease-out) both' }}
    >
      <div className="cd-glass-stats">
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            <div className="cd-glass-card">
              <div className="cd-glass-card__value">{item.value}</div>
              <div className="cd-glass-card__label">{item.label}</div>
            </div>
            {idx < items.length - 1 && <div className="cd-glass-div" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
