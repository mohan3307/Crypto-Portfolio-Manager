import React from 'react';

export default function RiskTelemetry() {
  const metrics = [
    { label: 'Portfolio Beta', value: '1.24', color: 'var(--gold)', desc: 'Vol. relative to BTC' },
    { label: 'Sharpe Ratio', value: '2.14', color: 'var(--green)', desc: 'Risk-adj. return' },
    { label: 'Max Drawdown', value: '-8.4%', color: 'var(--red)', desc: 'ATH to trough' },
    { label: 'Var (95%)', value: '2.1k', color: '#8b5cf6', desc: 'Est. daily risk' },
  ];

  return (
    <div className="card glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#eef2fa', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⚖️</span> RISK TELEMETRY
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 9, color: '#4a5e78', marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: m.color, fontFamily: 'Space Mono' }}>{m.value}</div>
            <div style={{ fontSize: 8, color: '#4a5e78', marginTop: 2 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
