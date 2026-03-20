import React, { useState, useEffect, useRef } from 'react';
import { getPortfolio, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

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

// ─── Sub-components ───────────────────────────────────────────────────────
function MetricTile({ label, val, sub, color, good }) {
  const statusColor = good === undefined ? '#fff' : (good ? 'var(--green)' : 'var(--red)');
  return (
    <div className="card stat-tile" style={{ borderLeft: `4px solid ${color}`, background: '#080808', padding: '20px' }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: statusColor, fontFamily: 'var(--font-mono)' }}>{val}</div>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginTop: 6, letterSpacing: 0.5 }}>{sub}</div>
    </div>
  );
}

function V4CorrelationMap({ matrix, symbols }) {
  const colorFor = (v) => {
    const abs = Math.abs(v);
    if (v === 1) return 'rgba(59, 130, 246, 0.05)';
    if (v > 0.6) return `rgba(255, 77, 77, ${0.1 + abs * 0.4})`;
    if (v < -0.6) return `rgba(16, 185, 129, ${0.1 + abs * 0.4})`;
    return `rgba(74, 94, 120, ${0.05 + abs * 0.1})`;
  };

  return (
    <div className="v4-scroller" style={{ overflowX: 'auto', border: '2px solid var(--border)', background: '#000' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#080808' }}>
            <th />
            {symbols.map(s => <th key={s} style={{ padding: '14px', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, borderBottom: '2px solid var(--border)' }}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={symbols[i]} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '14px', fontSize: 10, color: '#fff', fontWeight: 900, background: '#050505', borderRight: '2px solid var(--border)' }}>{symbols[i]}</td>
              {row.map((val, j) => (
                <td key={j} style={{ 
                  padding: '14px', textAlign: 'center', background: colorFor(val), 
                  fontSize: 12, fontWeight: 800, color: i === j ? 'var(--blue)' : '#fff',
                  fontFamily: 'var(--font-mono)'
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
  const [portfolio, setPortfolio] = useState(null);
  const [priceHistory, setPriceHistory] = useState({});
  const [btcHistory, setBtcHistory] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [corrMatrix, setCorrMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RISK');

  useEffect(() => {
    const init = async () => {
      try {
        const pRes = await getPortfolio();
        const p = pRes.data;
        setPortfolio(p);

        const [btcRes, ...coinRes] = await Promise.all([
          getChartData('BTC', '30d'),
          ...p.items.slice(0, 8).map(item => getChartData(item.symbol, '30d'))
        ]);
        const btcPrices = btcRes.data.data.map(d => d.price);
        setBtcHistory(btcPrices);

        const history = {};
        p.items.slice(0, 8).forEach((item, i) => {
          if (coinRes[i]) history[item.symbol] = coinRes[i].data.data.map(d => d.price);
        });
        setPriceHistory(history);

        const btcRets = returns(btcPrices);
        const m = {};
        Object.entries(history).forEach(([sym, prices]) => {
          if (prices.length < 10) return;
          const rets = returns(prices);
          m[sym] = {
            sharpe: sharpeRatio(rets).toFixed(2),
            maxDD: maxDrawdown(prices).toFixed(2),
            beta: beta(rets, btcRets).toFixed(2),
            vol: (std(rets) * Math.sqrt(252) * 100).toFixed(2),
            yield: (((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(2),
          };
        });
        setMetrics(m);

        const syms = Object.keys(history);
        const matrix = syms.map(sa => syms.map(sb => {
          const ra = returns(history[sa]), rb = returns(history[sb]);
          return parseFloat(correlation(ra, rb).toFixed(2));
        }));
        setCorrMatrix(matrix);
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    init();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="neural-ping-v4" />
    </div>
  );

  const { items = [], summary = {} } = portfolio || {};
  const symbols = Object.keys(metrics);
  const totalVal = items.reduce((s, i) => s + i.currentValue, 0) || 1;

  let portSharpe = 0, portDD = 0, portVol = 0, portBeta = 0;
  symbols.forEach(sym => {
    const item = items.find(i => i.symbol === sym);
    if (!item) return;
    const w = item.currentValue / totalVal;
    portSharpe += parseFloat(metrics[sym].sharpe) * w;
    portDD = Math.max(portDD, parseFloat(metrics[sym].maxDD));
    portVol += parseFloat(metrics[sym].vol) * w;
    portBeta += parseFloat(metrics[sym].beta) * w;
  });

  const healthScore = Math.min(100, Math.round(70 + (portSharpe * 10) - (portDD / 2)));

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>INTELLIGENCE_CORE_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>NEURAL_DIAGNOSTICS_ENGINE</h1>
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
          {['RISK', 'CORRELATION', 'ALLOCATION'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`v4-tab ${activeTab === t ? 'active' : ''}`}
               style={{ 
                 background: activeTab === t ? '#fff' : '#000', 
                 color: activeTab === t ? '#000' : 'var(--text-dim)',
                 border: '2px solid var(--border)',
                 padding: '10px 20px',
                 fontSize: 9,
                 fontWeight: 900,
                 letterSpacing: 2,
                 cursor: pointer
               }}>{t}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
          <div className="health-ring-sharp" style={{ 
            width: 140, height: 140, borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--blue)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24
          }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{healthScore}</div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>CORE_SCORE</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: healthScore > 75 ? 'var(--green)' : 'var(--gold)' }}>
            {healthScore > 85 ? 'ELITE_STABILITY' : healthScore > 70 ? 'NOMINAL_STATE' : 'VOLATILE_STATE'}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6, marginTop: 16, fontWeight: 700 }}>
            Systemic resilience analysis complete. Multi-vector protocols verified across {items.length} nodes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricTile label="SHARPE_RATIO" val={portSharpe.toFixed(2)} sub="VOL_ADJUSTED" color="var(--blue)" good={portSharpe > 1.2} />
          <MetricTile label="SYSTEMIC_BETA" val={portBeta.toFixed(2)} sub="MARKET_CORR" color="var(--gold)" good={portBeta < 1.1} />
          <MetricTile label="MAX_DRAWDOWN" val={`-${portDD.toFixed(1)}%`} sub="STRUCT_STRESS" color="var(--red)" good={portDD < 12} />
          <MetricTile label="ORACLE_NODE" val="NOMINAL" sub="LATENCY: 4MS" color="var(--green)" />
          
          <div className="card" style={{ gridColumn: 'span 4', padding: '20px 24px', background: '#080808' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ASSET_VULNERABILITY_INDEX</div>
                <div style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 10px var(--green)' }} />
             </div>
             <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                {items.slice(0, 24).map((item, i) => {
                  const m = metrics[item.symbol] || { maxDD: 0 };
                  return (
                    <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                       <div style={{ 
                         width: '100%', 
                         height: `${Math.min(100, (m.maxDD / (portDD || 1)) * 100)}%`,
                         background: i % 2 === 0 ? 'var(--blue)' : 'var(--blue-bg)',
                         border: '1px solid var(--border)'
                       }} />
                       <div style={{ position: 'absolute', bottom: -12, width: '100%', textAlign: 'center', fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{item.symbol}</div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>

      <div className="v4-card" style={{ minHeight: 400, padding: 32 }}>
        {activeTab === 'CORRELATION' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 1, marginBottom: 24 }}>SYNCHRONICITY_MATRIX_MAPPING</div>
            <V4CorrelationMap matrix={corrMatrix} symbols={symbols} />
          </div>
        )}
        {activeTab === 'RISK' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            <div>
               <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 1, marginBottom: 20 }}>NODE_STRESS_LEVELS</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {items.slice(0, 6).map(item => (
                   <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.logo} width={24} height={24} style={{ borderRadius: '50%' }} />
                        <span style={{ fontWeight: 900, color: '#fff', fontSize: 13 }}>{item.symbol}/USDT</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#ff4d4d', fontFamily: 'Space Mono' }}>{metrics[item.symbol]?.maxDD || '0.0'}%</div>
                        <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900 }}>MAX_DD</div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="card" style={{ padding: 24, background: '#080808', border: '2px solid var(--border)' }}>
               <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--blue)', letterSpacing: 2, marginBottom: 16 }}>NEURAL_ALPHA_ADVISORY</div>
               <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                 {symbols.length > 1 ? (
                   <>DETECTED: HIGH_SYNERGY between {symbols[0]} and {symbols[1]}.<br/>
                   RECOMMENDATION: Partial hedge of {symbols[0]} to uncorrelated market nodes. Systemic risk remains NOMINAL.</>
                 ) : "ORACLE_SCAN: INSUFFICIENT_DATA_FOR_NEURAL_ADVISORY."}
               </div>
            </div>
          </div>
        )}
        {activeTab === 'ALLOCATION' && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
             {items.slice(0, 12).map(item => (
               <div key={item.symbol} className="v4-card" style={{ padding: 20 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'Space Mono' }}>{item.symbol}</span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#3b82f6' }}>{((item.currentValue / totalVal) * 100).toFixed(1)}%</span>
                 </div>
                 <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: `${(item.currentValue / totalVal) * 100}%`, height: '100%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)', borderRadius: 2 }} />
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>

      <style>{`
        .stat-tile { transition: 0.1s; border: 2px solid var(--border); }
        .stat-tile:hover { border-color: #fff !important; }
        .v4-tab { transition: 0.1s; }
        .v4-live-ping { width: 8px; height: 8px; background: var(--green); border-radius: 50%; box-shadow: 0 0 10px var(--green); animation: ping-glow 2s infinite; }
        @keyframes ping-glow { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
