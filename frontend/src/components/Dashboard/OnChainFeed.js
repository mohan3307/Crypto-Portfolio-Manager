import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function OnChainFeed() {
  const { socket } = useMarket();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const push = (type, data) =>
      setEvents(prev => [{ type, ...data, id: Date.now() + Math.random(), ts: new Date() }, ...prev].slice(0, 12));

    socket.on('whaleAlert', (d) => push('whale', d));
    socket.on('liquidationUpdate', (d) => push('liq', d));
    return () => { socket.off('whaleAlert'); socket.off('liquidationUpdate'); };
  }, [socket]);

  const typeConfig = {
    whale: { icon: '🐳', color: '#3b82f6', label: 'WHALE_TRANSFER' },
    liq:   { icon: '⚡', color: '#ff4d4d', label: 'LIQUIDATION' },
  };

  return (
    <div className="v4-onchain-panel">
      <div className="v4-onchain-header">
        <div>
          <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>MEMPOOL_STREAM</div>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>ON_CHAIN_PULSE</div>
        </div>
        <div className="v4-live-badge">● LIVE_FEED</div>
      </div>

      <div className="v4-onchain-feed v4-scroller">
        {events.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="v4-wait-ring" />
            <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, letterSpacing: 2, marginTop: 20 }}>SCANNING_MEMPOOL...</div>
          </div>
        ) : events.map(ev => {
          const cfg = typeConfig[ev.type] || typeConfig.liq;
          return (
            <div key={ev.id} className="v4-event-row" style={{ animationDelay: '0ms' }}>
              <div className="v4-event-icon" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 950, color: cfg.color, letterSpacing: 1.5 }}>{cfg.label}</span>
                  <span style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, fontFamily: 'Space Mono' }}>{ev.ts?.toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: 11, color: '#eef2fa', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.type === 'whale' ? `${ev.amount} ${ev.coin} ON-CHAIN_TRANSFER` : `${ev.symbol} ${ev.side?.toUpperCase()} // $${(ev.amount / 1000).toFixed(1)}K LIQUIDATED`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .v4-onchain-panel { background: rgba(7,11,20,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .v4-onchain-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .v4-live-badge { font-size: 9px; font-weight: 950; color: #10b981; padding: 4px 12px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; letter-spacing: 1px; }
        .v4-onchain-feed { flex: 1; overflow-y: auto; padding: 10px 0; }
        .v4-onchain-feed::-webkit-scrollbar { width: 3px; }
        .v4-onchain-feed::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.15); border-radius: 2px; }
        .v4-event-row { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; gap: 14px; animation: v4-slide-in 0.3s ease-out; transition: 0.2s; }
        .v4-event-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes v4-slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .v4-event-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .v4-wait-ring { width: 36px; height: 36px; border: 3px solid rgba(59,130,246,0.2); border-top-color: #3b82f6; border-radius: 50%; animation: v4-spin 1.5s linear infinite; margin: 0 auto; }
        @keyframes v4-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
