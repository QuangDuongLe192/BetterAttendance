using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Shared;
using Mediator;

namespace BetterAttendance.Application.Attendance.Queries;

public record GetTodayShiftsQuery(Guid UserId, DateOnly Today) : IRequest<Result<TodayShiftsDto>>;

public record TodayShiftsDto(IReadOnlyList<ShiftItemDto> Shifts);

public record ShiftItemDto(
    Guid ShiftId,
    string StartTime,
    string EndTime,
    string LocationName,
    string RoleName,
    string? ClockIn,
    string? ClockOut);

internal sealed class GetTodayShiftsHandler(IShiftRepository shifts)
    : IRequestHandler<GetTodayShiftsQuery, Result<TodayShiftsDto>>
{
    public async ValueTask<Result<TodayShiftsDto>> Handle(GetTodayShiftsQuery request, CancellationToken cancellationToken)
    {
        var todayShifts = await shifts.GetTodayShiftsAsync(request.UserId, request.Today, cancellationToken);

        var dtos = todayShifts
            .Select(s => new ShiftItemDto(
                s.Id,
                s.StartTimeUtc.ToString("HH:mm"),
                s.EndTimeUtc.ToString("HH:mm"),
                string.Empty,
                string.Empty,
                null,
                null))
            .ToList();

        return Result.Ok<TodayShiftsDto>(new TodayShiftsDto(dtos));
    }
}
