namespace BetterAttendance.Api.Models;

public record ClockInRequest(Guid ShiftId, string IdempotencyKey);
