import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function PredictiveGlance() {
  const { socket } = useMarket();
  const [prediction, setPrediction] = useState({ 
    coin: 'BTC', target: '100k', probability: 72, timeframe: 'April 2026' 
  });

  useEffect(() => {
    if (!socket) return;
    socket.on('futurePredictionUpdate', (data) => setPrediction(data));
    return () => socket.off('futurePredictionUpdate');
  }, [socket]);

  return (
    <div className="card glass-heavy" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>🔮</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#eef2fa', letterSpacing: -0.2 }}>Future Occurrence</div>
          <div style={{ fontSize: 10, color: '#4a5e78' }}>AI Probability Simulation</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 15 }}>
        <div style={{ position: 'relative' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--blue)" strokeWidth="6" 
              strokeDasharray="283" strokeDashoffset={283 - (prediction.probability / 100 * 283)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{prediction.probability}%</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#eef2fa', marginBottom: 4 }}>
            {prediction.coin} Target: <span style={{ color: 'var(--blue)' }}>${prediction.target}</span>
          </div>
          <p style={{ color: '#4a5e78', fontSize: 10, margin: 0 }}>Probability of hitting target by {prediction.timeframe}</p>
        </div>
      </div>

      <div style={{ marginTop: 15, borderTop: '1px solid rgba(255,255,255,0.05)', pt: 12, textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: '#8899b4', fontStyle: 'italic' }}>Simulated via 50,000 algorithmic paths</span>
      </div>
    </div>
  );
}
