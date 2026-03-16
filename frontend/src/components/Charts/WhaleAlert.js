import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function WhaleAlert() {
  const { whaleAlerts } = useMarket();
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (whaleAlerts.length > 0) {
      setCurrent(whaleAlerts[0]);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [whaleAlerts]);

  if (!current || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      background: 'rgba(10, 17, 32, 0.95)',
      border: '1px solid #f5a623',
      borderRadius: 12,
      padding: '16px 20px',
      zIndex: 10000,
      width: 300,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.5s ease-out',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>🐋</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#f5a623', letterSpacing: 1 }}>WHALE ALERT</div>
        <button onClick={() => setVisible(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3d5470', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>
      <div style={{ fontSize: 14, color: '#eef2fa', fontWeight: 600, lineHeight: 1.4 }}>
        <span style={{ color: '#00e5b3' }}>{current.amount} {current.symbol}</span> (${current.value}) 
        transferred from {current.from} to {current.to}
      </div>
      <div style={{ fontSize: 10, color: '#3d5470', marginTop: 8, fontFamily: 'Space Mono' }}>
        {current.time} · Tracked on-chain
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
