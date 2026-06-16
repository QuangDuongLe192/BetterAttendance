using BetterAttendance.Domain.Attendance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BetterAttendance.Infrastructure.Configurations;

internal sealed class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> b)
    {
        b.ToTable("attendance_records");
        b.HasKey(r => r.Id);
        b.Property(r => r.Id).HasColumnName("id");
        b.Property(r => r.ShiftId).HasColumnName("shift_id");
        b.Property(r => r.UserId).HasColumnName("user_id");
        b.Property(r => r.ClockInUtc).HasColumnName("clock_in_utc");
        b.Property(r => r.ClockOutUtc).HasColumnName("clock_out_utc");
        b.Property(r => r.Status).HasColumnName("status").HasConversion<string>();
        b.Property(r => r.IdempotencyKey).HasColumnName("idempotency_key");
    }
}
