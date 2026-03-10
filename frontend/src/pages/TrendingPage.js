import React, { useState, useEffect } from 'react';
import { getTrending, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';
import LiveTradingChart from '../components/Charts/LiveTradingChart';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';

const COIN_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f0b90b',
  XRP: '#346aa9', DOGE: '#c2a633', ADA: '#0033ad', AVAX: '#e84142',
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
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color + '20', border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono', fontSize: '11px', color, fontWeight: 700, flexShrink: 0 }}>
          #{rank}
        </div>
        <img src={coin.logo} alt={coin.symbol} width="34" height="34" style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{coin.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{coin.symbol}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: '14px' }}>{formatCurrency(coin.price)}</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: isUp ? '#00d4aa' : '#ff4757', marginTop: '2px' }}>
            {isUp ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '4px' }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <LiveTradingChart symbol={coin.symbol} coinName={coin.name} color={color} />
          <AIPredictionPanel coin={coin} prices={prices} />
        </div>
      )}

      {!expanded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Market Cap', value: formatCurrency(coin.marketCap) },
            { label: '24h Volume', value: formatCurrency(coin.volume24h) },
            { label: '24h Change', value: formatPercent(coin.change24h), color: isUp ? '#00d4aa' : '#ff4757' },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ padding: '10px 14px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              <div style={{ fontSize: '12px', fontFamily: 'Space Mono', fontWeight: 600, marginTop: '2px', color: c || 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SECTIONS = {
  gainers: { label: '🟢 Top Gainers', color: '#00d4aa' },
  losers: { label: '🔴 Top Losers', color: '#ff4757' },
  traded: { label: '🔥 Most Traded', color: '#3b82f6' },
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

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const coinData = { gainers: trending?.topGainers, losers: trending?.topLosers, traded: trending?.mostTraded };
  const currentSection = SECTIONS[activeTab];
  const currentData = coinData[activeTab] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Trending</div>
          <div className="page-subtitle">Click any coin to expand live chart + AI prediction analysis</div>
        </div>
      </div>

      <div className="tabs">
        {Object.entries(SECTIONS).map(([key, s]) => (
          <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentData.map((coin, i) => (
          <TrendingCoinCard key={coin.id || coin.symbol} coin={coin} rank={i + 1} sectionColor={currentSection.color} />
        ))}
      </div>
    </div>
  );
}
