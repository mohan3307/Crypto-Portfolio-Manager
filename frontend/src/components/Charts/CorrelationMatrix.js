import React from 'react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA'];
const MATRIX_DATA = [
  [1.00, 0.88, 0.72, 0.65, 0.58],
  [0.88, 1.00, 0.81, 0.70, 0.62],
  [0.72, 0.81, 1.00, 0.55, 0.49],
  [0.65, 0.70, 0.55, 1.00, 0.78],
  [0.58, 0.62, 0.49, 0.78, 1.00],
];

export default function CorrelationMatrix() {
  const getColor = (val) => {
    if (val === 1) return 'rgba(59, 130, 246, 0.15)';
    if (val > 0.8) return 'rgba(16, 185, 129, 0.25)';
    if (val > 0.6) return 'rgba(16, 185, 129, 0.12)';
    return 'rgba(255, 255, 255, 0.02)';
  };

  return (
    <div className="glass-heavy correlation-matrix-panel" style={{ padding: '24px', borderRadius: 24, height: '100%', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 25 }}>
        <div style={{ fontSize: 20 }}>📊</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: -0.2 }}>ASSET_CORRELATION</div>
          <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 900 }}>24H NEURAL SYNCHRONICITY</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${ASSETS.length}, 1fr)`, gap: 6 }}>
        <div />
        {ASSETS.map(a => (
          <div key={a} style={{ fontSize: 9, fontWeight: 900, textAlign: 'center', color: '#4a5e78', fontFamily: 'Space Mono' }}>{a}</div>
        ))}

        {ASSETS.map((row, i) => (
          <React.Fragment key={row}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#4a5e78', fontFamily: 'Space Mono', display: 'flex', alignItems: 'center' }}>{row}</div>
            {MATRIX_DATA[i].map((val, j) => (
              <div key={`${i}-${j}`} className="heat-cell" style={{ 
                height: 42, 
                background: getColor(val), 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.03)',
                transition: '0.3s'
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: val > 0.8 ? '#fff' : '#4a5e78', fontFamily: 'Space Mono' }}>{val.toFixed(2)}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: 25, fontSize: 8, color: '#4a5e78', textAlign: 'center', fontWeight: 900, letterSpacing: 0.5 }}>
        COEFFICIENTS NEAR 1.00 INDICATE TOTAL MARKET CONVERGENCE.
      </div>

      <style>{`
        .correlation-matrix-panel { background: rgba(10, 15, 28, 0.7) !important; backdrop-filter: blur(25px) saturate(210%); }
        .heat-cell:hover { transform: scale(1.05); z-index: 10; border-color: rgba(59, 130, 246, 0.3) !important; box-shadow: 0 0 20px rgba(0,0,0,0.4); }
      `}</style>
    </div>
  );
}
