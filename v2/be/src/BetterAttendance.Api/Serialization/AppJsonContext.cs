using BetterAttendance.Api.Models;
using BetterAttendance.Application.Attendance.Commands;
using BetterAttendance.Application.Attendance.Queries;
using System.Text.Json.Serialization;

namespace BetterAttendance.Api.Serialization;

[JsonSerializable(typeof(ClockInRequest))]
[JsonSerializable(typeof(ClockOutRequest))]
[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(ClockInResultDto))]
[JsonSerializable(typeof(ClockOutResultDto))]
[JsonSerializable(typeof(TodayShiftsDto))]
internal partial class AppJsonContext : JsonSerializerContext { }
