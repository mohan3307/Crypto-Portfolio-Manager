import React from 'react';

const metrics = [
  { label: 'SYSTEMIC_BETA', value: '1.24', color: 'var(--green)', desc: 'VOLATILITY_RATIO_(BTC)' },
  { label: 'SHARPE_ALPHA', value: '2.14', color: 'var(--text-primary)', desc: 'RISK_ADJ_EFFICIENCY' },
  { label: 'SORTINO_RATIO', value: '2.85', color: 'var(--gold)', desc: 'DOWNSIDE_VARIANCE_ADJ' },
  { label: 'VaR_MONITOR', value: '$2.1K', color: 'var(--red)', desc: 'DAILY_STOCHASTIC_RISK' },
];

export default function RiskTelemetry() {
  const assets = ['BTC', 'ETH', 'SOL', 'BNB', 'LINK'];
  const matrix = [
    [1.0, 0.82, 0.45, 0.61, 0.32],
    [0.82, 1.0, 0.38, 0.55, 0.28],
    [0.45, 0.38, 1.0, 0.22, 0.15],
    [0.61, 0.55, 0.22, 1.0, 0.41],
    [0.32, 0.28, 0.15, 0.41, 1.0],
  ];

  return (
    <div className="card risk-telemetry-panel" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>RISK_TELEMETRY_v4.2</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', border: '1px solid var(--green)' }}>STABLE</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} className="metric-node" style={{ borderLeft: `2px solid ${m.color}`, padding: '12px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="correlation-matrix-section">
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 12, letterSpacing: 1 }}>ASSET_CORRELATION_MATRIX (5x5)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(5, 1fr)', gap: 4, alignItems: 'center' }}>
          <div />
          {assets.map(a => <div key={a} style={{ fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 900 }}>{a}</div>)}
          
          {matrix.map((row, i) => (
            <React.Fragment key={i}>
              <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 900 }}>{assets[i]}</div>
              {row.map((val, j) => (
                <div key={j} style={{ 
                  height: '24px', background: `rgba(0, 255, 187, ${val * 0.4})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: val > 0.6 ? '#000' : '#fff', fontWeight: 900,
                  fontFamily: 'var(--font-mono)', border: '1px solid var(--border)'
                }}>
                  {val.toFixed(2)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style jsx>{`
        .metric-node { transition: 0.2s; }
        .metric-node:hover { transform: translateX(4px); background: var(--bg-card-hover) !important; }
      `}</style>
    </div>
  );
}

