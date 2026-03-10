import React, { useRef, useEffect } from 'react';
import { formatCurrency } from '../../utils/format';

export default function TickerTape({ listings = [] }) {
  const trackRef = useRef(null);

  // Use up to ALL listings for full 120+ coin ticker, then duplicate for seamless loop
  const coins = listings.length > 0 ? listings : [];
  const items  = coins.length > 0 ? [...coins, ...coins] : [];

  // Calculate animation duration based on number of coins (more coins = longer scroll)
  const duration = Math.max(40, Math.min(120, coins.length * 1.2));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.animationDuration = `${duration}s`;
  }, [duration]);

  if (!items.length) return null;

  return (
    <div style={{
      background: 'var(--bg-void,#04070d)',
      borderBottom: '1px solid var(--border,#1a2840)',
      overflow: 'hidden', padding: '7px 0',
      position: 'relative', flexShrink: 0,
      width: '100%', boxSizing: 'border-box',
    }}>
      {/* Fade edges */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:80, zIndex:2, background:'linear-gradient(90deg, var(--bg-primary,#060b14), transparent)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:80, zIndex:2, background:'linear-gradient(-90deg, var(--bg-primary,#060b14), transparent)', pointerEvents:'none' }} />

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          animation: `tickerScroll ${duration}s linear infinite`,
          width: 'max-content',
          willChange: 'transform',
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
      >
        {items.map((coin, i) => {
          const up = (coin.change24h || 0) >= 0;
          return (
            <div key={`${coin.id}-${i}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 18px',
              borderRight: '1px solid rgba(255,255,255,0.04)',
              cursor: 'default',
              whiteSpace: 'nowrap',
            }}>
              <img
                src={coin.logo}
                alt={coin.symbol}
                width={16} height={16}
                style={{ borderRadius:'50%', flexShrink:0 }}
                onError={e => e.target.style.display = 'none'}
              />
              <span style={{ fontSize:11, fontWeight:700, color:'#7b94b8', fontFamily:'JetBrains Mono,monospace', letterSpacing:'0.5px' }}>
                {coin.symbol}
              </span>
              <span style={{ fontSize:11, color:'#eef2fa', fontFamily:'JetBrains Mono,monospace' }}>
                {formatCurrency(coin.price)}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                fontFamily: 'JetBrains Mono,monospace',
                color: up ? '#00e5b3' : '#f03e55',
                background: up ? 'rgba(0,229,179,0.08)' : 'rgba(240,62,85,0.08)',
                padding: '1px 5px', borderRadius: 4,
              }}>
                {up ? '▲' : '▼'} {Math.abs(coin.change24h || 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
