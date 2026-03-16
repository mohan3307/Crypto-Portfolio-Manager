import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function WhaleFlowMap() {
  const { socket } = useMarket();
  const [flows, setFlows] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('whaleFlowUpdate', (update) => setFlows(update));
    return () => socket.off('whaleFlowUpdate');
  }, [socket]);

  if (!flows) return <div className="card glass" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#4a5e78' }}>TRACKING WHALE FLOWS...</div>;

  return (
    <div className="card glass-heavy" style={{ padding: '16px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', mb: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>Net Exchange Flows (Cap Hub)</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, mt: 10 }}>
        {Object.entries(flows).map(([sym, data]) => {
          const net = data.inflow - data.outflow;
          const isPositive = net >= 0;
          return (
            <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
              <div style={{ width: 35, fontSize: 11, fontWeight: 800, color: '#fff' }}>{sym}</div>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: isPositive ? '50%' : `calc(50% - ${Math.min(Math.abs(net) / 10, 50)}%)`,
                  width: `${Math.min(Math.abs(net) / 10, 50)}%`,
                  height: '100%',
                  background: isPositive ? 'var(--green)' : 'var(--red)',
                  borderRadius: 2
                }} />
              </div>
              <div style={{ width: 60, textAlign: 'right', fontSize: 10, fontWeight: 700, color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                {isPositive ? '+' : ''}{net.toFixed(1)}M
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ mt: 15, fontSize: 8, color: '#4a5e78', textAlign: 'center' }}>
        Positive values indicate asset accumulation on exchanges.
      </div>
    </div>
  );
}
