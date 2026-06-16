using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Shared;
using Mediator;

namespace BetterAttendance.Application.Attendance.Commands;

public record ClockOutCommand(Guid UserId, Guid ShiftId, string IdempotencyKey) : IRequest<Result<ClockOutResultDto>>;

public record ClockOutResultDto(Guid ShiftId, string ClockOutTime, int TotalMinutes);

internal sealed class ClockOutHandler(
    IAttendanceRepository attendance,
    IDateTimeProvider clock)
    : IRequestHandler<ClockOutCommand, Result<ClockOutResultDto>>
{
    public async ValueTask<Result<ClockOutResultDto>> Handle(ClockOutCommand request, CancellationToken cancellationToken)
    {
        var record = await attendance.GetOpenRecordAsync(request.ShiftId, cancellationToken);
        if (record is null)
            return Result.Fail<ClockOutResultDto>(DomainErrors.NotClockedIn);

        var nowUtc = clock.UtcNow;
        var clockOutResult = record.ClockOut(nowUtc);
        if (clockOutResult.IsFailure)
            return Result.Fail<ClockOutResultDto>(clockOutResult.Error);

        await attendance.SaveAsync(cancellationToken);
        var totalMinutes = (int)(nowUtc - record.ClockInUtc).TotalMinutes;
        return Result.Ok(new ClockOutResultDto(request.ShiftId, nowUtc.ToString("o"), totalMinutes));
    }
}
