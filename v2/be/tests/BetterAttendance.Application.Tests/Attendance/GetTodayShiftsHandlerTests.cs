using BetterAttendance.Application.Attendance.Queries;
using BetterAttendance.Application.Tests.Fakes;
using BetterAttendance.Domain.Shifts;

namespace BetterAttendance.Application.Tests.Attendance;

public class GetTodayShiftsHandlerTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly DateOnly Today = new(2026, 5, 11);

    // T1.1.1: 1 shift today → returns 1 ShiftItemDto
    [Fact]
    public async Task Handle_OneShiftToday_ReturnsOneDto()
    {
        var repo = new InMemoryShiftRepository();
        repo.Seed(Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(9, 0), new TimeOnly(17, 0)));

        var handler = new GetTodayShiftsHandler(repo);

        var result = await handler.Handle(new GetTodayShiftsQuery(UserId, Today), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.Shifts);
    }

    // T1.1.2: 2 non-overlapping shifts today → returns 2 DTOs
    [Fact]
    public async Task Handle_TwoShiftsToday_ReturnsTwoDtos()
    {
        var repo = new InMemoryShiftRepository();
        repo.Seed(Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(8, 0), new TimeOnly(12, 0)));
        repo.Seed(Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(14, 0), new TimeOnly(18, 0)));

        var handler = new GetTodayShiftsHandler(repo);

        var result = await handler.Handle(new GetTodayShiftsQuery(UserId, Today), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.Shifts.Count);
    }

    // T1.1.3: 0 shifts today → returns empty list (not null, not blank screen)
    [Fact]
    public async Task Handle_NoShiftsToday_ReturnsEmptyList()
    {
        var repo = new InMemoryShiftRepository();
        var handler = new GetTodayShiftsHandler(repo);

        var result = await handler.Handle(new GetTodayShiftsQuery(UserId, Today), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Shifts);
    }

    // T1.1.4: Midnight boundary — query for Today returns only today's shifts, not yesterday's
    [Fact]
    public async Task Handle_MidnightBoundary_ReturnsNewDayShiftsOnly()
    {
        var yesterday = Today.AddDays(-1);
        var repo = new InMemoryShiftRepository();
        repo.Seed(Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            yesterday, new TimeOnly(22, 0), new TimeOnly(23, 59)));
        repo.Seed(Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            Today, new TimeOnly(0, 0), new TimeOnly(8, 0)));

        var handler = new GetTodayShiftsHandler(repo);

        var result = await handler.Handle(new GetTodayShiftsQuery(UserId, Today), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.Shifts); // only today's shift
    }
}
