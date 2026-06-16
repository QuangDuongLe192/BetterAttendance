using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Shifts;

namespace BetterAttendance.Integration.Tests.Fakes;

public sealed class TestShiftRepository : IShiftRepository
{
    private readonly List<Shift> _shifts = [];

    public void Seed(Shift shift) => _shifts.Add(shift);

    public Task<IReadOnlyList<Shift>> GetTodayShiftsAsync(Guid userId, DateOnly today, CancellationToken ct)
        => Task.FromResult<IReadOnlyList<Shift>>(
            _shifts.Where(s => s.UserId == userId && s.Date == today && s.DeletedAt == null).ToList());

    public Task<IReadOnlyList<Shift>> GetWeeklyShiftsAsync(Guid userId, DateOnly weekStart, CancellationToken ct)
        => Task.FromResult<IReadOnlyList<Shift>>([]);

    public Task<Shift?> GetByIdAsync(Guid shiftId, CancellationToken ct)
        => Task.FromResult(_shifts.FirstOrDefault(s => s.Id == shiftId && s.DeletedAt == null));
}
