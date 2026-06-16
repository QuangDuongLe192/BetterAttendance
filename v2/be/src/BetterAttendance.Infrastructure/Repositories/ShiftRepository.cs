using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Shifts;
using Microsoft.EntityFrameworkCore;

namespace BetterAttendance.Infrastructure.Repositories;

internal sealed class ShiftRepository(AppDbContext db) : IShiftRepository
{
    public async Task<IReadOnlyList<Shift>> GetTodayShiftsAsync(Guid userId, DateOnly today, CancellationToken ct)
        => await db.Shifts
            .Where(s => s.UserId == userId && s.Date == today && s.DeletedAt == null)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Shift>> GetWeeklyShiftsAsync(Guid userId, DateOnly weekStart, CancellationToken ct)
    {
        var weekEnd = weekStart.AddDays(7);
        return await db.Shifts
            .Where(s => s.UserId == userId
                && s.Date >= weekStart
                && s.Date < weekEnd
                && s.DeletedAt == null)
            .ToListAsync(ct);
    }

    public async Task<Shift?> GetByIdAsync(Guid shiftId, CancellationToken ct)
        => await db.Shifts
            .FirstOrDefaultAsync(s => s.Id == shiftId && s.DeletedAt == null, ct);
}
