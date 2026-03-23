import React, { useState, useEffect } from 'react';
import { getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

export default function GainersLosersPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings().then(res => setListings(res.data.data)).finally(() => setLoading(false));
  }, []);

  const gainers = [...listings].sort((a,b) => b.change24h - a.change24h).slice(0, 10);
  const losers = [...listings].sort((a,b) => a.change24h - b.change24h).slice(0, 10);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  const Table = ({ title, data, cls }) => (
    <div className="card-cmc" style={{ flex: 1, minWidth: 400, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--cmc-border)', fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
            <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Name</th>
            <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Price</th>
            <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, idx) => (
            <tr key={c.symbol} style={{ borderBottom: '1px solid var(--cmc-border)' }} className="v4-row">
              <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={c.logo} width={24} height={24} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{c.symbol}</span>
                </div>
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>{formatCurrency(c.price)}</td>
              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                 <div style={{ color: cls === 'green' ? 'var(--cmc-green)' : 'var(--cmc-red)', fontWeight: 900, fontSize: 14 }}>{c.change24h >= 0 ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>VOLATILITY_SURVEILLANCE</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Top Gainers & Losers</h1>
      </header>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <Table title="Top Gainers (24h)" data={gainers} cls="green" />
        <Table title="Top Losers (24h)" data={losers} cls="red" />
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
      `}</style>
    </div>
  );
}
