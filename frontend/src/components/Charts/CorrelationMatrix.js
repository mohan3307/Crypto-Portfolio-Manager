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
    if (val === 1) return 'rgba(59, 130, 246, 0.2)';
    if (val > 0.8) return 'rgba(16, 185, 129, 0.3)';
    if (val > 0.6) return 'rgba(16, 185, 129, 0.15)';
    return 'rgba(255, 255, 255, 0.03)';
  };

  return (
    <div className="card glass-heavy" style={{ padding: '16px', height: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', mb: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>Asset Correlation (24H)</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${ASSETS.length}, 1fr)`, gap: 4, mt: 10 }}>
        {/* Header Spacer */}
        <div />
        {ASSETS.map(a => (
          <div key={a} style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', color: '#4a5e78' }}>{a}</div>
        ))}

        {ASSETS.map((row, i) => (
          <React.Fragment key={row}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a5e78', display: 'flex', alignItems: 'center' }}>{row}</div>
            {MATRIX_DATA[i].map((val, j) => (
              <div key={`${i}-${j}`} style={{ 
                height: 35, 
                background: getColor(val), 
                borderRadius: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: val > 0.8 ? '#fff' : '#8899b4' }}>{val.toFixed(2)}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div style={{ mt: 15, fontSize: 8, color: '#4a5e78', textAlign: 'center' }}>
        Higher values indicate assets moving in sync.
      </div>
    </div>
  );
}
