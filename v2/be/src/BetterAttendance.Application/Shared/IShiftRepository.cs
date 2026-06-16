using BetterAttendance.Domain.Shifts;

namespace BetterAttendance.Application.Shared;

public interface IShiftRepository
{
    Task<IReadOnlyList<Shift>> GetTodayShiftsAsync(Guid userId, DateOnly today, CancellationToken ct);
    Task<IReadOnlyList<Shift>> GetWeeklyShiftsAsync(Guid userId, DateOnly weekStart, CancellationToken ct);
    Task<Shift?> GetByIdAsync(Guid shiftId, CancellationToken ct);
}
