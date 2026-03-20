import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function LiquidationMap() {
  const { socket } = useMarket();
  const [liquidations, setLiquidations] = useState([]);
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    if (!socket) return;
    socket.on('liquidationUpdate', (data) => {
      setLiquidations(prev => [data, ...prev].slice(0, 20));
      bubblesRef.current.push({
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.sqrt(data.amount) / 20 + 5,
        color: data.side === 'long' ? '#ff4d4d' : '#10b981',
        life: 1.0,
        symbol: data.symbol,
        amount: data.amount,
      });
    });
    return () => socket.off('liquidationUpdate');
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (i / 4) * canvas.height;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const x = (i / 7) * canvas.width;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }

      bubblesRef.current = bubblesRef.current.filter(b => b.life > 0);
      bubblesRef.current.forEach(b => {
        b.life -= 0.004;
        b.size += 0.25;
        const alpha = Math.floor(b.life * 220);
        const alphaHex = alpha.toString(16).padStart(2, '0');

        // Outer glow
        const grd = ctx.createRadialGradient(
          (b.x / 100) * canvas.width, (b.y / 100) * canvas.height, 0,
          (b.x / 100) * canvas.width, (b.y / 100) * canvas.height, b.size * 2
        );
        grd.addColorStop(0, b.color + alphaHex);
        grd.addColorStop(1, b.color + '00');
        ctx.beginPath();
        ctx.arc((b.x / 100) * canvas.width, (b.y / 100) * canvas.height, b.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core bubble
        ctx.beginPath();
        ctx.arc((b.x / 100) * canvas.width, (b.y / 100) * canvas.height, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.color + alphaHex;
        ctx.fill();

        if (b.life > 0.4) {
          ctx.fillStyle = '#ffffffcc';
          ctx.font = 'bold 9px Space Mono';
          ctx.textAlign = 'center';
          ctx.fillText(b.symbol, (b.x / 100) * canvas.width, (b.y / 100) * canvas.height + 3);
        }
      });
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="v4-liq-map">
      <div className="v4-liq-header">
        <div>
          <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>REAL_TIME_STREAM</div>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>LIQUIDATION_HEATMAP</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="v4-legend-item red"><span />LONG_LIQ</div>
          <div className="v4-legend-item green"><span />SHORT_LIQ</div>
          <div className="v4-live-badg">● LIVE</div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: '0 0 28px 28px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={800} height={280} style={{ width: '100%', height: '100%', display: 'block' }} />
        
        {/* Scrolling event feed */}
        <div className="v4-liq-feed">
          <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 2, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>EVENT_STREAM</div>
          {liquidations.length === 0 ? (
            <div style={{ fontSize: 9, color: '#4a5e78', textAlign: 'center', marginTop: 20 }}>AWAITING_SIGNAL...</div>
          ) : liquidations.map((liq, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: 9, fontWeight: 950, fontFamily: 'Space Mono' }}>
              <span style={{ color: liq.side === 'long' ? '#ff4d4d' : '#10b981' }}>{liq.symbol}</span>
              <span style={{ color: '#4a5e78' }}>${(liq.amount / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .v4-liq-map { background: rgba(7, 11, 20, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; display: flex; flex-direction: column; height: 360px; overflow: hidden; }
        .v4-liq-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: space-between; }
        .v4-legend-item { display: flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 950; }
        .v4-legend-item.red { color: #ff4d4d; }
        .v4-legend-item.red span { width: 7px; height: 7px; background: #ff4d4d; border-radius: 50%; box-shadow: 0 0 8px #ff4d4d; }
        .v4-legend-item.green { color: #10b981; }
        .v4-legend-item.green span { width: 7px; height: 7px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        .v4-live-badg { font-size: 9px; font-weight: 950; color: #10b981; padding: 4px 10px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; }
        .v4-liq-feed { position: absolute; top: 10px; right: 10px; bottom: 10px; width: 140px; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); border-radius: 16px; padding: 14px; border: 1px solid rgba(255,255,255,0.04); overflow: hidden; }
      `}</style>
    </div>
  );
}
