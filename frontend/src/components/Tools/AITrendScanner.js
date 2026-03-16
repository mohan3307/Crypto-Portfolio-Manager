import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AITrendScanner() {
  const { socket } = useMarket();
  const [trends, setTrends] = useState([
    { symbol: 'BTC', pattern: 'Support Bounce', timeframe: '1H', confidence: 88, timestamp: Date.now() - 100000 },
    { symbol: 'ETH', pattern: 'Cup & Handle', timeframe: '4H', confidence: 75, timestamp: Date.now() - 500000 }
  ]);

  useEffect(() => {
    if (!socket) return;
    socket.on('aiPatternUpdate', (data) => {
      setTrends(prev => [data, ...prev].slice(0, 10));
    });
    return () => socket.off('aiPatternUpdate');
  }, [socket]);

  return (
    <div className="card glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ padding: '14px 18px' }}>
        <div>
          <div className="card-title" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🎯</span> AI Technical Scanner
          </div>
          <div style={{ fontSize: 10, color: '#4a5e78', marginTop: 2 }}>High-confidence pattern detection</div>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
        {trends.map((t, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#eef2fa' }}>{t.symbol} <span style={{ color: 'var(--blue)', fontSize: 10 }}>{t.timeframe}</span></div>
              <div style={{ fontSize: 11, color: '#8899b4' }}>{t.pattern}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.confidence > 85 ? 'var(--green)' : 'var(--gold)' }}>
                {t.confidence}% Conf.
              </div>
              <div style={{ fontSize: 9, color: '#4a5e78' }}>
                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(5px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
