import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

const SECTOR_COLORS = ['#3b82f6', '#ff4d4d', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4'];

export default function SectorDecomposition() {
  const { socket } = useMarket();
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on('sectorMetricsUpdate', (update) => setSectors(update));
    return () => socket.off('sectorMetricsUpdate');
  }, [socket]);

  if (sectors.length === 0) return (
    <div className="v4-sector-shell v4-sector-idle">
      <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, letterSpacing: 2 }}>DECOMPOSING_SECTORS...</div>
    </div>
  );

  return (
    <div className="v4-sector-shell">
      <div className="v4-sector-header">
        <div>
          <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>PORTFOLIO_MIX</div>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>SECTOR_DECOMPOSITION</div>
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', margin: '0 20px 20px', gap: 2 }}>
        {sectors.map((s, i) => (
          <div key={i} title={`${s.name}: ${s.weight}%`} style={{
            width: `${s.weight}%`,
            height: '100%',
            background: SECTOR_COLORS[i % SECTOR_COLORS.length],
            boxShadow: `0 0 8px ${SECTOR_COLORS[i % SECTOR_COLORS.length]}50`,
            borderRadius: i === 0 ? '5px 0 0 5px' : i === sectors.length - 1 ? '0 5px 5px 0' : 0
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 20px 20px' }}>
        {sectors.slice(0, 6).map((s, i) => (
          <div key={i} className="v4-sector-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: SECTOR_COLORS[i % SECTOR_COLORS.length], boxShadow: `0 0 6px ${SECTOR_COLORS[i % SECTOR_COLORS.length]}` }} />
              <span style={{ fontSize: 9, color: '#8899b4', fontWeight: 950, letterSpacing: 0.5 }}>{s.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 10, fontWeight: 950, color: '#fff', fontFamily: 'Space Mono' }}>{s.weight}%</span>
              <span style={{ fontSize: 9, fontWeight: 950, color: s.perf24h >= 0 ? '#10b981' : '#ff4d4d' }}>
                {s.perf24h >= 0 ? '▲' : '▼'}{Math.abs(s.perf24h)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .v4-sector-shell { background: rgba(7,11,20,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; }
        .v4-sector-idle { height: 210px; align-items: center; justify-content: center; }
        .v4-sector-header { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); margin-bottom: 16px; }
        .v4-sector-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.01); border-radius: 12px; transition: 0.2s; }
        .v4-sector-item:hover { background: rgba(255,255,255,0.03); }
      `}</style>
    </div>
  );
}
