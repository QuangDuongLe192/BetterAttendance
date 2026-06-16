using BetterAttendance.Domain.Earnings;
using BetterAttendance.Domain.Shared;

namespace BetterAttendance.Domain.Tests.Earnings;

public class EarningsCalculatorTests
{
    // T1.4.1: 8h @ 35,000 VND/h → 280,000 VND
    [Fact]
    public void Compute_8Hours_At35000VndPerHour_Returns280000Vnd()
    {
        var roleId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 480, new DateOnly(2026, 5, 1)), // 480 min = 8h
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 35_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(280_000, result.TotalVnd);
    }

    // T1.4.2: 0h → 0 VND
    [Fact]
    public void Compute_ZeroHours_Returns0Vnd()
    {
        var entries = Array.Empty<EarningsCalculator.ApprovedEntry>();
        var rateMap = new Dictionary<Guid, int>();
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(0, result.TotalVnd);
    }

    // T1.4.3: 7.5h (450 min) @ 40,000 VND/h → (450 × 40,000) / 60 = 300,000 VND
    [Fact]
    public void Compute_450Minutes_At40000VndPerHour_Returns300000Vnd()
    {
        var roleId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 450, new DateOnly(2026, 5, 1)),
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 40_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(300_000, result.TotalVnd);
    }

    // T1.4.4: Pay period 1–15; entry on day 20 is excluded
    [Fact]
    public void Compute_EntryOutsidePeriod_IsExcluded()
    {
        var roleId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 480, new DateOnly(2026, 5, 10)), // inside period 1–15
            new(roleId, 480, new DateOnly(2026, 5, 20)), // outside period
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 35_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 15)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        // only the entry on the 10th (8h @ 35k = 280k) is included
        Assert.Equal(280_000, result.TotalVnd);
    }

    // T1.4.5: Pay period 1–15; clock-in on 31st → 0 hours in period
    [Fact]
    public void Compute_AllEntriesOutsidePeriod_Returns0Vnd()
    {
        var roleId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 480, new DateOnly(2026, 5, 31)),
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 35_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 15)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(0, result.TotalVnd);
    }

    // T1.4.6: Multi-role — Waiter 4h@35k + Cashier 4h@40k → 140,000 + 160,000 = 300,000 VND
    [Fact]
    public void Compute_MultipleRoles_ReturnsSummedEarnings()
    {
        var waiterId  = Guid.NewGuid();
        var cashierId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(waiterId,  240, new DateOnly(2026, 5, 1)), // 4h
            new(cashierId, 240, new DateOnly(2026, 5, 1)), // 4h
        };
        var rateMap = new Dictionary<Guid, int>
        {
            [waiterId]  = 35_000,
            [cashierId] = 40_000,
        };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(300_000, result.TotalVnd);
    }

    // T1.4.7: Unapproved overtime is excluded — Compute only receives pre-filtered approved entries;
    // passing only the 8h approved portion yields 280k (caller excludes the unapproved hours).
    [Fact]
    public void Compute_OnlyApprovedEntriesPassed_UnapprovedOvertimeExcluded()
    {
        var roleId = Guid.NewGuid();
        // caller pre-filters: 8h approved, 2h unapproved overtime NOT included
        var approvedEntries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 480, new DateOnly(2026, 5, 1)), // 8h approved only
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 35_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result = EarningsCalculator.Compute(approvedEntries, rateMap, period);

        Assert.Equal(280_000, result.TotalVnd);
    }

    // T1.4.8: Same inputs twice → identical outputs (determinism / NFR-REL-3)
    [Fact]
    public void Compute_SameInputTwice_ReturnsDeterministicResult()
    {
        var roleId = Guid.NewGuid();
        var entries = new List<EarningsCalculator.ApprovedEntry>
        {
            new(roleId, 480, new DateOnly(2026, 5, 1)),
        };
        var rateMap = new Dictionary<Guid, int> { [roleId] = 35_000 };
        var period = DateRange.Create(new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31)).Value;

        var result1 = EarningsCalculator.Compute(entries, rateMap, period);
        var result2 = EarningsCalculator.Compute(entries, rateMap, period);

        Assert.Equal(result1.TotalVnd, result2.TotalVnd);
        Assert.Equal(result1.Lines.Count, result2.Lines.Count);
    }
}
