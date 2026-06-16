using BetterAttendance.Api.Models;
using BetterAttendance.Api.Serialization;
using BetterAttendance.Application.Attendance.Commands;
using BetterAttendance.Application.Attendance.Queries;
using BetterAttendance.Infrastructure;
using Mediator;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default));

builder.Services.AddMediator();
builder.Services.AddAuthorization();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/attendance/today", async (HttpContext http, ISender sender, CancellationToken ct) =>
{
    if (!TryGetUserId(http, out var userId))
        return Results.BadRequest();
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var result = await sender.Send(new GetTodayShiftsQuery(userId, today), ct);
    return result.IsFailure
        ? Results.UnprocessableEntity(new ErrorResponse(result.Error.Code, result.Error.MessageKey))
        : Results.Ok(result.Value);
});

app.MapPost("/api/attendance/clock-in", async (HttpContext http, ClockInRequest request, ISender sender, CancellationToken ct) =>
{
    if (!TryGetUserId(http, out var userId))
        return Results.BadRequest();
    var result = await sender.Send(new ClockInCommand(userId, request.ShiftId, request.IdempotencyKey), ct);
    return result.IsFailure
        ? Results.UnprocessableEntity(new ErrorResponse(result.Error.Code, result.Error.MessageKey))
        : Results.Ok(result.Value);
});

app.MapPost("/api/attendance/clock-out", async (HttpContext http, ClockOutRequest request, ISender sender, CancellationToken ct) =>
{
    if (!TryGetUserId(http, out var userId))
        return Results.BadRequest();
    var result = await sender.Send(new ClockOutCommand(userId, request.ShiftId, request.IdempotencyKey), ct);
    return result.IsFailure
        ? Results.UnprocessableEntity(new ErrorResponse(result.Error.Code, result.Error.MessageKey))
        : Results.Ok(result.Value);
});

static bool TryGetUserId(HttpContext http, out Guid userId)
{
    if (http.Request.Headers.TryGetValue("X-User-Id", out var values) &&
        Guid.TryParse(values.ToString(), out userId))
        return true;
    userId = default;
    return false;
}

#if DEBUG
app.Run();
#else
app.RunAsLambda();
#endif

public partial class Program { }
