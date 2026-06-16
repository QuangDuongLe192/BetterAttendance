using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;
using Microsoft.EntityFrameworkCore;

namespace BetterAttendance.Infrastructure.Repositories;

internal sealed class AttendanceRepository(AppDbContext db) : IAttendanceRepository
{
    public async Task<AttendanceRecord?> GetOpenRecordAsync(Guid shiftId, CancellationToken ct)
        => await db.AttendanceRecords
            .FirstOrDefaultAsync(r => r.ShiftId == shiftId && r.ClockOutUtc == null, ct);

    public async Task<AttendanceRecord?> GetByIdempotencyKeyAsync(string key, CancellationToken ct)
        => await db.AttendanceRecords
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key, ct);

    public Task AddAsync(AttendanceRecord record, CancellationToken ct)
    {
        db.AttendanceRecords.Add(record);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct) => db.SaveChangesAsync(ct);

    public async Task<IReadOnlyList<AttendanceRecord>> GetApprovedInPeriodAsync(Guid userId, DateRange period, CancellationToken ct)
    {
        var from = period.Start.ToDateTime(TimeOnly.MinValue);
        var to   = period.End.ToDateTime(TimeOnly.MaxValue);
        return await db.AttendanceRecords
            .Where(r => r.UserId == userId
                && r.ClockOutUtc != null
                && r.ClockInUtc >= from
                && r.ClockInUtc <= to)
            .ToListAsync(ct);
    }
}
