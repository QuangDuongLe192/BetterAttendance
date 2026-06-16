namespace BetterAttendance.Domain.Shared;

public static class DomainErrors
{
    public static readonly Error AlreadyClockedIn  = new("ALREADY_CLOCKED_IN",  "attendance.error.alreadyClockedIn");
    public static readonly Error NotClockedIn      = new("NOT_CLOCKED_IN",      "attendance.error.notClockedIn");
    public static readonly Error AlreadyClockedOut = new("ALREADY_CLOCKED_OUT", "attendance.error.alreadyClockedOut");
    public static readonly Error ShiftNotFound     = new("SHIFT_NOT_FOUND",     "attendance.error.shiftNotFound");
    public static readonly Error Forbidden         = new("FORBIDDEN",           "attendance.error.forbidden");
    public static readonly Error InvalidDateRange  = new("INVALID_DATE_RANGE",  "attendance.error.invalidDateRange");
    public static readonly Error EmployeeNotFound  = new("EMPLOYEE_NOT_FOUND",  "attendance.error.employeeNotFound");
}
