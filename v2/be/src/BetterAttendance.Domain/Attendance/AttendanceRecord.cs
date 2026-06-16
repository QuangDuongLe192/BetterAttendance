using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Domain.Attendance;

public sealed class AttendanceRecord
{
    public Guid Id { get; private set; }
    public Guid ShiftId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime ClockInUtc { get; private set; }
    public DateTime? ClockOutUtc { get; private set; }
    public AttendanceStatus Status { get; private set; }
    public string? IdempotencyKey { get; private set; }

    public static AttendanceRecord Create(
        Guid shiftId,
        Guid userId,
        DateTime clockInUtc,
        AttendanceStatus status,
        string? idempotencyKey)
        => new()
        {
            Id = Guid.NewGuid(),
            ShiftId = shiftId,
            UserId = userId,
            ClockInUtc = clockInUtc,
            Status = status,
            IdempotencyKey = idempotencyKey,
        };

    public Result ClockOut(DateTime nowUtc)
    {
        if (ClockOutUtc.HasValue)
            return Result.Fail(DomainErrors.AlreadyClockedOut);
        ClockOutUtc = nowUtc;
        return Result.Ok();
    }
}

public enum AttendanceStatus { OnTime, Late, NeedsReview }
