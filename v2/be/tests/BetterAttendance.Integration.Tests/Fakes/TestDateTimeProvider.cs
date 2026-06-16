using BetterAttendance.Application.Shared;

namespace BetterAttendance.Integration.Tests.Fakes;

public sealed class TestDateTimeProvider(DateTime utcNow) : IDateTimeProvider
{
    public DateTime UtcNow => utcNow;
}
