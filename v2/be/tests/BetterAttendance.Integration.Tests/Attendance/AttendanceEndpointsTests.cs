using System.Net;
using System.Net.Http.Json;
using BetterAttendance.Api.Models;
using BetterAttendance.Application.Attendance.Commands;
using BetterAttendance.Application.Shared;
using BetterAttendance.Domain.Attendance;
using BetterAttendance.Integration.Tests.Fakes;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BetterAttendance.Integration.Tests.Attendance;

public class AttendanceEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly Guid UserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    private static readonly DateTime FixedNow = new(2026, 5, 11, 2, 0, 0, DateTimeKind.Utc);

    private readonly WebApplicationFactory<Program> _factory;

    public AttendanceEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private WebApplicationFactory<Program> BuildFactory(
        TestShiftRepository shiftRepo,
        TestAttendanceRepository attendanceRepo,
        TestDateTimeProvider clock)
        => _factory.WithWebHostBuilder(b => b.ConfigureTestServices(services =>
        {
            services.RemoveAll<IShiftRepository>();
            services.RemoveAll<IAttendanceRepository>();
            services.RemoveAll<IDateTimeProvider>();
            services.AddSingleton<IShiftRepository>(shiftRepo);
            services.AddSingleton<IAttendanceRepository>(attendanceRepo);
            services.AddSingleton<IDateTimeProvider>(clock);
        }));

    // T1.3.13: Valid clock-in → 200 + shiftId in response
    [Fact]
    public async Task ClockIn_ValidShift_Returns200AndShiftId()
    {
        var today = DateOnly.FromDateTime(FixedNow);
        var shift = Domain.Shifts.Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            today, new TimeOnly(9, 0), new TimeOnly(17, 0));

        var shiftRepo = new TestShiftRepository();
        shiftRepo.Seed(shift);

        using var factory = BuildFactory(shiftRepo, new TestAttendanceRepository(), new TestDateTimeProvider(FixedNow));
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", UserId.ToString());

        var response = await client.PostAsJsonAsync("/api/attendance/clock-in",
            new { shiftId = shift.Id, idempotencyKey = "T1.3.13-key" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<ClockInResultDto>();
        Assert.NotNull(dto);
        Assert.Equal(shift.Id, dto.ShiftId);
    }

    // T1.3.14: Same idempotency key → 200 + same clockInTime (no duplicate record created)
    [Fact]
    public async Task ClockIn_SameIdempotencyKey_ReturnsSameClockInTime()
    {
        var today = DateOnly.FromDateTime(FixedNow);
        var shift = Domain.Shifts.Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            today, new TimeOnly(9, 0), new TimeOnly(17, 0));

        var shiftRepo = new TestShiftRepository();
        shiftRepo.Seed(shift);
        var attendanceRepo = new TestAttendanceRepository();

        using var factory = BuildFactory(shiftRepo, attendanceRepo, new TestDateTimeProvider(FixedNow));
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", UserId.ToString());

        var payload = new { shiftId = shift.Id, idempotencyKey = "T1.3.14-key" };
        var first  = await client.PostAsJsonAsync("/api/attendance/clock-in", payload);
        var second = await client.PostAsJsonAsync("/api/attendance/clock-in", payload);

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        var dto1 = await first.Content.ReadFromJsonAsync<ClockInResultDto>();
        var dto2 = await second.Content.ReadFromJsonAsync<ClockInResultDto>();
        Assert.Equal(dto1!.ClockInTime, dto2!.ClockInTime);
    }

    // T1.3.15: Clock-out after seeded clock-in → 200 + correct totalMinutes
    [Fact]
    public async Task ClockOut_AfterClockIn_Returns200AndTotalMinutes()
    {
        var today = DateOnly.FromDateTime(FixedNow);
        var shift = Domain.Shifts.Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            today, new TimeOnly(9, 0), new TimeOnly(17, 0));

        var clockOutTime = FixedNow.AddMinutes(30); // 30 min after FixedNow

        var attendanceRepo = new TestAttendanceRepository();
        attendanceRepo.Seed(AttendanceRecord.Create(
            shift.Id, UserId, FixedNow, AttendanceStatus.OnTime, "existing-ci-key"));

        using var factory = BuildFactory(
            new TestShiftRepository(),
            attendanceRepo,
            new TestDateTimeProvider(clockOutTime));
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", UserId.ToString());

        var response = await client.PostAsJsonAsync("/api/attendance/clock-out",
            new { shiftId = shift.Id, idempotencyKey = "T1.3.15-co-key" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<ClockOutResultDto>();
        Assert.NotNull(dto);
        Assert.Equal(30, dto.TotalMinutes);
    }

    // T1.3.16: Clock-out without prior clock-in → 422 + NOT_CLOCKED_IN
    [Fact]
    public async Task ClockOut_WithoutClockIn_Returns422NotClockedIn()
    {
        var today = DateOnly.FromDateTime(FixedNow);
        var shift = Domain.Shifts.Shift.Create(UserId, Guid.NewGuid(), Guid.NewGuid(),
            today, new TimeOnly(9, 0), new TimeOnly(17, 0));

        using var factory = BuildFactory(
            new TestShiftRepository(),
            new TestAttendanceRepository(),
            new TestDateTimeProvider(FixedNow));
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", UserId.ToString());

        var response = await client.PostAsJsonAsync("/api/attendance/clock-out",
            new { shiftId = shift.Id, idempotencyKey = "T1.3.16-co-key" });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(error);
        Assert.Equal("NOT_CLOCKED_IN", error.Code);
    }
}
