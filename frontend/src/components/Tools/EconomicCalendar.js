import React, { useState, useEffect } from 'react';
import { getMacroCalendar } from '../../services/api';

export default function EconomicCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    getMacroCalendar()
      .then(res => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="glass-heavy calendar-matrix" style={{ padding: '24px', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
        <div style={{ fontSize: 22 }}>📅</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: -0.2 }}>CHRONOS VECTOR</div>
          <div style={{ fontSize: 10, color: '#4a5e78', fontWeight: 800 }}>MACRO & LIQUIDITY EVENTS</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="v4-neural-spinner" />
          </div>
        ) : events.map((ev, i) => (
          <div key={i} className="event-row" style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 14,
            padding: '14px 18px',
            border: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: '0.3s'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 900, fontFamily: 'JetBrains Mono,monospace' }}>{ev.code}</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{ev.title}</div>
              <div style={{ fontSize: 10, color: '#4a5e78', fontWeight: 700 }}>{ev.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 8,
                fontWeight: 900,
                color: ev.impact === 'HIGH' ? '#ea3943' : ev.impact === 'MEDIUM' ? '#f59e0b' : '#4a5e78',
                background: ev.impact === 'HIGH' ? 'rgba(234,57,67,0.1)' : 'rgba(255,255,255,0.03)',
                padding: '4px 8px',
                borderRadius: 4,
                display: 'inline-block',
                letterSpacing: 0.5
              }}>
                {ev.impact}
              </div>
              <div style={{ fontSize: 16, marginTop: 6 }}>{ev.volatility}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="pro-sync-btn" onClick={fetchEvents} style={{
        marginTop: 20,
        background: 'transparent',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 12,
        color: '#3861fb',
        fontSize: 10,
        fontWeight: 900,
        padding: '12px',
        cursor: 'pointer',
        transition: '0.3s',
        letterSpacing: 1
      }}>
        {loading ? 'SYNCHRONIZING...' : 'SYNCHRONIZE TEMPORAL NODES'}
      </button>

      <style>{`
        .event-row:hover { background: rgba(59, 130, 246, 0.05) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
        .pro-sync-btn:hover { background: rgba(59, 130, 246, 0.1) !important; color: #fff; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
