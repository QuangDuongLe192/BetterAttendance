using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shared;
using Mediator;

namespace BetterAttendance.Application.Attendance.Commands;

public record ClockInCommand(Guid UserId, Guid ShiftId, string IdempotencyKey) : IRequest<Result<ClockInResultDto>>;

public record ClockInResultDto(Guid ShiftId, string ClockInTime);

internal sealed class ClockInHandler(
    IShiftRepository shifts,
    IAttendanceRepository attendance,
    IDateTimeProvider clock)
    : IRequestHandler<ClockInCommand, Result<ClockInResultDto>>
{
    public async ValueTask<Result<ClockInResultDto>> Handle(ClockInCommand request, CancellationToken cancellationToken)
    {
        // Idempotency: same key returns same result without creating a duplicate record
        var existing = await attendance.GetByIdempotencyKeyAsync(request.IdempotencyKey, cancellationToken);
        if (existing is not null)
            return Result.Ok(new ClockInResultDto(existing.ShiftId, existing.ClockInUtc.ToString("o")));

        var shift = await shifts.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift is null)
            return Result.Fail<ClockInResultDto>(DomainErrors.ShiftNotFound);

        var openRecord = await attendance.GetOpenRecordAsync(request.ShiftId, cancellationToken);
        if (openRecord is not null)
            return Result.Fail<ClockInResultDto>(DomainErrors.AlreadyClockedIn);

        var nowUtc = clock.UtcNow;
        var record = AttendanceRecord.Create(request.ShiftId, request.UserId, nowUtc, AttendanceStatus.OnTime, request.IdempotencyKey);
        await attendance.AddAsync(record, cancellationToken);
        await attendance.SaveAsync(cancellationToken);

        return Result.Ok(new ClockInResultDto(request.ShiftId, nowUtc.ToString("o")));
    }
}
