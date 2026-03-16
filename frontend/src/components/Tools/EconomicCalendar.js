import React from 'react';

export default function EconomicCalendar() {
  const events = [
    { title: 'Core CPI (MoM)', impact: 'High', time: 'Tomorrow 18:00', volatility: '🚀' },
    { title: 'FOMC Meeting Minutes', impact: 'Medium', time: 'In 2 days', volatility: '📈' },
    { title: 'US Initial Jobless Claims', impact: 'Low', time: 'Thu 17:30', volatility: '🌓' },
    { title: 'Token Unlock: $SOL', impact: 'High', time: 'Sat 12:00', volatility: '🔥' }
  ];

  return (
    <div className="card glass" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>📅</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Market Calendar</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Global Macro & Token Events</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((ev, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#eef2fa' }}>{ev.title}</div>
              <div style={{ fontSize: 10, color: '#4a5e78' }}>{ev.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: ev.impact === 'High' ? 'var(--red)' : ev.impact === 'Medium' ? 'var(--gold)' : '#8899b4',
                background: ev.impact === 'High' ? 'rgba(239,68,68,0.1)' : 'transparent',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {ev.impact}
              </span>
              <div style={{ fontSize: 12, marginTop: 2 }}>{ev.volatility}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button style={{
        marginTop: 14,
        background: 'transparent',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 8,
        color: 'var(--blue)',
        fontSize: 10,
        fontWeight: 700,
        padding: '8px',
        cursor: 'pointer',
        transition: '0.2s'
      }} onMouseEnter={e => e.target.style.background = 'rgba(59,130,246,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
        SYNC WITH EXTERNAL CALENDAR
      </button>
    </div>
  );
}
