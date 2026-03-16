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
    <div className="card glass" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Terminal Session</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Intraday Performance Metrics</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 9, color: '#4a5e78', marginBottom: 4 }}>DAILY DELTA</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', fontFamily: 'Space Mono' }}>+{formatCurrency(session.dailyPnL)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 9, color: '#4a5e78', marginBottom: 4 }}>GROWTH</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', fontFamily: 'Space Mono' }}>{formatPercent(session.dailyPnLPct)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Trades Executed', value: session.trades, suffix: '' },
          { label: 'Session Win Rate', value: session.winRate, suffix: '%', color: 'var(--blue)' },
          { label: 'Profit Factor', value: session.profitFactor, suffix: 'x', color: 'var(--gold)' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#8899b4' }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: item.color || '#eef2fa', fontFamily: 'Space Mono' }}>
              {item.value}{item.suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
