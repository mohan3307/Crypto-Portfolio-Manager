import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/format';

export default function SessionTracker() {
  const session = {
    dailyPnL: 1240.50,
    dailyPnLPct: 2.4,
    trades: 12,
    winRate: 75,
    profitFactor: 2.1
  };

  return (
    <div className="v4-session-card">
      <div className="v4-session-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="v4-session-icon">⚡</div>
          <div>
            <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 3 }}>INTRADAY_PROTOCOL</div>
            <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>TACTICAL_SESSION</div>
          </div>
        </div>
        <div className="v4-session-live">● LIVE</div>
      </div>

      {/* P&L grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
        <div className="v4-session-stat" style={{ borderTop: '2px solid #10b981' }}>
          <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1.5, marginBottom: 8 }}>DAILY_DELTA</div>
          <div style={{ fontSize: 20, fontWeight: 950, color: '#10b981', fontFamily: 'Space Mono', letterSpacing: -1 }}>
            +{formatCurrency(session.dailyPnL)}
          </div>
        </div>
        <div className="v4-session-stat" style={{ borderTop: '2px solid #3b82f6' }}>
          <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1.5, marginBottom: 8 }}>STRATEGIC_GROWTH</div>
          <div style={{ fontSize: 20, fontWeight: 950, color: '#3b82f6', fontFamily: 'Space Mono', letterSpacing: -1 }}>
            +{formatPercent(session.dailyPnLPct)}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px 20px' }}>
        {[
          { label: 'EXECUTED_VECTORS', val: `${session.trades} TRADES`, color: '#fff' },
          { label: 'SESSION_EFFICIENCY', val: `${session.winRate}% WIN_RATE`, color: '#3b82f6' },
          { label: 'PROFIT_COEFFICIENT', val: `${session.profitFactor}x FACTOR`, color: '#f59e0b' },
        ].map((item, i) => (
          <div key={i} className="v4-session-row">
            <span style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, letterSpacing: 1 }}>{item.label}</span>
            <span style={{ fontSize: 10, fontWeight: 950, color: item.color, fontFamily: 'Space Mono' }}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Win-rate bar */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${session.winRate}%`, height: '100%', background: '#3b82f6', borderRadius: 2, boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)', transition: '1s' }} />
        </div>
      </div>

      <style>{`
        .v4-session-card { background: rgba(7,11,20,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; gap: 20px; }
        .v4-session-header { padding: 20px 20px 0; display: flex; align-items: center; justify-content: space-between; }
        .v4-session-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(59,130,246,0.2); }
        .v4-session-live { font-size: 9px; font-weight: 950; color: #10b981; padding: 4px 10px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; }
        .v4-session-stat { background: rgba(255,255,255,0.01); padding: 16px; border-radius: 16px; transition: 0.3s; }
        .v4-session-stat:hover { background: rgba(255,255,255,0.03); transform: translateY(-2px); }
        .v4-session-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.01); border-radius: 12px; transition: 0.2s; }
        .v4-session-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>
    </div>
  );
}
