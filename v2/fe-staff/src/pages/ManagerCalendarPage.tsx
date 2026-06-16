import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useManagerEmployees, useManagerShifts } from '../features/attendance/hooks/useManagerCalendar';
import type { ManagerEmployee, ManagerShift } from '../mocks/handlers';
import { getWeekStart, toIsoDate } from '../shared/lib/date';

const WEEK_DAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEK_DAYS_FULL_VI = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

type ViewMode = 'employee' | 'day';

const STATUS_COLOR: Record<ManagerShift['status'], string> = {
  scheduled: 'var(--c-teal)',
  completed:  'var(--c-success)',
  absent:     'var(--c-danger)',
};

const STATUS_BG: Record<ManagerShift['status'], string> = {
  scheduled: 'rgba(0,180,160,0.1)',
  completed:  'rgba(16,185,129,0.1)',
  absent:     'rgba(239,68,68,0.1)',
};

const STATUS_LABEL: Record<ManagerShift['status'], string> = {
  scheduled: 'Đã xếp',
  completed:  'Hoàn thành',
  absent:     'Vắng mặt',
};

function getInitials(name: string) {
  return name.split(' ').slice(-2).map(p => p[0]).join('').toUpperCase();
}

function getWeekDates(weekOffset: number): string[] {
  const base = new Date();
  const monday = new Date(getWeekStart(base) + 'T00:00:00');
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toIsoDate(d);
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// View theo nhân viên — collapsible per employee
function EmployeeView({
  employees,
  shifts,
  weekDates,
}: {
  employees: ManagerEmployee[];
  shifts: ManagerShift[];
  weekDates: string[];
}) {
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
      {employees.map(emp => {
        const empShifts = shifts.filter(s => s.employeeId === emp.id);
        const isExpanded = expandedEmp === emp.id;

        return (
          <div key={emp.id} className="cd-card" style={{ padding: '14px 16px', overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedEmp(isExpanded ? null : emp.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 0, textAlign: 'left', marginBottom: 10,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--c-teal)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}>
                {getInitials(emp.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{emp.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--c-teal)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {empShifts.length} ca
                </div>
                <span style={{
                  fontSize: 16, color: 'var(--fg-3)', lineHeight: 1,
                  display: 'inline-block',
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>›</span>
              </div>
            </button>

            {/* Dải ngày mini — always visible */}
            <div style={{ display: 'flex', gap: 4 }}>
              {weekDates.map((date, i) => {
                const shift = empShifts.find(s => s.date === date);
                return (
                  <div
                    key={date}
                    title={shift ? `${shift.startTime}–${shift.endTime} (${STATUS_LABEL[shift.status]})` : 'Nghỉ'}
                    style={{
                      flex: 1, textAlign: 'center', borderRadius: 'var(--r-sm)',
                      padding: '4px 2px',
                      background: shift ? STATUS_BG[shift.status] : 'var(--bg-1)',
                      border: `1px solid ${shift ? STATUS_COLOR[shift.status] + '55' : 'var(--line-1)'}`,
                    }}
                  >
                    <div style={{ fontSize: 9, color: 'var(--fg-3)', fontWeight: 600 }}>
                      {WEEK_DAYS_VI[i]}
                    </div>
                    {shift ? (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: STATUS_COLOR[shift.status],
                        margin: '3px auto 0',
                      }} />
                    ) : (
                      <div style={{ width: 6, height: 6, margin: '3px auto 0' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shift list — only when expanded */}
            {isExpanded && empShifts.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {empShifts.map(shift => (
                  <div key={shift.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderTop: '1px solid var(--line-1)',
                  }}>
                    <div style={{
                      width: 3, height: 28, borderRadius: 2, flexShrink: 0,
                      background: STATUS_COLOR[shift.status],
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
                        {WEEK_DAYS_FULL_VI[weekDates.indexOf(shift.date)]} · {shift.startTime}–{shift.endTime}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px',
                      borderRadius: 'var(--r-sm)',
                      background: STATUS_BG[shift.status],
                      color: STATUS_COLOR[shift.status],
                      fontFamily: 'var(--font-display)',
                    }}>
                      {STATUS_LABEL[shift.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {isExpanded && empShifts.length === 0 && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line-1)', color: 'var(--fg-3)', fontSize: 13 }}>
                Không có ca tuần này.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// View theo ngày
function DayView({ shifts, weekDates }: { shifts: ManagerShift[]; weekDates: string[] }) {
  const today = toIsoDate(new Date());
  const [expandedDay, setExpandedDay] = useState<string | null>(weekDates[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
      {weekDates.map((date, i) => {
        const dayShifts = shifts.filter(s => s.date === date);
        const isExpanded = expandedDay === date;
        const isToday = date === today;
        const absentCount = dayShifts.filter(s => s.status === 'absent').length;

        return (
          <div key={date} className="cd-card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedDay(isExpanded ? null : date)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-md)', flexShrink: 0,
                background: isToday ? 'var(--c-teal)' : 'var(--bg-1)',
                border: isToday ? 'none' : '1px solid var(--line-1)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--fg-3)' }}>
                  {WEEK_DAYS_VI[i]}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? '#fff' : 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>
                  {new Date(date + 'T00:00:00').getDate()}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-1)' }}>
                  {formatShortDate(date)}
                  {isToday && <span style={{ fontSize: 11, color: 'var(--c-teal)', marginLeft: 6, fontWeight: 700 }}>Hôm nay</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {dayShifts.length === 0 ? 'Không có ca' : `${dayShifts.length} nhân viên`}
                  {absentCount > 0 && (
                    <span style={{
                      color: '#fff', background: 'var(--c-danger)',
                      borderRadius: 'var(--r-full, 999px)',
                      fontSize: 10, fontWeight: 700, padding: '1px 6px',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {absentCount} vắng
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 18, color: 'var(--fg-3)', lineHeight: 1,
                display: 'inline-block',
                transform: isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s',
              }}>›</span>
            </button>

            {isExpanded && dayShifts.length > 0 && (
              <div style={{ borderTop: '1px solid var(--line-1)', padding: '8px 16px 12px' }}>
                {dayShifts.map(shift => (
                  <div key={shift.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: '1px solid var(--line-1)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: STATUS_BG[shift.status],
                      border: `1px solid ${STATUS_COLOR[shift.status]}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: STATUS_COLOR[shift.status],
                      fontFamily: 'var(--font-display)',
                    }}>
                      {getInitials(shift.employeeName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
                        {shift.employeeName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                        {shift.employeeRole} · {shift.startTime}–{shift.endTime}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px',
                      borderRadius: 'var(--r-sm)',
                      background: STATUS_BG[shift.status],
                      color: STATUS_COLOR[shift.status],
                      fontFamily: 'var(--font-display)',
                      border: `1px solid ${STATUS_COLOR[shift.status]}33`,
                    }}>
                      {STATUS_LABEL[shift.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {isExpanded && dayShifts.length === 0 && (
              <div style={{ padding: '8px 16px 12px', color: 'var(--fg-3)', fontSize: 13 }}>
                Không có ca làm hôm này.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ManagerCalendarPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('employee');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];

  const { data: employeesData } = useManagerEmployees();
  const { data: shiftsData } = useManagerShifts(weekStart);

  const employees = employeesData?.employees ?? [];
  const allShifts = useMemo(() => shiftsData?.shifts ?? [], [shiftsData?.shifts]);

  const allBranches = useMemo(
    () => [...new Set(allShifts.map(s => s.location))].filter(Boolean).sort(),
    [allShifts],
  );

  const visibleShifts = selectedBranch === 'all'
    ? allShifts
    : allShifts.filter(s => s.location === selectedBranch);

  // When branch filtered, only show employees who have shifts in that branch
  const visibleEmployees = selectedBranch === 'all'
    ? employees
    : employees.filter(e => visibleShifts.some(s => s.employeeId === e.id));

  const weekLabel = `${formatShortDate(weekDates[0])} – ${formatShortDate(weekDates[6])}`;

  return (
    <div className="cd-page" style={{ paddingBottom: 90 }}>
      <ScreenHeader title={t('manager.calendar.title')} />

      {/* Điều hướng tuần */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px 16px', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          style={{
            width: 36, height: 36, borderRadius: 'var(--r-md)',
            border: '1px solid var(--line-1)', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--fg-2)', fontSize: 20, lineHeight: 1,
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>
            {weekLabel}
          </div>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                fontSize: 11, color: 'var(--c-teal)', border: 'none',
                background: 'transparent', cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-display)', fontWeight: 600,
              }}
            >
              Tuần này
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          style={{
            width: 36, height: 36, borderRadius: 'var(--r-md)',
            border: '1px solid var(--line-1)', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--fg-2)', fontSize: 20, lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

      {/* Branch selector — only show when branches are available */}
      {allBranches.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 14px', overflowX: 'auto' }}>
          {(['all', ...allBranches] as string[]).map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--r-full, 999px)',
                border: `1px solid ${selectedBranch === branch ? 'var(--c-teal)' : 'var(--line-1)'}`,
                background: selectedBranch === branch ? 'rgba(0,180,160,0.1)' : 'transparent',
                color: selectedBranch === branch ? 'var(--c-teal)' : 'var(--fg-2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {branch === 'all' ? 'Tất cả' : branch}
            </button>
          ))}
        </div>
      )}

      {/* Toggle view */}
      <div className="cd-filter-tabs" style={{ margin: '0 16px' }}>
        <button
          className={`cd-filter-tab${viewMode === 'employee' ? ' active' : ''}`}
          onClick={() => setViewMode('employee')}
        >
          {t('manager.calendar.byEmployee')}
        </button>
        <button
          className={`cd-filter-tab${viewMode === 'day' ? ' active' : ''}`}
          onClick={() => setViewMode('day')}
        >
          {t('manager.calendar.byDay')}
        </button>
        <div
          className="cd-filter-tab-indicator"
          style={{ transform: `translateX(${(['employee', 'day'] as ViewMode[]).indexOf(viewMode) * 100}%)` }}
        />
      </div>

      {/* Nội dung */}
      {viewMode === 'employee'
        ? <EmployeeView employees={visibleEmployees} shifts={visibleShifts} weekDates={weekDates} />
        : <DayView shifts={visibleShifts} weekDates={weekDates} />
      }
    </div>
  );
}
