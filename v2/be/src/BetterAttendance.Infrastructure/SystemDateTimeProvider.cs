using BetterAttendance.Application.Shared;

namespace BetterAttendance.Infrastructure;

internal sealed class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
