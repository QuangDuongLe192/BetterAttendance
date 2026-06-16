using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Integration.Tests.Fakes;

public sealed class TestAttendanceRepository : IAttendanceRepository
{
    private readonly List<AttendanceRecord> _records = [];

    public void Seed(AttendanceRecord record) => _records.Add(record);

    public Task<AttendanceRecord?> GetOpenRecordAsync(Guid shiftId, CancellationToken ct)
        => Task.FromResult(_records.FirstOrDefault(r => r.ShiftId == shiftId && r.ClockOutUtc == null));

    public Task<AttendanceRecord?> GetByIdempotencyKeyAsync(string key, CancellationToken ct)
        => Task.FromResult(_records.FirstOrDefault(r => r.IdempotencyKey == key));

    public Task AddAsync(AttendanceRecord record, CancellationToken ct)
    {
        _records.Add(record);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct) => Task.CompletedTask;

    public Task<IReadOnlyList<AttendanceRecord>> GetApprovedInPeriodAsync(Guid userId, DateRange period, CancellationToken ct)
        => Task.FromResult<IReadOnlyList<AttendanceRecord>>(
            _records.Where(r => r.UserId == userId && r.ClockOutUtc != null).ToList());
}
