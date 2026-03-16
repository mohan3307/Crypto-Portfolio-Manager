import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency, formatPercent } from '../../utils/format';

export default function MarketPulse() {
  const { listings, prices } = useMarket();

  const majorPairs = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
  const data = listings.filter(c => majorPairs.includes(c.symbol))
    .sort((a, b) => majorPairs.indexOf(a.symbol) - majorPairs.indexOf(b.symbol));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
      {data.map(coin => {
        const up = (coin.change24h >= 0);
        const color = up ? 'var(--green)' : 'var(--red)';
        
        return (
          <div key={coin.symbol} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: '0.2s',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={coin.logo} width={18} height={18} alt={coin.symbol} style={{ borderRadius: '50%' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#eef2fa' }}>{coin.symbol}/USDT</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}15`, padding: '2px 6px', borderRadius: 4 }}>
                {up ? '↑' : '↓'} {coin.change24h.toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Space Mono', color: '#fff', letterSpacing: '-0.5px' }}>
              {formatCurrency(prices[coin.symbol] || coin.price)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
