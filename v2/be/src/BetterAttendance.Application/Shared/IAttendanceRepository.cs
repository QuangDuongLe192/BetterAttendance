using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Application.Shared;

public interface IAttendanceRepository
{
    Task<AttendanceRecord?> GetOpenRecordAsync(Guid shiftId, CancellationToken ct);
    Task<AttendanceRecord?> GetByIdempotencyKeyAsync(string key, CancellationToken ct);
    Task AddAsync(AttendanceRecord record, CancellationToken ct);
    Task SaveAsync(CancellationToken ct);
    Task<IReadOnlyList<AttendanceRecord>> GetApprovedInPeriodAsync(Guid userId, DateRange period, CancellationToken ct);
}
