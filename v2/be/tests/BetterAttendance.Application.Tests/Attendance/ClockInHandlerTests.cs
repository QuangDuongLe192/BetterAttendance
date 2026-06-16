using BetterAttendance.Application.Attendance.Commands;
using BetterAttendance.Application.Tests.Fakes;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;
using BetterAttendance.Domain.Shifts;

namespace BetterAttendance.Application.Tests.Attendance;

public class ClockInHandlerTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly DateOnly Today = new(2026, 5, 11);

    private static ClockInHandler Build(
        InMemoryShiftRepository? shifts = null,
        InMemoryAttendanceRepository? attendance = null,
        FakeDateTimeProvider? clock = null)
        => new(
            shifts     ?? new InMemoryShiftRepository(),
            attendance ?? new InMemoryAttendanceRepository(),
            clock      ?? new FakeDateTimeProvider());

    // T1.3.1: Valid shift, not yet clocked in → returns ClockInResultDto
    [Fact]
    public async Task Handle_ValidShift_NotClockedIn_ReturnsClockInResult()
    {
        var shifts = new InMemoryShiftRepository();
        var shift  = Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(9, 0), new TimeOnly(17, 0));
        shifts.Seed(shift);

        var result = await Build(shifts: shifts)
            .Handle(new ClockInCommand(UserId, shift.Id, "key-1"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(shift.Id, result.Value.ShiftId);
    }

    // T1.3.2: Same idempotency key twice → second returns same record, no duplicate stored
    [Fact]
    public async Task Handle_SameIdempotencyKey_ReturnsExistingRecord_NoDuplicate()
    {
        var shifts     = new InMemoryShiftRepository();
        var attendance = new InMemoryAttendanceRepository();
        var shift      = Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(9, 0), new TimeOnly(17, 0));
        shifts.Seed(shift);

        var handler = Build(shifts: shifts, attendance: attendance);
        var cmd     = new ClockInCommand(UserId, shift.Id, "key-idem");

        var first  = await handler.Handle(cmd, CancellationToken.None);
        var second = await handler.Handle(cmd, CancellationToken.None);

        Assert.True(first.IsSuccess);
        Assert.True(second.IsSuccess);
        Assert.Equal(first.Value.ClockInTime, second.Value.ClockInTime);
        Assert.Single(attendance.All); // only one record stored
    }

    // T1.3.3: Already clocked in → ALREADY_CLOCKED_IN error
    [Fact]
    public async Task Handle_AlreadyClockedIn_ReturnsAlreadyClockedInError()
    {
        var shifts     = new InMemoryShiftRepository();
        var attendance = new InMemoryAttendanceRepository();
        var shift      = Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(9, 0), new TimeOnly(17, 0));
        shifts.Seed(shift);
        attendance.Seed(AttendanceRecord.Create(shift.Id, UserId,
            new DateTime(2026, 5, 11, 2, 0, 0, DateTimeKind.Utc),
            AttendanceStatus.OnTime, "existing-key"));

        var result = await Build(shifts: shifts, attendance: attendance)
            .Handle(new ClockInCommand(UserId, shift.Id, "new-key"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(DomainErrors.AlreadyClockedIn.Code, result.Error.Code);
    }

    // T1.3.6: Clock in >30 min before shift start → allowed in Sprint 1 (validation stub)
    [Fact]
    public async Task Handle_OutsideShiftWindow_AllowedByStub()
    {
        var shifts = new InMemoryShiftRepository();
        var shift  = Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(9, 0), new TimeOnly(17, 0));
        shifts.Seed(shift);

        // clock is 2h before shift start (UTC 00:00 = VN 07:00, shift starts VN 09:00)
        var clock = new FakeDateTimeProvider { UtcNow = new DateTime(2026, 5, 11, 0, 0, 0, DateTimeKind.Utc) };

        var result = await Build(shifts: shifts, clock: clock)
            .Handle(new ClockInCommand(UserId, shift.Id, "early-key"), CancellationToken.None);

        Assert.True(result.IsSuccess); // not blocked in Sprint 1
    }
}
