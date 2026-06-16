namespace BetterAttendance.Domain.Shifts;

public sealed class Shift
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid RoleId { get; private set; }
    public Guid LocationId { get; private set; }
    public DateOnly Date { get; private set; }
    public TimeOnly StartTimeUtc { get; private set; }
    public TimeOnly EndTimeUtc { get; private set; }
    public bool IsOvernight => EndTimeUtc < StartTimeUtc;
    public DateTime? DeletedAt { get; private set; }

    public static Shift Create(
        Guid userId, Guid roleId, Guid locationId,
        DateOnly date, TimeOnly startTimeUtc, TimeOnly endTimeUtc)
        => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RoleId = roleId,
            LocationId = locationId,
            Date = date,
            StartTimeUtc = startTimeUtc,
            EndTimeUtc = endTimeUtc,
        };
}
