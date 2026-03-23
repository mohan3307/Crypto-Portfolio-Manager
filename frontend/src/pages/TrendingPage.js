import React, { useState, useEffect } from 'react';
import { getTrending, getChartData, getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import LiveTradingChart from '../components/Charts/LiveTradingChart';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import GlobalStats from '../components/Dashboard/GlobalStats';

const SECTIONS = {
  gainers: { label: 'Top Gainers', color: '#16c784', icon: '📈' },
  losers: { label: 'Top Losers', color: '#ea3943', icon: '📉' },
  traded: { label: 'Most Traded', color: '#3861fb', icon: '🔥' },
};

function TrendingRow({ coin, rank, sectionColor }) {
  const [expanded, setExpanded] = useState(false);
  const [prices, setPrices] = useState([]);
  const isUp = coin.change24h >= 0;

  useEffect(() => {
    if (expanded && prices.length === 0) {
      getChartData(coin.symbol, '7d').then(res => setPrices(res.data.data.map(d => d.price))).catch(() => {});
    }
  }, [expanded, coin.symbol, prices.length]);

  return (
    <>
      <tr className="v4-row" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>
        <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{rank}</td>
        <td style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={coin.logo} width={24} height={24} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{coin.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{coin.symbol}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: 14 }}>{formatCurrency(coin.price)}</td>
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <div style={{ color: isUp ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 13, fontWeight: 800 }}>
             {isUp ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
          </div>
        </td>
        <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{formatCurrency(coin.volume24h)}</td>
        <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{formatCurrency(coin.marketCap)}</td>
        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-dim)', fontSize: 11 }}>{expanded ? 'Collapse' : 'Analyze'}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan="7" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
               <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: 12, border: '1px solid var(--cmc-border)' }}>
                  <LiveTradingChart symbol={coin.symbol} coinName={coin.name} color={sectionColor} />
               </div>
               <AIPredictionPanel coin={coin} prices={prices} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function TrendingPage() {
  const [trending, setTrending] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gainers');

  const fetchAll = async () => {
    try {
      const [t, l] = await Promise.all([getTrending(), getListings()]);
      setTrending(t.data);
      setListings(l.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const i = setInterval(fetchAll, 30000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  const currentData = trending?.[activeTab === 'gainers' ? 'topGainers' : activeTab === 'losers' ? 'topLosers' : 'mostTraded'] || [];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>MARKET_MOMENTUM</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Momentum Radar</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(SECTIONS).map(([key, s]) => (
            <button key={key} onClick={() => setActiveTab(key)} 
              style={{ 
                 background: activeTab === key ? 'var(--cmc-blue)' : 'var(--bg-card)', 
                 color: '#fff',
                 border: `1px solid ${activeTab === key ? 'var(--cmc-blue)' : 'var(--cmc-border)'}`,
                 padding: '10px 24px', fontSize: 13, fontWeight: 800, borderRadius: 12, cursor: 'pointer'
              }}>{s.label}</button>
          ))}
        </div>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
              <th style={{ padding: '16px 0', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Price</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h %</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h Volume</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Market Cap</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((coin, i) => (
              <TrendingRow key={coin.symbol} coin={coin} rank={i + 1} sectionColor={SECTIONS[activeTab].color} />
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--cmc-border); }
      `}</style>
    </div>
  );
}
