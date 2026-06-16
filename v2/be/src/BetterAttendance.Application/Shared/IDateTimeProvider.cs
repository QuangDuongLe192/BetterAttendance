namespace BetterAttendance.Application.Shared;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
