import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function SentimentGauge() {
  const { socket } = useMarket();
  const [sentiment, setSentiment] = useState(65); // 0-100 (Fear to Greed)
  const [lastSignal, setLastSignal] = useState({ type: 'Neutral', coin: 'BTC' });

  useEffect(() => {
    if (!socket) return;
    
    const handleSignal = (data) => {
      if (data.sentiment) {
        setLastSignal({ type: data.sentiment, coin: data.symbol || data.coin });
        setSentiment(prev => {
          const delta = data.sentiment === 'Bullish' ? 1.5 : -1.5;
          return Math.min(95, Math.max(5, prev + delta));
        });
      }
    };

    socket.on('whaleAlert', handleSignal);
    socket.on('liquidationUpdate', handleSignal);
    socket.on('aiPatternUpdate', handleSignal);

    return () => {
      socket.off('whaleAlert', handleSignal);
      socket.off('liquidationUpdate', handleSignal);
      socket.off('aiPatternUpdate', handleSignal);
    };
  }, [socket]);

  const getColor = () => {
    if (sentiment > 70) return 'var(--green)';
    if (sentiment < 30) return 'var(--red)';
    return 'var(--gold)';
  };

  return (
    <div className="card glass" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>🧠</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Sentiment Intelligence</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Aggregated News & On-Chain Mood</div>
        </div>
      </div>

      <div style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="180" height="100">
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke={getColor()} strokeWidth="12" strokeLinecap="round" 
            strokeDasharray="220" strokeDashoffset={220 - (sentiment / 100 * 220)} style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Space Mono' }}>{sentiment.toFixed(0)}</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: getColor(), textTransform: 'uppercase' }}>
            {sentiment > 70 ? 'Extreme Greed' : sentiment < 30 ? 'Extreme Fear' : 'Neutral Hub'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: '#4a5e78' }}>LATEST SIGNAL</span>
          <span style={{ color: lastSignal.type === 'Bullish' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
            {lastSignal.coin}: {(lastSignal.type || '').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
