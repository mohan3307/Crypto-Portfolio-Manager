import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function OnChainFeed() {
  const { socket } = useMarket();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleWhale = (data) => {
      setEvents(prev => [{ type: 'whale', ...data, id: Date.now() + Math.random() }, ...prev].slice(0, 10));
    };

    const handleLiq = (data) => {
      setEvents(prev => [{ type: 'liq', ...data, id: Date.now() + Math.random() }, ...prev].slice(0, 10));
    };

    socket.on('whaleAlert', handleWhale);
    socket.on('liquidationUpdate', handleLiq);

    return () => {
      socket.off('whaleAlert', handleWhale);
      socket.off('liquidationUpdate', handleLiq);
    };
  }, [socket]);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>On-Chain Pulse</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Live Whale moves & Liquidation feed</div>
        </div>
        <span className="badge badge-red" style={{ fontSize: 9 }}>LIVE</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {events.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#3d5470', fontSize: 12 }}>Waiting for on-chain events...</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <span style={{ fontSize: 16 }}>{ev.type === 'whale' ? '🐋' : '🔥'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ev.type === 'whale' ? 'var(--blue)' : 'var(--red)' }}>
                    {ev.type === 'whale' ? 'WHALE MOVE' : 'LIQUIDATION'}
                  </span>
                  <span style={{ fontSize: 9, color: '#4a5e78' }}>{new Date().toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: 12, color: '#eef2fa', fontWeight: 500 }}>
                  {ev.type === 'whale' ? (
                    <>{ev.amount} {ev.coin} transfer spotted</>
                  ) : (
                    <>{ev.symbol} {ev.side} liquidated: ${(ev.amount/1000).toFixed(1)}K</>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
