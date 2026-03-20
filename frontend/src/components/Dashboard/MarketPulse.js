import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency } from '../../utils/format';

export default function MarketPulse() {
  const { listings, prices } = useMarket();

  const majorPairs = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
  const data = listings
    .filter(c => majorPairs.includes(c.symbol))
    .sort((a, b) => majorPairs.indexOf(a.symbol) - majorPairs.indexOf(b.symbol));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
      {data.map(coin => {
        const up = coin.change24h >= 0;
        const color = up ? '#10b981' : '#ff4d4d';
        const currentPrice = prices[coin.symbol] || coin.price;
        return (
          <div key={coin.symbol} className="v4-pulse-card">
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}60, transparent)` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="v4-coin-img-wrap">
                  <img src={coin.logo} width={20} height={20} alt={coin.symbol} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 950, color: '#fff', letterSpacing: 0.5 }}>{coin.symbol}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 950, color, display: 'flex', alignItems: 'center', gap: 3, background: `${color}10`, padding: '3px 8px', borderRadius: 8 }}>
                <span>{up ? '▲' : '▼'}</span>
                {Math.abs(coin.change24h).toFixed(2)}%
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 950, fontFamily: 'Space Mono', color: '#fff', letterSpacing: -1 }}>
              {formatCurrency(currentPrice)}
            </div>

            <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.abs(coin.change24h) * 10)}%`, background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}` }} />
            </div>
          </div>
        );
      })}

      <style>{`
        .v4-pulse-card {
          background: rgba(7, 11, 20, 0.6);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 20px;
          padding: 18px 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .v4-pulse-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59, 130, 246, 0.25);
          background: rgba(7, 11, 20, 0.9);
          box-shadow: 0 14px 40px rgba(0,0,0,0.5);
        }
        .v4-coin-img-wrap {
          width: 28px; height: 28px;
          background: #fff;
          padding: 2px;
          border-radius: 50%;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
      `}</style>
    </div>
  );
}
