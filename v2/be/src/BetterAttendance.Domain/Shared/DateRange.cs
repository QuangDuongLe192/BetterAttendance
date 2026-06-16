namespace BetterAttendance.Domain.Shared;

public sealed class DateRange
{
    private DateRange(DateOnly start, DateOnly end)
    {
        Start = start;
        End = end;
    }

    public DateOnly Start { get; }
    public DateOnly End { get; }

    public static Result<DateRange> Create(DateOnly start, DateOnly end) =>
        start > end
            ? Result.Fail<DateRange>(DomainErrors.InvalidDateRange)
            : Result.Ok(new DateRange(start, end));

    public bool Contains(DateOnly date) => date >= Start && date <= End;
}
