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

  if (!flows) return (
    <div className="v4-wf-shell v4-wf-idle">
      <div className="v4-scan-indicator">
        <div className="v4-scan-ring" />
        <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, letterSpacing: 2, marginTop: 20 }}>WHALE_TELEMETRY_INITIALIZING...</div>
      </div>
    </div>
  );

  return (
    <div className="v4-wf-shell">
      <div className="v4-wf-header">
        <div>
          <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>ON_CHAIN_INTELLIGENCE</div>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>WHALE_FLOW_MATRIX</div>
        </div>
        <div className="v4-wf-live">⬡ TRACKING</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 20px' }}>
        {Object.entries(flows).map(([sym, data]) => {
          const net = data.inflow - data.outflow;
          const isPos = net >= 0;
          const barPct = Math.min(50, Math.abs(net) / 10);
          const color = isPos ? '#10b981' : '#ff4d4d';

          return (
            <div key={sym} className="v4-wf-row">
              <div style={{ width: 40, fontSize: 11, fontWeight: 950, color: '#fff', flexShrink: 0 }}>{sym}</div>
              <div style={{ flex: 1, position: 'relative', height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
                {/* Midpoint line */}
                <div style={{ position: 'absolute', left: '50%', top: -3, width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{
                  position: 'absolute',
                  left: isPos ? '50%' : `calc(50% - ${barPct}%)`,
                  width: `${barPct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 3,
                  boxShadow: `0 0 8px ${color}60`
                }} />
              </div>
              <div style={{ width: 60, textAlign: 'right', fontSize: 10, fontWeight: 950, color, fontFamily: 'Space Mono', flexShrink: 0 }}>
                {isPos ? '+' : ''}{net.toFixed(1)}M
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 0.5 }}>
        POSITIVE_FLOW: ACCUMULATION_ON_CHAIN ↑ // NEGATIVE_FLOW: DISTRIBUTION_SIGNAL ↓
      </div>

      <style>{`
        .v4-wf-shell { background: rgba(7, 11, 20, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; }
        .v4-wf-idle { height: 200px; align-items: center; justify-content: center; }
        .v4-wf-header { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; }
        .v4-wf-live { font-size: 9px; font-weight: 950; color: #10b981; padding: 4px 12px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; }
        .v4-wf-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: rgba(255,255,255,0.01); border-radius: 12px; transition: 0.2s; }
        .v4-wf-row:hover { background: rgba(59, 130, 246, 0.05); }
        .v4-scan-indicator { display: flex; flex-direction: column; align-items: center; }
        .v4-scan-ring { width: 40px; height: 40px; border: 3px solid rgba(59, 130, 246, 0.3); border-top-color: #3b82f6; border-radius: 50%; animation: v4-spin 1.5s linear infinite; }
        @keyframes v4-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
