using BetterAttendance.Domain.Attendance;
using BetterAttendance.Domain.Shifts;
using BetterAttendance.Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;

namespace BetterAttendance.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Shift> Shifts { get; set; } = null!;
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ShiftConfiguration());
        modelBuilder.ApplyConfiguration(new AttendanceRecordConfiguration());
    }
}
