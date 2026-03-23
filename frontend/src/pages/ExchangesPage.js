import React, { useState, useEffect } from 'react';
import { getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

const EXCHANGES = [
  { rank: 1, name: 'Binance', score: 9.9, volume24h: 12453219800, liquidity: 854, weeklyVisits: 14200000, markets: 1420, coins: 382, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png' },
  { rank: 2, name: 'Coinbase Exchange', score: 8.6, volume24h: 2453219000, liquidity: 720, weeklyVisits: 2100000, markets: 532, coins: 240, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png' },
  { rank: 3, name: 'Bybit', score: 7.4, volume24h: 4219870000, liquidity: 680, weeklyVisits: 3400000, markets: 820, coins: 410, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png' },
  { rank: 4, name: 'OKX', score: 7.2, volume24h: 3876540000, liquidity: 640, weeklyVisits: 2800000, markets: 740, coins: 350, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png' },
  { rank: 5, name: 'Kraken', score: 7.1, volume24h: 876540000, liquidity: 630, weeklyVisits: 1200000, markets: 620, coins: 210, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png' },
  { rank: 6, name: 'KuCoin', score: 6.8, volume24h: 1219870000, liquidity: 590, weeklyVisits: 1800000, markets: 1100, coins: 740, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png' },
  { rank: 7, name: 'Gate.io', score: 6.5, volume24h: 987654000, liquidity: 550, weeklyVisits: 1500000, markets: 2400, coins: 1600, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/302.png' },
  { rank: 8, name: 'Bitstamp', score: 6.4, volume24h: 219876000, liquidity: 540, weeklyVisits: 450000, markets: 180, coins: 82, logo: 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/70.png' },
];

export default function ExchangesPage() {
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
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>SPOT_EXCHANGE_INDEX</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Top Crypto Exchanges</h1>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Exchange</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Exchange Score</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h Volume</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Avg. Liquidity</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Weekly Visits</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}># Markets</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}># Coins</th>
            </tr>
          </thead>
          <tbody>
            {EXCHANGES.map((ex) => (
              <tr key={ex.name} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700 }}>{ex.rank}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={ex.logo} width={24} height={24} style={{ borderRadius: 4 }} alt="" />
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{ex.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                   <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8, background: 'var(--cmc-blue)', color: '#fff', fontWeight: 900, fontSize: 13 }}>{ex.score}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{formatCurrency(ex.volume24h)}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.liquidity}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.weeklyVisits.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.markets}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right', color: '#fff' }}>{ex.coins}</td>
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
