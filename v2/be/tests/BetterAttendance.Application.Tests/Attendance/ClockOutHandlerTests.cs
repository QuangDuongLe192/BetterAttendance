using BetterAttendance.Application.Attendance.Commands;
using BetterAttendance.Application.Tests.Fakes;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;
using BetterAttendance.Domain.Shifts;

namespace BetterAttendance.Application.Tests.Attendance;

public class ClockOutHandlerTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    private static ClockOutHandler Build(
        InMemoryAttendanceRepository? attendance = null,
        FakeDateTimeProvider? clock = null)
        => new(
            attendance ?? new InMemoryAttendanceRepository(),
            clock      ?? new FakeDateTimeProvider());

    // T1.3.4: No open record for shift → NOT_CLOCKED_IN error
    [Fact]
    public async Task Handle_NotClockedIn_ReturnsNotClockedInError()
    {
        var result = await Build()
            .Handle(new ClockOutCommand(UserId, Guid.NewGuid(), "key-1"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(DomainErrors.NotClockedIn.Code, result.Error.Code);
    }

    // T1.3.5: Valid clock out after clock in → ClockOutResultDto with correct totalMinutes
    [Fact]
    public async Task Handle_ValidClockOut_ReturnsCorrectTotalMinutes()
    {
        var attendance = new InMemoryAttendanceRepository();
        var shiftId    = Guid.NewGuid();
        var clockIn    = new DateTime(2026, 5, 11, 2, 0, 0, DateTimeKind.Utc);  // 09:00 VN
        attendance.Seed(AttendanceRecord.Create(shiftId, UserId, clockIn, AttendanceStatus.OnTime, "ci-key"));

        var clockOut = new DateTime(2026, 5, 11, 10, 0, 0, DateTimeKind.Utc); // 17:00 VN → 480 min
        var clock    = new FakeDateTimeProvider { UtcNow = clockOut };

        var result = await Build(attendance: attendance, clock: clock)
            .Handle(new ClockOutCommand(UserId, shiftId, "co-key"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(480, result.Value.TotalMinutes);
    }

    // T1.3.7: Overnight shift 22:00–02:00 → totalMinutes = 240, date boundary handled correctly
    [Fact]
    public async Task Handle_OvernightShift_TotalMinutes240()
    {
        var attendance = new InMemoryAttendanceRepository();
        var shiftId    = Guid.NewGuid();
        // clock-in 22:00 VN = 15:00 UTC May 10
        var clockIn = new DateTime(2026, 5, 10, 15, 0, 0, DateTimeKind.Utc);
        attendance.Seed(AttendanceRecord.Create(shiftId, UserId, clockIn, AttendanceStatus.OnTime, "ci-night"));

        // clock-out 02:00 VN = 19:00 UTC May 10 (4h = 240 min later)
        var clock = new FakeDateTimeProvider { UtcNow = new DateTime(2026, 5, 10, 19, 0, 0, DateTimeKind.Utc) };

        var result = await Build(attendance: attendance, clock: clock)
            .Handle(new ClockOutCommand(UserId, shiftId, "co-night"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(240, result.Value.TotalMinutes);
    }
}
