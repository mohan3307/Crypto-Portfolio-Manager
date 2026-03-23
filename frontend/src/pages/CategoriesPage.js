import React, { useState, useEffect } from 'react';
import { getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

const CATEGORIES = [
  { rank: 1, name: 'Memes', mcap: 62453219800, change24h: 12.5, topCoins: ['DOGE', 'SHIB', 'PEPE'] },
  { rank: 2, name: 'Solana Ecosystem', mcap: 145321900000, change24h: 8.6, topCoins: ['SOL', 'JUP', 'WIF'] },
  { rank: 3, name: 'AI & Big Data', mcap: 32198700000, change24h: 5.4, topCoins: ['FET', 'RENDER', 'GRT'] },
  { rank: 4, name: 'DeFi', mcap: 87654000000, change24h: -2.2, topCoins: ['UNI', 'LINK', 'AAVE'] },
  { rank: 5, name: 'Gaming', mcap: 18765400000, change24h: 4.1, topCoins: ['IMX', 'BEAM', 'GALA'] },
  { rank: 6, name: 'Layer 1', mcap: 1219870000000, change24h: 1.8, topCoins: ['BTC', 'ETH', 'SOL'] },
  { rank: 7, name: 'Layer 2', mcap: 24532190000, change24h: 3.2, topCoins: ['ARB', 'OP', 'MATIC'] },
];

export default function CategoriesPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings().then(res => setListings(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>ECOSYSTEM_SEGMENTATION</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Top Crypto Categories</h1>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Category</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Market Cap</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h %</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Top Gainers</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => (
              <tr key={cat.name} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700 }}>{cat.rank}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{cat.name}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{formatCurrency(cat.mcap)}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                   <div style={{ color: cat.change24h >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontWeight: 800, fontSize: 14 }}>
                      {cat.change24h >= 0 ? '▲' : '▼'} {Math.abs(cat.change24h).toFixed(2)}%
                   </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                     {cat.topCoins.map(sym => (
                       <span key={sym} style={{ padding: '4px 10px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{sym}</span>
                     ))}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
      `}</style>
    </div>
  );
}
