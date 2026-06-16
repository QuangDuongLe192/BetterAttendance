export type PayPeriod = 'monthly' | 'bimonthly' | 'weekly';

export function PayPeriodViz({ period, splitDay }: { period: PayPeriod; splitDay: number }) {
  if (period === 'weekly') {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return (
      <div>
        <div style={{ fontSize: 12, color: '#6B7E8E', marginBottom: 8 }}>1 kỳ lương / tuần · Thứ 2 → Chủ nhật</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, height: 44, borderRadius: 6, background: i < 5 ? '#00B4A0' : i === 5 ? '#2B7EC4' : '#C8D4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#6B7E8E' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#00B4A0', display: 'inline-block' }} />Thứ 2–6</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#2B7EC4', display: 'inline-block' }} />Thứ 7</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#C8D4DC', display: 'inline-block' }} />Chủ nhật</span>
        </div>
      </div>
    );
  }

  const cells = Array.from({ length: 31 }, (_, i) => i + 1);

  if (period === 'bimonthly') {
    return (
      <div>
        <div style={{ fontSize: 12, color: '#6B7E8E', marginBottom: 8 }}>2 kỳ lương / tháng · Kỳ 1: 1–{splitDay} · Kỳ 2: {splitDay + 1}–31</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {cells.map(d => (
            <div key={d} title={`Ngày ${d}`} style={{ flex: 1, height: 36, borderRadius: 3, background: d <= splitDay ? '#00B4A0' : '#2B7EC4', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.85)', minWidth: 0 }}>
              {(d === 1 || d === splitDay || d === splitDay + 1 || d === 31) ? d : ''}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#6B7E8E' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#00B4A0', display: 'inline-block' }} />Kỳ 1 · ngày 1–{splitDay}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#2B7EC4', display: 'inline-block' }} />Kỳ 2 · ngày {splitDay + 1}–31</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: '#6B7E8E', marginBottom: 8 }}>1 kỳ lương / tháng · Ngày 1 → cuối tháng</div>
      <div style={{ display: 'flex', gap: 2 }}>
        {cells.map(d => (
          <div key={d} title={`Ngày ${d}`} style={{ flex: 1, height: 36, borderRadius: 3, background: '#00B4A0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.85)', minWidth: 0 }}>
            {(d === 1 || d === 31) ? d : ''}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 6 }}>Ngày 1 → ngày 31 · Thanh toán 1 lần / tháng</div>
    </div>
  );
}
