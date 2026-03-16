import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function OrderBookDepth() {
  const { socket } = useMarket();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('orderBookUpdate', (update) => setData(update));
    return () => socket.off('orderBookUpdate');
  }, [socket]);

  if (!data) return <div className="card glass" style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#4a5e78' }}>SYNCING ORDERBOOK...</div>;

  const maxTotal = 20; // Fixed scale for visualization

  return (
    <div className="card glass-heavy" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa' }}>{data.symbol}/USDT DEPTH</div>
        <div style={{ fontSize: 9, color: 'var(--green)', letterSpacing: 1 }}>LIVE FEED</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Asks (Sells) - Top down */}
        {[...data.asks].reverse().slice(0, 5).map((ask, i) => (
          <div key={`ask-${i}`} style={{ display: 'flex', position: 'relative', height: 16, alignItems: 'center', fontSize: 10, fontFamily: 'Space Mono' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(239, 68, 68, 0.1)', width: `${(ask.size / maxTotal) * 100}%` }} />
            <span style={{ color: 'var(--red)', width: 60, zIndex: 1 }}>{ask.price.toFixed(2)}</span>
            <span style={{ color: '#8899b4', marginLeft: 'auto', zIndex: 1 }}>{ask.size.toFixed(3)}</span>
          </div>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

        {/* Bids (Buys) */}
        {data.bids.slice(0, 5).map((bid, i) => (
          <div key={`bid-${i}`} style={{ display: 'flex', position: 'relative', height: 16, alignItems: 'center', fontSize: 10, fontFamily: 'Space Mono' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.1)', width: `${(bid.size / maxTotal) * 100}%` }} />
            <span style={{ color: 'var(--green)', width: 60, zIndex: 1 }}>{bid.price.toFixed(2)}</span>
            <span style={{ color: '#8899b4', marginLeft: 'auto', zIndex: 1 }}>{bid.size.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
