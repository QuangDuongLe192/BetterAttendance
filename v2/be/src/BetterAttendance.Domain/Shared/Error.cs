namespace BetterAttendance.Domain.Shared;

public sealed record Error(string Code, string MessageKey)
{
    public static readonly Error None = new(string.Empty, string.Empty);
}
