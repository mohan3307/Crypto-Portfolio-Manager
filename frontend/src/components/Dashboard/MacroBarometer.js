import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function MacroBarometer() {
  const { socket } = useMarket();
  const [data, setData] = useState({ dxy: 104.2, spx: 5240, cpi: 3.2, rates: 5.5, bond10y: 4.25 });

  useEffect(() => {
    if (!socket) return;
    socket.on('macroUpdate', (update) => setData(update));
    return () => socket.off('macroUpdate');
  }, [socket]);

  const items = [
    { label: 'DXY (DOLLAR)', val: data.dxy.toFixed(2), unit: '', status: 'Neutral', active: true },
    { label: 'S&P 500', val: data.spx.toFixed(0), unit: '', status: 'Risk-On', active: true },
    { label: 'CPI (INFLATION)', val: data.cpi.toFixed(1), unit: '%', status: 'Sticky', active: false },
    { label: 'FED RATES', val: data.rates.toFixed(2), unit: '%', status: 'Restrictive', active: false }
  ];

  return (
    <div className="card glass-heavy" style={{ padding: '16px', height: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', mb: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>Macro Economic Barometer</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, mt: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize: 8, color: '#4a5e78', textTransform: 'uppercase', mb: 4 }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#eef2fa', fontFamily: 'Space Mono' }}>{item.val}</span>
                <span style={{ fontSize: 10, color: '#8899b4' }}>{item.unit}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: item.active ? 'var(--blue)' : '#4a5e78', fontWeight: 700, mb: 4 }}>{item.status}</div>
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <div style={{ width: item.active ? '80%' : '30%', height: '100%', background: item.active ? 'var(--blue)' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ mt: 15, pt: 10, borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
         <span style={{ fontSize: 9, color: 'var(--blue)', fontWeight: 700 }}>● GLOBAL LIQUIDITY: EXPANDING</span>
      </div>
    </div>
  );
}
