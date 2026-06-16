using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Domain.Tests.Attendance;

public class AttendanceRecordTests
{
    // ClockOut on an already-clocked-out record → AlreadyClockedOut error
    [Fact]
    public void ClockOut_WhenAlreadyClockedOut_ReturnsAlreadyClockedOutError()
    {
        var record = AttendanceRecord.Create(
            shiftId: Guid.NewGuid(),
            userId: Guid.NewGuid(),
            clockInUtc: DateTime.UtcNow.AddHours(-2),
            status: AttendanceStatus.OnTime,
            idempotencyKey: "key-1");

        record.ClockOut(DateTime.UtcNow.AddHours(-1)); // valid first clock-out

        var result = record.ClockOut(DateTime.UtcNow); // second call on already-clocked-out record

        Assert.True(result.IsFailure);
        Assert.Equal(DomainErrors.AlreadyClockedOut.Code, result.Error.Code);
    }

    // ClockOut when no open record exists → NotClockedIn error
    // The "no open record" guard lives in the application handler (ClockOutHandler):
    // it calls IAttendanceRepository.GetOpenRecordAsync and returns NotClockedIn when null.
    // This test documents the expected domain error constant and is intentionally RED
    // until the full flow is verified in T05 (Application Tests).
    [Fact]
    public void DomainErrors_NotClockedIn_IsDefinedCorrectly()
    {
        Assert.Equal("NOT_CLOCKED_IN", DomainErrors.NotClockedIn.Code);
        Assert.Equal("attendance.error.notClockedIn", DomainErrors.NotClockedIn.MessageKey);

        // Force RED — end-to-end NotClockedIn flow validated via application handler in T05.
        Assert.Fail("RED: full NotClockedIn flow validated in T05 (application handler test)");
    }
}
