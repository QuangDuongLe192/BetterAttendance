using BetterAttendance.Application.Shared;

namespace BetterAttendance.Application.Tests.Fakes;

public sealed class FakeDateTimeProvider : IDateTimeProvider
{
    // Default: 2026-05-11 02:00 UTC = 09:00 Vietnam time
    public DateTime UtcNow { get; set; } = new DateTime(2026, 5, 11, 2, 0, 0, DateTimeKind.Utc);
}
