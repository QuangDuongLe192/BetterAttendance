using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Domain.Earnings;

public static class EarningsCalculator
{
    // [FR-1.4, NFR-REL-3, NFR-REL-4] Pure function — same inputs always produce the same output.
    // Minutes stored as integers. Rate in VND per hour as integer. Never float.
    public static EarningsResult Compute(
        IReadOnlyList<ApprovedEntry> entries,
        IReadOnlyDictionary<Guid, int> rateMap,
        DateRange period)
    {
        var lines = entries
            .Where(e => period.Contains(e.WorkDate))
            .GroupBy(e => e.RoleId)
            .Select(g =>
            {
                var roleId = g.Key;
                var totalMinutes = g.Sum(e => e.Minutes);
                var rate = rateMap.TryGetValue(roleId, out var r) ? r : 0;
                var earningsVnd = (int)Math.Round((double)totalMinutes * rate / 60.0, MidpointRounding.ToEven);
                return new EarningsBreakdownLine(roleId, string.Empty, totalMinutes, rate, earningsVnd);
            })
            .ToList();

        return new EarningsResult(lines.Sum(l => l.EarningsVnd), lines);
    }

    public record ApprovedEntry(Guid RoleId, int Minutes, DateOnly WorkDate);
    public record EarningsResult(int TotalVnd, IReadOnlyList<EarningsBreakdownLine> Lines);
    public record EarningsBreakdownLine(Guid RoleId, string RoleName, int Minutes, int RateVndPerHour, int EarningsVnd);
}
