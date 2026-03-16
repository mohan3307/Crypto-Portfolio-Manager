import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency } from '../../utils/format';

export default function LiquidationMap() {
  const { socket } = useMarket();
  const [liquidations, setLiquidations] = useState([]);
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('liquidationUpdate', (data) => {
      setLiquidations(prev => [data, ...prev].slice(0, 30));
      
      // Add to bubble simulation
      const bubble = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.sqrt(data.amount) / 20 + 5,
        color: data.side === 'long' ? '#f43f5e' : '#00d4aa', // Longs liquidated (price hit bottom) = Red, Shorts = Green
        opacity: 1,
        symbol: data.symbol,
        amount: data.amount,
        life: 1.0
      };
      bubblesRef.current.push(bubble);
    });

    return () => socket.off('liquidationUpdate');
  }, [socket]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      bubblesRef.current = bubblesRef.current.filter(b => b.life > 0);
      
      bubblesRef.current.forEach(b => {
        b.life -= 0.005;
        b.opacity = b.life;
        b.size += 0.2; // Expand over time

        ctx.beginPath();
        ctx.arc((b.x / 100) * canvas.width, (b.y / 100) * canvas.height, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.color + Math.floor(b.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Text
        if (b.opacity > 0.5) {
          ctx.fillStyle = '#ffffff' + Math.floor((b.opacity - 0.5) * 2 * 255).toString(16).padStart(2, '0');
          ctx.font = 'bold 10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(b.symbol, (b.x / 100) * canvas.width, (b.y / 100) * canvas.height + 4);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', height: 400, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Live Liquidation Map</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Global liquidations across major exchanges</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#f43f5e' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} /> Longs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#00d4aa' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4aa' }} /> Shorts
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', background: '#0a0f18' }}>
        <canvas ref={canvasRef} width={800} height={300} style={{ width: '100%', height: '100%', display: 'block' }} />
        
        {/* Overlay feed */}
        <div style={{ position: 'absolute', top: 10, right: 10, bottom: 10, width: 140, background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', overflowY: 'hidden', padding: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#4a5e78', marginBottom: 6, textTransform: 'uppercase' }}>Recent Events</div>
          {liquidations.map((liq, i) => (
            <div key={i} style={{ fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: liq.side === 'long' ? '#f43f5e' : '#00d4aa', fontWeight: 700 }}>{liq.symbol}</span>
              <span style={{ color: '#8899b4' }}>${(liq.amount / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
