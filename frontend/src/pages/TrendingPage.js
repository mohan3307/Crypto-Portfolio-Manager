import React, { useState, useEffect } from 'react';
import { getTrending, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';
import LiveTradingChart from '../components/Charts/LiveTradingChart';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';

const COIN_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f0b90b',
  XRP: '#346aa9', DOGE: '#a78bfa', PEPE: '#00cc00', WIF: '#d1d5db'
};

function TrendingCoinCard({ coin, rank, sectionColor }) {
  const [prices, setPrices] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      getChartData(coin.symbol, '7d').then(res => setPrices(res.data.data.map(d => d.price))).catch(() => {});
    }
  }, [expanded, coin.symbol]);

  const color = COIN_COLORS[coin.symbol] || sectionColor;
  const isUp = coin.change24h >= 0;

  return (
    <div className="card" style={{ border: '2px solid var(--border)', background: '#080808', cursor: 'pointer', transition: '0.1s' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 32, height: 32, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{rank.toString().padStart(2, '0')}</div>
        <img src={coin.logo} alt={coin.symbol} width={34} height={34} style={{ borderRadius: '2px', background: '#fff' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: -0.5 }}>{coin.name.toUpperCase()}</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{coin.symbol}/USDT</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 18, color: '#fff' }}>{formatCurrency(coin.price)}</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: isUp ? 'var(--green)' : 'var(--red)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {isUp ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)', marginLeft: 16 }}>{expanded ? '▲' : '▼'}</div>
      </div>


      {expanded ? (
        <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#000', padding: '24px', border: '2px solid var(--border)' }}>
            <LiveTradingChart symbol={coin.symbol} coinName={coin.name} color={color} />
          </div>
          <AIPredictionPanel coin={coin} prices={prices} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#050505', borderTop: '2px solid var(--border)' }}>
          {[
            { label: 'MARKET_CAP', value: formatCurrency(coin.marketCap) },
            { label: '24H_VOLUME', value: formatCurrency(coin.volume24h) },
            { label: '24H_CHANGE', value: formatPercent(coin.change24h), color: isUp ? 'var(--green)' : 'var(--red)' },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ padding: '12px 24px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1.5 }}>{label}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 900, marginTop: 4, color: c || '#fff' }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SECTIONS = {
  gainers: { label: 'TOP_GAINERS', color: '#10b981', icon: '📈' },
  losers: { label: 'TOP_LOSERS', color: '#ff4d4d', icon: '📉' },
  traded: { label: 'MOST_TRADED', color: '#3b82f6', icon: '🔥' },
};

export default function TrendingPage() {
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gainers');

  useEffect(() => {
    getTrending().then(res => { setTrending(res.data); setLoading(false); }).catch(() => setLoading(false));
    const i = setInterval(() => getTrending().then(res => setTrending(res.data)).catch(() => {}), 30000);
    return () => clearInterval(i);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div style={{ width: 44, height: 44, border: '4px solid var(--border)', borderTopColor: '#fff', borderRadius: '50%', animation: 'v4-spin 1s linear infinite' }} />
       <style>{`@keyframes v4-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const coinData = { gainers: trending?.topGainers, losers: trending?.topLosers, traded: trending?.mostTraded };
  const currentSection = SECTIONS[activeTab];
  const currentData = coinData[activeTab] || [];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>MARKET_MOMENTUM_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>MOMENTUM_RADAR_SCAN</h1>
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
          {Object.entries(SECTIONS).map(([key, s]) => (
            <button key={key} onClick={() => setActiveTab(key)} 
              style={{ 
                background: activeTab === key ? '#fff' : '#000', 
                color: activeTab === key ? '#000' : 'var(--text-dim)',
                border: '2px solid var(--border)',
                padding: '10px 20px', fontSize: 9, fontWeight: 900, letterSpacing: 2
              }}>{s.label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {currentData.map((coin, i) => (
          <TrendingCoinCard key={coin.id || coin.symbol} coin={coin} rank={i + 1} sectionColor={currentSection.color} />
        ))}
      </div>

      <style>{`
        .card:hover { border-color: #fff !important; z-index: 10; }
      `}</style>
    </div>
  );
}
