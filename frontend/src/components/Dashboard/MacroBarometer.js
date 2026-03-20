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
    { label: 'DXY_INDEX', val: data.dxy.toFixed(2), unit: '', status: 'NEUTRAL', active: false, color: '#8b5cf6' },
    { label: 'SPX_500', val: data.spx.toFixed(0), unit: '', status: 'RISK_ON', active: true, color: '#10b981' },
    { label: 'CPI_INFLATION', val: data.cpi.toFixed(1), unit: '%', status: 'STICKY', active: false, color: '#f59e0b' },
    { label: 'FED_RATES', val: data.rates.toFixed(2), unit: '%', status: 'RESTRICTIVE', active: false, color: '#ff4d4d' },
  ];

  return (
    <div className="v4-macro-panel">
      <div className="v4-macro-header">
        <div>
          <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>TradFi_NEXUS</div>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>MACRO_BAROMETER</div>
        </div>
        <div className="v4-macro-liquidity">● LIQUIDITY: EXPANDING</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 20px' }}>
        {items.map((item, i) => (
          <div key={i} className="v4-macro-row" style={{ borderLeft: `3px solid ${item.color}30` }}>
            <div>
              <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1.5, marginBottom: 5 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 950, fontFamily: 'Space Mono', color: '#fff', letterSpacing: -1 }}>
                {item.val}<span style={{ fontSize: 11, color: '#4a5e78', marginLeft: 2 }}>{item.unit}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontWeight: 950, color: item.color, marginBottom: 8, letterSpacing: 1 }}>{item.status}</div>
              <div style={{ width: 48, height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden', marginLeft: 'auto' }}>
                <div style={{ width: item.active ? '85%' : '30%', height: '100%', background: item.color, borderRadius: 2, boxShadow: `0 0 8px ${item.color}50` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .v4-macro-panel { background: rgba(7, 11, 20, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .v4-macro-header { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; }
        .v4-macro-liquidity { font-size: 8px; font-weight: 950; color: #10b981; padding: 4px 10px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); border-radius: 20px; }
        .v4-macro-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255,255,255,0.01); border-radius: 14px; transition: 0.3s; }
        .v4-macro-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>
    </div>
  );
}
