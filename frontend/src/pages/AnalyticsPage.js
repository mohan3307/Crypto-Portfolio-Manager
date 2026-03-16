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

const calmarRatio = (rets, dd) => dd === 0 ? 0 : (mean(rets) * 252) / (dd / 100);
const sortinoRatio = (rets, rf = 0.05 / 252) => {
  const excess = rets.map(r => r - rf);
  const downRets = excess.filter(r => r < 0);
  const downStd = std(downRets);
  return downStd === 0 ? 0 : (mean(excess) / downStd) * Math.sqrt(252);
};

// ─── Sub-components ───────────────────────────────────────────────────────
function MetricCard({ label, value, subtitle, color = 'var(--accent)', good }) {
  const isGood = good === undefined ? null : good;
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: 22, color: isGood === null ? 'var(--text-primary)' : isGood ? 'var(--green)' : 'var(--red)' }}>{value}</div>
      {subtitle && <div className="stat-change neutral" style={{ marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function CorrelationMatrix({ matrix, symbols }) {
  if (!matrix.length) return null;
  const colorFor = (v) => {
    const abs = Math.abs(v);
    if (v === 1) return '#1a2435';
    if (v > 0.7) return `rgba(255,71,87,${0.2 + abs * 0.6})`;
    if (v > 0.3) return `rgba(245,158,11,${0.2 + abs * 0.4})`;
    if (v > -0.3) return `rgba(139,92,246,${0.1 + abs * 0.3})`;
    return `rgba(0,212,170,${0.2 + abs * 0.5})`;
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 10px', color: 'var(--text-muted)', textAlign: 'left', fontSize: 10 }}></th>
            {symbols.map(s => <th key={s} style={{ padding: '6px 8px', color: 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 10 }}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={symbols[i]}>
              <td style={{ padding: '5px 10px', fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>{symbols[i]}</td>
              {row.map((val, j) => (
                <td key={j} style={{ padding: '5px 8px', background: colorFor(val), textAlign: 'center', borderRadius: 3, fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-primary)', fontWeight: i === j ? 700 : 400 }}>
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

function DrawdownChart({ prices }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prices.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    let peak = prices[0];
    const ddArr = prices.map(p => { if (p > peak) peak = p; return -((peak - p) / peak) * 100; });
    const minDD = Math.min(...ddArr);

    ctx.fillStyle = 'var(--bg-primary, #080c14)'; ctx.fillRect(0, 0, W, H);

    // 0 line
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.moveTo(0, 5); ctx.lineTo(W, 5); ctx.stroke();

    const toX = (i) => (i / (prices.length - 1)) * W;
    const toY = (v) => 5 + (v / minDD) * (H - 10);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(255,71,87,0.5)'); grad.addColorStop(1, 'rgba(255,71,87,0.05)');
    ctx.beginPath();
    ddArr.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(W, 5); ctx.lineTo(0, 5); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ddArr.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = '#ff4757'; ctx.lineWidth = 1.5; ctx.stroke();

    // Labels
    ctx.fillStyle = '#4a5e78'; ctx.font = '9px Arial'; ctx.textAlign = 'right';
    ctx.fillText(`Max: ${minDD.toFixed(1)}%`, W - 4, H - 4);
  }, [prices]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [priceHistory, setPriceHistory] = useState({});
  const [btcHistory, setBtcHistory] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [corrMatrix, setCorrMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

        // Compute metrics per coin
        const btcRets = returns(btcPrices);
        const m = {};
        Object.entries(history).forEach(([sym, prices]) => {
          if (prices.length < 10) return;
          const rets = returns(prices);
          m[sym] = {
            sharpe: sharpeRatio(rets).toFixed(2),
            sortino: sortinoRatio(rets).toFixed(2),
            maxDD: maxDrawdown(prices).toFixed(2),
            beta: beta(rets, btcRets).toFixed(2),
            calmar: calmarRatio(rets, maxDrawdown(prices)).toFixed(2),
            volatility: (std(rets) * Math.sqrt(252) * 100).toFixed(2),
            totalReturn: (((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(2),
          };
        });
        setMetrics(m);

        // Correlation matrix
        const syms = Object.keys(history);
        const matrix = syms.map(sa => syms.map(sb => {
          const ra = returns(history[sa]), rb = returns(history[sb]);
          return parseFloat(correlation(ra, rb).toFixed(2));
        }));
        setCorrMatrix(matrix);
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    init();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><p style={{ color: 'var(--text-muted)' }}>Running analytics…</p></div>;

  const { items = [], summary = {} } = portfolio || {};
  const symbols = Object.keys(metrics);

  // Portfolio-level metrics (value-weighted)
  const totalVal = items.reduce((s, i) => s + i.currentValue, 0) || 1;
  let portSharpe = 0, portDD = 0, portVol = 0, portBeta = 0;
  symbols.forEach(sym => {
    const item = items.find(i => i.symbol === sym);
    if (!item) return;
    const w = item.currentValue / totalVal;
    portSharpe += parseFloat(metrics[sym].sharpe) * w;
    portDD = Math.max(portDD, parseFloat(metrics[sym].maxDD));
    portVol += parseFloat(metrics[sym].volatility) * w;
    portBeta += parseFloat(metrics[sym].beta) * w;
  });

  // Health Score Logic
  const diversificationScore = Math.min(items.length * 10, 40); // Max 4 items for full diversification bonus
  const correlationFactor = corrMatrix.length > 1 ? (1 - (corrMatrix.flat().reduce((a, b) => a + b, 0) / (corrMatrix.length ** 2))) : 0.5;
  const volScore = Math.max(0, 30 - (portVol / 5)); // Reward low volatility
  const finalHealthScore = Math.round(diversificationScore + (correlationFactor * 30) + volScore + (portSharpe > 1 ? 10 : 0));
  
  // Benchmarking Logic (Portfolio vs BTC)
  const days = 30;
  const portfolioBenchData = Array.from({ length: days }).map((_, d) => {
    let dayVal = 0;
    items.forEach(item => {
      const hist = priceHistory[item.symbol];
      if (hist && hist[d]) {
        const weight = item.currentValue / totalVal;
        dayVal += (hist[d] / hist[0]) * 100 * weight;
      }
    });
    return dayVal || 100;
  });
  const btcBenchData = btcHistory.map(p => (p / btcHistory[0]) * 100);
  const alpha = (portfolioBenchData[days-1] - btcBenchData[days-1]).toFixed(1);

  // Allocation pie data for bar
  const allocationSorted = [...items].sort((a, b) => b.currentValue - a.currentValue);
  const COLORS = ['#3b82f6', '#00d4aa', '#f59e0b', '#8b5cf6', '#ff4757', '#06b6d4', '#10b981', '#ec4899'];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Portfolio Analytics</div>
          <div className="page-subtitle">30-day risk metrics, drawdown analysis, correlation matrix</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>⎙ Export Statement</button>
        </div>
      </div>

      {/* Health Score & High Level Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, marginBottom: 24 }}>
        {/* Health Score Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 20 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="70" cy="70" r="64" fill="none" stroke={finalHealthScore > 70 ? 'var(--green)' : 'var(--gold)'} strokeWidth="8" 
                strokeDasharray={`${2 * Math.PI * 64}`} 
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - (finalHealthScore / 100))}`}
                strokeLinecap="round" transform="rotate(-90 70 70)" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>{finalHealthScore}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Health Score</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: finalHealthScore > 70 ? 'var(--green)' : 'var(--gold)', marginBottom: 6 }}>
            {finalHealthScore > 80 ? 'Elite Portfolio' : finalHealthScore > 60 ? 'Healthy Mix' : 'High Risk Profile'}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {finalHealthScore > 70 
              ? `Your portfolio is well-balanced across ${items.length} assets with healthy risk markers.`
              : "Consider diversifying into less correlated assets to improve your security score."}
          </p>
        </div>

        {/* Benchmarking Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Benchmarking (Normalized 30d)</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: 2 }} /> Portfolio</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: 'var(--gold)', borderRadius: 2 }} /> Bitcoin</span>
            </div>
          </div>
          <div style={{ height: 200, position: 'relative' }}>
             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {portfolioBenchData.map((v, i) => {
                  const btcV = btcBenchData[i];
                  const maxH = Math.max(...portfolioBenchData, ...btcBenchData);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ height: `${(v / maxH) * 100}%`, background: 'var(--accent)', opacity: 0.6, width: '100%', borderRadius: '1px 1px 0 0' }} />
                      <div style={{ height: `${(btcV / maxH) * 100}%`, background: 'var(--gold)', opacity: 0.3, width: '100%', borderRadius: '1px 1px 0 0' }} />
                    </div>
                  );
                })}
             </div>
             <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, color: alpha >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
               {alpha >= 0 ? `+${alpha}% Alpha vs BTC` : `${alpha}% Underperforming BTC`}
             </div>
          </div>
        </div>
      </div>

      {/* Portfolio-level KPIs */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 24 }}>
        <MetricCard label="Sharpe Ratio" value={portSharpe.toFixed(2)} subtitle="Risk-adj. return" color="var(--accent)" good={portSharpe > 1} />
        <MetricCard label="Max Drawdown" value={`-${portDD.toFixed(2)}%`} subtitle="30-day worst drop" color="var(--red)" good={portDD < 20} />
        <MetricCard label="Volatility (Ann.)" value={`${portVol.toFixed(1)}%`} subtitle="Annualized std dev" color="var(--gold)" />
        <MetricCard label="Portfolio Beta" value={portBeta.toFixed(2)} subtitle="vs BTC" color="var(--purple)" good={portBeta < 1.2} />
        <MetricCard label="Total Value" value={formatCurrency(summary.totalValue || 0)} subtitle={`${formatPercent(summary.totalPnLPct || 0)} P&L`} color="var(--green)" good={(summary.totalPnL || 0) >= 0} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['overview', 'Overview'], ['coins', 'Per-Coin Metrics'], ['correlation', 'Correlation'], ['drawdown', 'Drawdown']].map(([v, l]) => (
          <button key={v} className={`tab ${activeTab === v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Allocation bar */}
          <div className="card">
            <div className="card-header"><span className="card-title">Asset Allocation</span></div>
            {allocationSorted.map((item, i) => {
              const pct = (item.currentValue / totalVal) * 100;
              return (
                <div key={item.symbol} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{item.symbol}</span>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'Space Mono' }}>
                      {formatCurrency(item.currentValue)} <span style={{ color: 'var(--text-muted)' }}>({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, transition: '0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* P&L breakdown */}
          <div className="card">
            <div className="card-header"><span className="card-title">Profit & Loss Breakdown</span></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Coin</th><th>Invested</th><th>Value</th><th>P&L</th><th>Return</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.symbol}>
                      <td><div className="coin-cell">
                        <img src={item.logo} alt={item.symbol} className="coin-logo" onError={e => e.target.style.display = 'none'} />
                        <span style={{ fontWeight: 600 }}>{item.symbol}</span>
                      </div></td>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 12 }}>{formatCurrency(item.totalInvestment)}</td>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 600 }}>{formatCurrency(item.currentValue)}</td>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 12, color: item.profitLoss >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}
                      </td>
                      <td><span className={`badge ${item.profitPct >= 0 ? 'badge-green' : 'badge-red'}`}>{formatPercent(item.profitPct)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PER-COIN METRICS */}
      {activeTab === 'coins' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Coin</th>
                <th>Sharpe ↑</th>
                <th>Sortino ↑</th>
                <th>Max DD ↓</th>
                <th>Beta</th>
                <th>Calmar ↑</th>
                <th>Volatility</th>
                <th>30d Return</th>
              </tr></thead>
              <tbody>
                {symbols.map(sym => {
                  const m = metrics[sym];
                  return (
                    <tr key={sym}>
                      <td style={{ fontFamily: 'Space Mono', fontWeight: 600 }}>{sym}</td>
                      <td style={{ fontFamily: 'Space Mono', color: parseFloat(m.sharpe) > 1 ? 'var(--green)' : parseFloat(m.sharpe) > 0 ? 'var(--text-primary)' : 'var(--red)' }}>{m.sharpe}</td>
                      <td style={{ fontFamily: 'Space Mono', color: parseFloat(m.sortino) > 1 ? 'var(--green)' : 'var(--text-primary)' }}>{m.sortino}</td>
                      <td style={{ fontFamily: 'Space Mono', color: parseFloat(m.maxDD) < 15 ? 'var(--green)' : parseFloat(m.maxDD) < 30 ? 'var(--gold)' : 'var(--red)' }}>-{m.maxDD}%</td>
                      <td style={{ fontFamily: 'Space Mono', color: parseFloat(m.beta) < 1 ? 'var(--green)' : 'var(--text-primary)' }}>{m.beta}</td>
                      <td style={{ fontFamily: 'Space Mono' }}>{m.calmar}</td>
                      <td style={{ fontFamily: 'Space Mono', color: 'var(--gold)' }}>{m.volatility}%</td>
                      <td><span className={`badge ${parseFloat(m.totalReturn) >= 0 ? 'badge-green' : 'badge-red'}`}>{m.totalReturn >= 0 ? '+' : ''}{m.totalReturn}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
            ↑ Higher is better &nbsp;|&nbsp; ↓ Lower is better &nbsp;|&nbsp; Beta vs BTC. All metrics based on 30-day daily returns.
          </div>
        </div>
      )}

      {/* CORRELATION */}
      {activeTab === 'correlation' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Correlation Matrix (30d)</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Daily returns correlation</span>
          </div>
          {corrMatrix.length > 0 ? (
            <>
              <CorrelationMatrix matrix={corrMatrix} symbols={symbols} />
              <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[['> 0.7 Strong Positive', '#ff4757'], ['0.3–0.7 Moderate', '#f59e0b'], ['-0.3–0.3 Low', '#8b5cf6'], ['< -0.3 Negative', '#00d4aa']].map(([label, color]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <div style={{ width: 12, height: 12, background: color + '60', borderRadius: 2 }} />
                    {label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>Need at least 2 coins with 30-day history</p></div>
          )}
        </div>
      )}

      {/* DRAWDOWN */}
      {activeTab === 'drawdown' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 16 }}>
          {symbols.map(sym => (
            <div key={sym} className="card">
              <div className="card-header">
                <span className="card-title">{sym} Drawdown</span>
                <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'Space Mono' }}>Max: -{metrics[sym].maxDD}%</span>
              </div>
              <div style={{ height: 120 }}>
                <DrawdownChart prices={priceHistory[sym] || []} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {[['Volatility', metrics[sym].volatility + '%'], ['Beta', metrics[sym].beta], ['Sharpe', metrics[sym].sharpe]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
                    <div style={{ fontSize: 12, fontFamily: 'Space Mono', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
