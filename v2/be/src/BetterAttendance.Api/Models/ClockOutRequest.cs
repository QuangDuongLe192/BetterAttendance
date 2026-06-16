namespace BetterAttendance.Api.Models;

public record ClockOutRequest(Guid ShiftId, string IdempotencyKey);
