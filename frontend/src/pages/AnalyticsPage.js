import React, { useState, useEffect } from 'react';
import { getPortfolio, getChartData } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';
import { useMarket } from '../context/MarketContext';

// ─── Finance calculations ─────────────────────────────────────────────────
const returns = (prices) => prices.slice(1).map((v, i) => (v - prices[i]) / prices[i]);
const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const std = (arr) => { const m = mean(arr); return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length); };

const sharpeRatio = (rets, rf = 0.05 / 252) => {
  const excess = rets.map(r => r - rf);
  const m = mean(excess), s = std(excess);
  return s === 0 ? 0 : (m / s) * Math.sqrt(252);
};

const maxDrawdown = (prices) => {
  let peak = prices[0], maxDD = 0;
  prices.forEach(p => {
    if (p > peak) peak = p;
    const dd = (peak - p) / peak;
    if (dd > maxDD) maxDD = dd;
  });
  return maxDD * 100;
};

const beta = (assetRets, marketRets) => {
  const n = Math.min(assetRets.length, marketRets.length);
  const a = assetRets.slice(-n), m = marketRets.slice(-n);
  const ma = mean(a), mm = mean(m);
  const cov = a.reduce((s, v, i) => s + (v - ma) * (m[i] - mm), 0) / n;
  const varM = m.reduce((s, v) => s + (v - mm) ** 2, 0) / n;
  return varM === 0 ? 1 : cov / varM;
};

const correlation = (a, b) => {
  const n = Math.min(a.length, b.length);
  const sa = a.slice(-n), sb = b.slice(-n);
  const ma = mean(sa), mb = mean(sb);
  const num = sa.reduce((s, v, i) => s + (v - ma) * (sb[i] - mb), 0);
  const den = Math.sqrt(sa.reduce((s, v) => s + (v - ma) ** 2, 0) * sb.reduce((s, v) => s + (v - mb) ** 2, 0));
  return den === 0 ? 0 : num / den;
};

function MetricTile({ label, val, sub, status }) {
  const color = status === 'good' ? 'var(--cmc-green)' : status === 'bad' ? 'var(--cmc-red)' : '#fff';
  return (
    <div className="card-cmc" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

function CorrelationMap({ matrix, symbols }) {
  const colorFor = (v) => {
    const abs = Math.abs(v);
    if (v === 1) return 'rgba(56, 97, 251, 0.05)';
    if (v > 0.6) return `rgba(234, 57, 67, ${abs * 0.4})`;
    if (v < -0.6) return `rgba(22, 199, 132, ${abs * 0.4})`;
    return `rgba(128, 138, 157, 0.1)`;
  };

  return (
    <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: 16, borderBottom: '1px solid var(--cmc-border)' }} />
            {symbols.map(s => <th key={s} style={{ padding: 16, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--cmc-border)' }}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={symbols[i]} style={{ borderBottom: '1px solid var(--cmc-border)' }}>
              <td style={{ padding: 16, fontSize: 12, color: '#fff', fontWeight: 800, borderRight: '1px solid var(--cmc-border)' }}>{symbols[i]}</td>
              {row.map((val, j) => (
                <td key={j} style={{ 
                  padding: 16, textAlign: 'center', background: colorFor(val), 
                  fontSize: 13, fontWeight: 700, color: i === j ? 'var(--cmc-blue)' : '#fff'
                }}>
                  {val.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsPage() {
  const { listings } = useMarket();
  const [portfolio, setPortfolio] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [corrMatrix, setCorrMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Risk');

  useEffect(() => {
    const init = async () => {
      try {
        const pRes = await getPortfolio();
        const p = pRes.data;
        setPortfolio(p);

        const topAssets = p.items.slice(0, 8);
        const [btcRes, ...coinRes] = await Promise.all([
          getChartData('BTC', '30d'),
          ...topAssets.map(item => getChartData(item.symbol, '30d'))
        ]);

        const btcRets = returns(btcRes.data.data.map(d => d.price));
        const history = {};
        topAssets.forEach((item, i) => {
          if (coinRes[i]) history[item.symbol] = coinRes[i].data.data.map(d => d.price);
        });

        const m = {};
        Object.entries(history).forEach(([sym, prices]) => {
          if (prices.length < 10) return;
          const rets = returns(prices);
          m[sym] = {
            sharpe: sharpeRatio(rets).toFixed(2),
            maxDD: maxDrawdown(prices).toFixed(2),
            beta: beta(rets, btcRets).toFixed(2),
          };
        });
        setMetrics(m);

        const syms = Object.keys(history);
        const matrix = syms.map(sa => syms.map(sb => {
          return parseFloat(correlation(returns(history[sa]), returns(history[sb])).toFixed(2));
        }));
        setCorrMatrix(matrix);
        setLoading(false);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  const { items = [] } = portfolio || {};
  const symbols = Object.keys(metrics);
  const totalVal = items.reduce((s, i) => s + i.currentValue, 0) || 1;

  let portSharpe = 0, portDD = 0, portBeta = 0;
  symbols.forEach(sym => {
    const item = items.find(i => i.symbol === sym);
    if (!item) return;
    const w = item.currentValue / totalVal;
    portSharpe += parseFloat(metrics[sym].sharpe) * w;
    portDD = Math.max(portDD, parseFloat(metrics[sym].maxDD));
    portBeta += parseFloat(metrics[sym].beta) * w;
  });

  const healthScore = Math.min(100, Math.round(70 + (portSharpe * 10) - (portDD / 2)));

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PORTFOLIO INTELLIGENCE</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Advanced Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Risk', 'Correlation', 'Allocation'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
               style={{ 
                 background: activeTab === t ? 'var(--cmc-blue)' : 'var(--bg-card)', 
                 color: '#fff',
                 border: `1px solid ${activeTab === t ? 'var(--cmc-blue)' : 'var(--cmc-border)'}`,
                 padding: '10px 24px', fontSize: 13, fontWeight: 800, borderRadius: 12, cursor: 'pointer'
               }}>{t}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, marginBottom: 40 }}>
        <div className="card-cmc" style={{ padding: 40, textAlign: 'center' }}>
           <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
              <svg width="140" height="140" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cmc-blue)" strokeWidth="8" strokeDasharray={`${healthScore * 2.8} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="55" fontSize="24" fontWeight="900" fill="#fff" textAnchor="middle">{healthScore}%</text>
              </svg>
           </div>
           <div style={{ fontSize: 18, fontWeight: 900, color: healthScore > 75 ? 'var(--cmc-green)' : 'var(--cmc-red)', marginBottom: 8 }}>
             {healthScore > 85 ? 'Optimized' : healthScore > 70 ? 'Stable' : 'High Risk'}
           </div>
           <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Portfolio health is calculated based on risk-adjusted returns and volatility.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <MetricTile label="Weighted Sharpe Ratio" val={portSharpe.toFixed(2)} sub="Performance efficiency" status={portSharpe > 1.2 ? 'good' : 'neutral'} />
          <MetricTile label="Portfolio Beta" val={portBeta.toFixed(2)} sub="Market sensitivity" status={portBeta < 1.1 ? 'good' : 'bad'} />
          <MetricTile label="Maximum Drawdown" val={`-${portDD.toFixed(1)}%`} sub="Peak-to-trough decline" status={portDD < 15 ? 'good' : 'bad'} />
          <MetricTile label="Asset Concentration" val={items.length} sub="Unique market nodes" />
        </div>
      </div>

      <div className="card-cmc" style={{ minHeight: 400, padding: 32 }}>
        {activeTab === 'Correlation' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Asset Correlation Matrix</div>
            <CorrelationMap matrix={corrMatrix} symbols={symbols} />
          </div>
        )}
        {activeTab === 'Risk' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {items.slice(0, 10).map(item => (
                 <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--cmc-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={item.logo} width={24} height={24} style={{ borderRadius: '50%' }} alt="" />
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{item.symbol}</span>
                    </div>
                    <div style={{ color: 'var(--cmc-red)', fontWeight: 800, fontSize: 14 }}>{metrics[item.symbol]?.maxDD || '0.0'}% DD</div>
                 </div>
               ))}
            </div>
            <div className="card-cmc" style={{ padding: 24, background: 'var(--bg-input)' }}>
               <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cmc-blue)', marginBottom: 16 }}>Market Advisory</div>
               <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.8, fontWeight: 700 }}>
                 {symbols.length > 1 ? (
                   <>Diversification levels are {healthScore > 80 ? 'optimal' : 'sub-optimal'}. Consider increasing exposure to uncorrelated assets to reduce systemic beta.</>
                 ) : "Not enough data for advisory scan."}
               </div>
            </div>
          </div>
        )}
        {activeTab === 'Allocation' && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
             {items.map(item => (
               <div key={item.symbol} className="card-cmc" style={{ padding: 20, background: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                     <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{item.symbol}</span>
                     <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--cmc-blue)' }}>{((item.currentValue / totalVal) * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                     <div style={{ width: `${(item.currentValue / totalVal) * 100}%`, height: '100%', background: 'var(--cmc-blue)' }} />
                  </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
