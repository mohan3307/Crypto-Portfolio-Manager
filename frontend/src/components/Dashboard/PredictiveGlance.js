import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function PredictiveGlance() {
  const { socket } = useMarket();
  const [prediction, setPrediction] = useState({
    coin: 'BTC', target: '100K', probability: 72, timeframe: 'April 2026'
  });

  useEffect(() => {
    if (!socket) return;
    socket.on('futurePredictionUpdate', (data) => setPrediction(data));
    return () => socket.off('futurePredictionUpdate');
  }, [socket]);

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (prediction.probability / 100 * circumference);
  const color = prediction.probability >= 70 ? '#10b981' : prediction.probability >= 50 ? '#f59e0b' : '#ff4d4d';

  return (
    <div className="v4-pg-card">
      <div className="v4-pg-header">
        <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>QUANTUM_MONTE_CARLO</div>
        <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>PREDICTIVE_ORACLE</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '20px' }}>
        {/* Probability arc */}
        <div style={{ position: 'relative' }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
            {/* Glow ring */}
            <circle cx="65" cy="65" r="52" fill="none" stroke={`${color}20`} strokeWidth="16" />
            {/* Progress ring */}
            <circle cx="65" cy="65" r="52" fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 950, color: '#fff', fontFamily: 'Space Mono', letterSpacing: -2 }}>{prediction.probability}%</div>
            <div style={{ fontSize: 7, color: '#4a5e78', fontWeight: 950, letterSpacing: 1 }}>PROBABILITY</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 950, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
            {prediction.coin} <span style={{ color }}>→ ${prediction.target}</span>
          </div>
          <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, letterSpacing: 0.5 }}>
            PROJECTED TARGET BY {prediction.timeframe.toUpperCase()}
          </div>
        </div>

        <div className="v4-pg-paths">
          <span style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950 }}>MONTE_CARLO: 50,000_ALGO_PATHS</span>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <div className="v4-pg-pill bull">BULL: {prediction.probability}%</div>
            <div className="v4-pg-pill bear">BEAR: {100 - prediction.probability}%</div>
          </div>
        </div>
      </div>

      <style>{`
        .v4-pg-card { background: rgba(7,11,20,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
        .v4-pg-header { padding: 20px 20px 0; flex-shrink: 0; }
        .v4-pg-paths { padding: 16px; background: rgba(255,255,255,0.01); border-radius: 16px; width: 100%; text-align: center; }
        .v4-pg-pill { padding: 5px 12px; border-radius: 20px; font-size: 9px; font-weight: 950; }
        .v4-pg-pill.bull { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .v4-pg-pill.bear { background: rgba(255,77,77,0.08); color: #ff4d4d; border: 1px solid rgba(255,77,77,0.15); }
      `}</style>
    </div>
  );
}
