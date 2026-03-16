import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { getPortfolio, getTrending, getChartData } from '../services/api';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import FearGreedGauge from '../components/Charts/FearGreedGauge';
import NewsFeed from '../components/Charts/NewsFeed';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#3b82f6','#00d4aa','#f59e0b','#8b5cf6','#ff4757','#06b6d4','#10b981'];

export default function DashboardPage() {
  const { listings, prices } = useMarket();
  const [portfolio, setPortfolio] = useState(null);
  const [trending,  setTrending]  = useState(null);
  const [btcChart,  setBtcChart]  = useState([]);
  const [btcPrices, setBtcPrices] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, t, c] = await Promise.all([getPortfolio(), getTrending(), getChartData('BTC','7d')]);
        setPortfolio(p.data);
        setTrending(t.data);
        const pts = c.data.data;
        setBtcChart(pts);
        setBtcPrices(pts.map(d => d.price));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ color:'var(--text-muted)' }}>Loading dashboard...</p>
    </div>
  );

  const { summary, items } = portfolio || { summary:{ totalValue:0, totalInvested:0, totalPnL:0, totalPnLPct:0 }, items:[] };
  const sortedItems = [...items].sort((a,b) => b.currentValue - a.currentValue);

  // Allocation chart
  const allocationData = {
    labels: sortedItems.slice(0,7).map(i => i.symbol),
    datasets: [{ data: sortedItems.slice(0,7).map(i => i.currentValue), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }]
  };

  // BTC line chart
  const lineData = {
    labels: btcChart.map((d,i) => i % 12 === 0 ? new Date(d.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''),
    datasets: [{ label:'BTC Price', data: btcChart.map(d => d.price), borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.05)', fill:true, tension:0.4, pointRadius:0, borderWidth:2 }]
  };

  const chartOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false }, tooltip:{ mode:'index', intersect:false } },
    scales:{
      x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4a5e78', maxTicksLimit:6 } },
      y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4a5e78', callback: v => '$'+v.toLocaleString() } }
    }
  };

  const donutOptions = {
    responsive:true, maintainAspectRatio:false, cutout:'70%',
    plugins:{ legend:{ position:'right', labels:{ color:'#8899b4', font:{ size:12 } } } }
  };

  const topCoin = [...items].sort((a,b) => b.profitPct - a.profitPct)[0];

  // Market dominance (based on listings)
  const totalMCap = listings.reduce((s,c) => s + c.marketCap, 0) || 1;
  const btcDom  = ((listings.find(c => c.symbol==='BTC')?.marketCap || 0) / totalMCap * 100);
  const ethDom  = ((listings.find(c => c.symbol==='ETH')?.marketCap || 0) / totalMCap * 100);
  const altDom  = Math.max(0, 100 - btcDom - ethDom);

  return (
    <div>
      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">{formatCurrency(summary.totalValue)}</div>
          <div className={`stat-change ${getChangeClass(summary.totalPnLPct)}`}>{formatPercent(summary.totalPnLPct)} all time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value">{formatCurrency(summary.totalInvested)}</div>
          <div className="stat-change neutral">{items.length} assets</div>
        </div>
        <div className={`stat-card ${summary.totalPnL >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Total P / L</div>
          <div className={`stat-value ${getChangeClass(summary.totalPnL)}`}>{summary.totalPnL >= 0 ? '+' : ''}{formatCurrency(summary.totalPnL)}</div>
          <div className={`stat-change ${getChangeClass(summary.totalPnLPct)}`}>{formatPercent(summary.totalPnLPct)}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Best Performer</div>
          <div className="stat-value" style={{ fontSize:'18px' }}>{topCoin?.name || '—'}</div>
          <div className={`stat-change ${getChangeClass(topCoin?.profitPct)}`}>{topCoin ? formatPercent(topCoin.profitPct) : '—'}</div>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className="grid-2" style={{ marginBottom:'24px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">BTC/USD — 7d</span>
            <span className="badge badge-blue">Live</span>
          </div>
          <div className="chart-container"><Line data={lineData} options={chartOptions} /></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Asset Allocation</span></div>
          {items.length > 0 ? (
            <div className="chart-container"><Doughnut data={allocationData} options={donutOptions} /></div>
          ) : (
            <div className="empty-state">
              <p>Add coins to your portfolio to see allocation</p>
              <Link to="/portfolio" className="btn btn-primary btn-sm" style={{ marginTop:'12px' }}>+ Add Coins</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Fear & Greed + Market Dominance + AI Panel ──────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24, marginBottom:24 }}>
        {/* Fear & Greed */}
        <FearGreedGauge />

        {/* Market Dominance */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:18 }}>🏆</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0' }}>Market Dominance</div>
              <div style={{ fontSize:11, color:'#4a5e78' }}>Share of total market cap</div>
            </div>
          </div>
          {[
            { label:'Bitcoin', sym:'BTC', pct: btcDom, color:'#f7931a' },
            { label:'Ethereum', sym:'ETH', pct: ethDom, color:'#627eea' },
            { label:'Altcoins', sym:'ALT', pct: altDom, color:'#8b5cf6' },
          ].map(({ label, sym, pct, color }) => (
            <div key={sym} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                <span style={{ color:'#8899b4' }}>{label} <span style={{ color:'#4a5e78' }}>({sym})</span></span>
                <span style={{ color, fontWeight:700, fontFamily:'JetBrains Mono,monospace' }}>{pct.toFixed(1)}%</span>
              </div>
              <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${color}aa,${color})`, borderRadius:4, transition:'width 0.5s ease' }} />
              </div>
            </div>
          ))}

          {/* Global stats */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14, marginTop:4, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Total Market Cap', value: formatCurrency(totalMCap) },
              { label:'Active Coins', value: listings.length + '+' },
              { label:'24h Volume', value: formatCurrency(listings.reduce((s,c) => s+(c.volume24h||0), 0)) },
              { label:'BTC Price', value: formatCurrency(listings.find(c=>c.symbol==='BTC')?.price||0) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.02)', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'#4a5e78', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', fontFamily:'JetBrains Mono,monospace' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Prediction for BTC */}
        <AIPredictionPanel
          coin={trending?.topGainers?.[0] ? { ...trending.topGainers[0], name:'Bitcoin', symbol:'BTC' } : null}
          prices={btcPrices}
        />
      </div>

      {/* ── Bottom Row: Top Gainers + News ──────────────────────────────── */}
      <div className="grid-2">
        {/* Top Gainers */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔥 Top Gainers Today</span>
            <Link to="/trending" style={{ fontSize:'12px', color:'var(--accent)' }}>View all →</Link>
          </div>
          {trending?.topGainers?.slice(0,8).map((coin, i) => (
            <div className="trend-item" key={coin.id || i}>
              <span className="trend-rank">#{i+1}</span>
              <div className="coin-cell" style={{ flex:1 }}>
                <img src={coin.logo} alt={coin.symbol} className="coin-logo" onError={e => { e.target.style.display='none'; }} />
                <div>
                  <div className="coin-name">{coin.name}</div>
                  <div className="coin-symbol">{coin.symbol}</div>
                </div>
              </div>
              <div>
                <div style={{ fontFamily:'Space Mono', fontSize:'13px' }}>{formatCurrency(coin.price)}</div>
                <div className="positive" style={{ fontSize:'12px', textAlign:'right' }}>{formatPercent(coin.change24h)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Crypto News */}
        <NewsFeed />
      </div>
    </div>
  );
}
