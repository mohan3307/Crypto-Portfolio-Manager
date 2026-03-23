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
    <div className="glass-heavy whale-alert-toast" style={{
      position: 'fixed',
      bottom: 30,
      left: 30,
      background: 'rgba(10, 15, 28, 0.85)',
      border: '1px solid rgba(245, 166, 35, 0.4)',
      borderRadius: 20,
      padding: '20px 24px',
      zIndex: 100000,
      width: 360,
      boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(245, 166, 35, 0.05)',
      animation: 'whaleSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      backdropFilter: 'blur(30px) saturate(210%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 166, 35, 0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(245, 166, 35, 0.2)' 
        }}>🐋</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, color: '#f5a623', letterSpacing: 1.5, textTransform: 'uppercase' }}>ON-CHAIN_VECTOR</div>
          <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 900 }}>WHALE_DETECTION_ACTIVE</div>
        </div>
        <button onClick={() => setVisible(false)} style={{ 
          marginLeft: 'auto', background: 'rgba(255,255,255,0.03)', border: 'none', color: '#4a5e78', 
          cursor: 'pointer', fontSize: 14, width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>×</button>
      </div>
      
      <div style={{ fontSize: 15, color: '#fff', fontWeight: 800, lineHeight: 1.5, letterSpacing: -0.2 }}>
        <span style={{ color: 'var(--green)' }}>{current.amount} {current.symbol}</span> 
        <span style={{ color: '#4a5e78', margin: '0 8px', fontSize: 12 }}>→</span>
        <span style={{ color: '#fff' }}>${current.value}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 16, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
         <div>
            <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900, marginBottom: 2 }}>ORIGIN</div>
            <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 800, fontFamily: 'Space Mono' }}>{(current.from || '').toUpperCase()}</div>
         </div>
         <div>
            <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900, marginBottom: 2 }}>DESTINATION</div>
            <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800, fontFamily: 'Space Mono' }}>{(current.to || '').toUpperCase()}</div>
         </div>
      </div>

      <div style={{ fontSize: 9, color: '#4a5e78', marginTop: 16, fontWeight: 900, letterSpacing: 0.5, fontFamily: 'Space Mono', display: 'flex', justifyContent: 'space-between' }}>
        <span>TIMESTAMP_REF: {current.time}</span>
        <span style={{ color: 'var(--blue)' }}>VERIFIED</span>
      </div>

      <style>{`
        @keyframes whaleSlideUp {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
