import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AITrendScanner() {
  const { socket } = useMarket();
  const [trends, setTrends] = useState([
    { symbol: 'BTC', pattern: 'Bullish Engulfing', timeframe: '1H', confidence: 92, status: 'Active', timestamp: Date.now() - 300000 },
    { symbol: 'ETH', pattern: 'Pivot Support', timeframe: '4H', confidence: 84, status: 'Pending', timestamp: Date.now() - 1200000 },
    { symbol: 'SOL', pattern: 'Golden Cross', timeframe: '1D', confidence: 95, status: 'Active', timestamp: Date.now() - 86400000 }
  ]);

  useEffect(() => {
    if (!socket) return;
    const handlePattern = (data) => {
      setTrends(prev => [data, ...prev].slice(0, 10));
    };
    socket.on('aiPatternUpdate', handlePattern);
    return () => socket.off('aiPatternUpdate', handlePattern);
  }, [socket]);

  return (
    <div className="glass-heavy" style={{ height: '100%', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(59, 130, 246, 0.03)' }}>
        <div className="card-title">
          <span className="live-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} />
          AI TREND SCANNER (PRO)
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
        {trends.map((t, i) => (
          <div key={i} className="trend-row" style={{
            padding: '14px 0',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            animation: `slideInLeft 0.5s ease forwards ${i * 0.1}s`,
            opacity: 0
          }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 12, 
              background: t.pattern.includes('Bullish') || t.pattern.includes('Golden') ? 'rgba(0, 212, 170, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>
              {t.pattern.includes('Bullish') || t.pattern.includes('Golden') ? '↗️' : '🔘'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#eef2fa' }}>{t.symbol} <span style={{ color: '#4a5e78', fontSize: 9 }}>{t.timeframe}</span></span>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', color: '#8899b4' }}>{t.status}</span>
              </div>
              <div style={{ fontSize: 11, color: '#8899b4', marginBottom: 6 }}>{t.pattern}</div>
              <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <div style={{ 
                  height: '100%', width: `${t.confidence}%`, 
                  background: t.confidence > 90 ? 'var(--blue)' : 'var(--green)',
                  borderRadius: 2,
                  boxShadow: `0 0 10px ${t.confidence > 90 ? 'var(--blue)' : 'var(--green)'}44`
                }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 50 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: 'Space Mono' }}>{t.confidence}%</div>
              <div style={{ fontSize: 9, color: '#4a5e78' }}>CONF.</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .trend-row:hover { background: rgba(255,255,255,0.01); }
      `}</style>
    </div>
  );
}
