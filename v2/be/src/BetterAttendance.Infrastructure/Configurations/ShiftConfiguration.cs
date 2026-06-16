using BetterAttendance.Domain.Shifts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BetterAttendance.Infrastructure.Configurations;

internal sealed class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> b)
    {
        b.ToTable("shifts");
        b.HasKey(s => s.Id);
        b.Property(s => s.Id).HasColumnName("id");
        b.Property(s => s.UserId).HasColumnName("user_id");
        b.Property(s => s.RoleId).HasColumnName("role_id");
        b.Property(s => s.LocationId).HasColumnName("location_id");
        b.Property(s => s.Date).HasColumnName("date");
        b.Property(s => s.StartTimeUtc).HasColumnName("start_time_utc");
        b.Property(s => s.EndTimeUtc).HasColumnName("end_time_utc");
        b.Property(s => s.DeletedAt).HasColumnName("deleted_at");
    }
}
