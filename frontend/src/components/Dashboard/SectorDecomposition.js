import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function SectorDecomposition() {
  const { socket } = useMarket();
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on('sectorMetricsUpdate', (update) => setSectors(update));
    return () => socket.off('sectorMetricsUpdate');
  }, [socket]);

  if (sectors.length === 0) return <div className="card glass" style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#4a5e78' }}>DECOMPOSING SECTORS...</div>;

  return (
    <div className="card glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', textTransform: 'uppercase' }}>Sector Exposure Analysis</div>
      
      <div style={{ display: 'flex', gap: 4, height: 35, borderRadius: 8, overflow: 'hidden' }}>
        {sectors.map((s, i) => (
          <div key={i} style={{ 
            width: `${s.weight}%`, 
            height: '100%', 
            background: i === 0 ? 'var(--blue)' : i === 1 ? 'var(--red)' : i === 2 ? 'var(--gold)' : i === 3 ? '#8b5cf6' : 'var(--green)',
            opacity: 0.8
          }} title={`${s.name}: ${s.weight}%`} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {sectors.slice(0, 4).map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? 'var(--blue)' : i === 1 ? 'var(--red)' : i === 2 ? 'var(--gold)' : '#8b5cf6' }} />
              <span style={{ color: '#8899b4' }}>{s.name}</span>
            </div>
            <div style={{ fontWeight: 800, color: s.perf24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {s.perf24h >= 0 ? '↑' : '↓'} {Math.abs(s.perf24h)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
