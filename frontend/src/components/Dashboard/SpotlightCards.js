import React from 'react';

const SpotlightItem = ({ rank, name, symbol, change, logo }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-glow)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {rank && <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 14 }}>{rank}</span>}
      <img src={logo} width={20} height={20} alt={name} style={{ borderRadius: '50%', background: '#fff' }} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>{symbol}</span>
      </div>
    </div>
    <span style={{ 
      color: change >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', 
      fontSize: 12, 
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
    </span>
  </div>
);

const SpotlightCard = ({ title, items, icon }) => (
  <div className="card-cmc" style={{ flex: 1, minWidth: 320, padding: '16px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span> {title}
      </h3>
      <button style={{ fontSize: 11, color: 'var(--cmc-blue)', fontWeight: 700 }}>More &gt;</button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, idx) => (
        <SpotlightItem key={idx} {...item} rank={idx + 1} />
      ))}
    </div>
  </div>
);

export default function SpotlightCards({ trending = [], gainers = [] }) {
  const recentlyAdded = [
    { name: 'SUI', symbol: 'SUI', change: 12.4, logo: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png' },
    { name: 'Aptos', symbol: 'APT', change: -2.1, logo: 'https://assets.coingecko.com/coins/images/26455/standard/aptos_round.png' },
    { name: 'Arbitrum', symbol: 'ARB', change: 5.6, logo: 'https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg' }
  ];

  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
      <SpotlightCard title="Trending" icon="🔥" items={trending.slice(0, 3)} />
      <SpotlightCard title="Top Gainers" icon="📈" items={gainers.slice(0, 3)} />
      <SpotlightCard title="Recently Added" icon="🕙" items={recentlyAdded} />
    </div>
  );
}
