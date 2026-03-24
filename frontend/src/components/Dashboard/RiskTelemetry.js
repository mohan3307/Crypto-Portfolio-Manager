import React, { useState, useEffect } from 'react';
import { getRiskTelemetry } from '../../services/api';

export default function RiskTelemetry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskTelemetry()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="card risk-telemetry-panel" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="v4-neural-spinner" />
    </div>
  );

  const { metrics, assets, matrix } = data;

  return (
    <div className="card risk-telemetry-panel" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>RISK_TELEMETRY_v4.2</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 900, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', border: '1px solid #10b981' }}>STABLE</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} className="metric-node" style={{ borderLeft: `2px solid ${m.color}`, padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: 8, color: '#7b94b8', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: m.color, fontFamily: 'JetBrains Mono,monospace' }}>{m.value}</div>
            <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 700, marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="correlation-matrix-section">
        <div style={{ fontSize: 9, color: '#7b94b8', fontWeight: 800, marginBottom: 12, letterSpacing: 1 }}>ASSET_CORRELATION_MATRIX (5x5)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(5, 1fr)', gap: 4, alignItems: 'center' }}>
          <div />
          {assets.map(a => <div key={a} style={{ fontSize: 8, color: '#4a5e78', textAlign: 'center', fontWeight: 900 }}>{a}</div>)}
          
          {matrix.map((row, i) => (
            <React.Fragment key={i}>
              <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900 }}>{assets[i]}</div>
              {row.map((val, j) => (
                <div key={j} style={{ 
                  height: '24px', background: `rgba(0, 255, 187, ${val * 0.4})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: val > 0.6 ? '#000' : '#fff', fontWeight: 900,
                  fontFamily: 'JetBrains Mono,monospace', border: '1px solid rgba(255,255,255,0.03)'
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
        .metric-node:hover { transform: translateX(4px); background: rgba(59, 130, 246, 0.05) !important; }
      `}</style>
    </div>
  );
}

