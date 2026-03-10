import React, { useState, useEffect, useRef } from 'react';
import { getListings, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

const COIN_COLORS = ['#3b82f6', '#00d4aa', '#f59e0b', '#8b5cf6'];

function SparkLine({ prices, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prices.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const min = Math.min(...prices), max = Math.max(...prices);
    const toX = (i) => (i / (prices.length - 1)) * W;
    const toY = (v) => H - ((v - min) / (max - min || 1)) * H * 0.9 - H * 0.05;

    ctx.fillStyle = 'var(--bg-input, #1a2435)'; ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '30'); grad.addColorStop(1, color + '00');
    ctx.beginPath();
    prices.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    prices.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  }, [prices, color]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', borderRadius: 6 }} />;
}

function RadarChart({ coins, metrics }) {
  const canvasRef = useRef(null);
  const axes = ['Price Perf', 'Volume', 'Market Cap', 'Volatility Inv', 'RSI Score'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !coins.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.38;
    const n = axes.length;

    ctx.fillStyle = 'var(--bg-card, #111827)'; ctx.fillRect(0, 0, W, H);

    // Concentric webs
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * scale * Math.cos(angle);
        const y = cy + r * scale * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.stroke();
    });

    // Axis lines + labels
    axes.forEach((label, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke();
      const lx = cx + (r + 20) * Math.cos(angle), ly = cy + (r + 20) * Math.sin(angle);
      ctx.fillStyle = '#8899b4'; ctx.font = '9px Arial';
      ctx.textAlign = Math.cos(angle) > 0.1 ? 'left' : Math.cos(angle) < -0.1 ? 'right' : 'center';
      ctx.fillText(label, lx, ly + 3);
    });

    // Plot each coin
    coins.slice(0, 4).forEach((coin, ci) => {
      const m = metrics[coin.symbol];
      if (!m) return;
      const vals = [
        Math.min(1, Math.max(0, (m.change24h + 20) / 40)),
        Math.min(1, Math.max(0, m.volumeScore)),
        Math.min(1, Math.max(0, m.marketCapScore)),
        Math.min(1, Math.max(0, 1 - m.volatilityScore)),
        Math.min(1, Math.max(0, m.rsiScore)),
      ];
      ctx.beginPath();
      vals.forEach((v, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * v * Math.cos(angle);
        const y = cy + r * v * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = COIN_COLORS[ci] + '25'; ctx.fill();
      ctx.strokeStyle = COIN_COLORS[ci]; ctx.lineWidth = 2; ctx.stroke();
    });
  }, [coins, metrics]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '280px', display: 'block' }} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
        {coins.slice(0, 4).map((c, i) => (
          <div key={c.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COIN_COLORS[i] }} />
            <span style={{ color: 'var(--text-secondary)' }}>{c.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoinSelector({ value, onChange, listings, exclude, color, index }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = listings.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())) &&
    !exclude.includes(c.symbol)
  ).slice(0, 10);

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `2px solid ${value ? color : 'var(--border)'}`, background: value ? color + '10' : 'var(--bg-input)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: '0.2s' }}>
        {value ? (
          <>
            <img src={value.logo} alt={value.symbol} width={24} height={24} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{value.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{value.symbol}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onChange(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>×</button>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>+ Add Coin {index + 1}</span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxHeight: 280, overflowY: 'auto' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <input className="form-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} autoFocus style={{ marginBottom: 0 }} />
          </div>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <img src={c.logo} alt={c.symbol} width={22} height={22} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }}>{c.symbol}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 12 }}>{formatCurrency(c.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState([null, null, null, null]);
  const [chartData, setChartData] = useState({});
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings().then(res => { setListings(res.data.data); setLoading(false); });
  }, []);

  const activeCoinSymbols = selected.filter(Boolean).map(c => c.symbol);

  useEffect(() => {
    const fetch = async () => {
      const results = {};
      await Promise.all(
        selected.filter(Boolean).map(async coin => {
          if (!chartData[coin.symbol + timeframe]) {
            const res = await getChartData(coin.symbol, timeframe);
            results[coin.symbol + timeframe] = res.data.data.map(d => d.price);
          }
        })
      );
      if (Object.keys(results).length) setChartData(prev => ({ ...prev, ...results }));
    };
    fetch();
  }, [selected, timeframe]);

  const setAt = (i, coin) => setSelected(prev => { const n = [...prev]; n[i] = coin; return n; });
  const coins = selected.filter(Boolean);

  // Build radar metrics
  const allVols = listings.map(c => c.volume24h || 0);
  const maxVol = Math.max(...allVols);
  const allMcap = listings.map(c => c.marketCap || 0);
  const maxMcap = Math.max(...allMcap);

  const radarMetrics = {};
  coins.forEach(c => {
    radarMetrics[c.symbol] = {
      change24h: c.change24h,
      volumeScore: c.volume24h / maxVol,
      marketCapScore: c.marketCap / maxMcap,
      volatilityScore: Math.min(1, Math.abs(c.change24h) / 20),
      rsiScore: 0.5 + (c.change24h / 40),
    };
  });

  const compareFields = [
    { label: 'Price', key: 'price', fmt: formatCurrency },
    { label: '24h Change', key: 'change24h', fmt: formatPercent, color: true },
    { label: 'Market Cap', key: 'marketCap', fmt: formatCurrency },
    { label: '24h Volume', key: 'volume24h', fmt: formatCurrency },
    { label: 'CMC Rank', key: 'rank', fmt: v => '#' + v },
  ];

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Coin Comparison</div>
          <div className="page-subtitle">Compare up to 4 cryptocurrencies side by side</div>
        </div>
      </div>

      {/* Coin selectors */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map(i => (
          <CoinSelector key={i} value={selected[i]} onChange={(c) => setAt(i, c)}
            listings={listings} exclude={activeCoinSymbols.filter((_, j) => j !== i)}
            color={COIN_COLORS[i]} index={i} />
        ))}
      </div>

      {coins.length < 2 && (
        <div className="card"><div className="empty-state">
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚖️</div>
          <h3>Select at least 2 coins to compare</h3>
          <p>Use the selectors above to choose cryptocurrencies</p>
        </div></div>
      )}

      {coins.length >= 2 && (
        <>
          {/* Timeframe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Timeframe:</span>
            <div className="tabs" style={{ margin: 0 }}>
              {['1h', '24h', '7d', '30d'].map(tf => (
                <button key={tf} className={`tab ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>{tf}</button>
              ))}
            </div>
          </div>

          {/* Sparklines */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${coins.length}, 1fr)`, gap: 14, marginBottom: 20 }}>
            {coins.map((coin, i) => {
              const prices = chartData[coin.symbol + timeframe] || [];
              const chg = prices.length >= 2 ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 : coin.change24h;
              return (
                <div key={coin.symbol} style={{ background: 'var(--bg-card)', border: `1px solid ${COIN_COLORS[i]}40`, borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 32, background: COIN_COLORS[i], borderRadius: 3 }} />
                    <img src={coin.logo} alt={coin.symbol} width={30} height={30} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{coin.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{coin.symbol}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{formatCurrency(coin.price)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: chg >= 0 ? 'var(--green)' : 'var(--red)', marginBottom: 10 }}>
                    {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}% ({timeframe})
                  </div>
                  <div style={{ height: 80 }}>
                    <SparkLine prices={prices} color={COIN_COLORS[i]} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Head-to-head table + Radar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <span className="card-title">Head to Head</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {coins.map((c, i) => (
                        <th key={c.symbol} style={{ color: COIN_COLORS[i] }}>{c.symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareFields.map(({ label, key, fmt, color: useColor }) => {
                      const vals = coins.map(c => c[key] || 0);
                      const best = key === 'rank' ? Math.min(...vals) : Math.max(...vals.map(Math.abs));
                      return (
                        <tr key={key}>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</td>
                          {coins.map((c, i) => {
                            const val = c[key] || 0;
                            const isBest = key === 'rank' ? val === best : Math.abs(val) === best;
                            return (
                              <td key={c.symbol} style={{
                                fontFamily: 'Space Mono', fontSize: 12, fontWeight: isBest ? 700 : 400,
                                color: useColor ? (val >= 0 ? 'var(--green)' : 'var(--red)') : isBest ? COIN_COLORS[i] : 'var(--text-primary)',
                              }}>
                                {fmt(val)}
                                {isBest && <span style={{ fontSize: 10, marginLeft: 4 }}>👑</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Radar */}
            <div className="card">
              <div className="card-header"><span className="card-title">Radar Analysis</span></div>
              <RadarChart coins={coins} metrics={radarMetrics} />
            </div>
          </div>

          {/* Normalized performance chart */}
          {coins.some(c => (chartData[c.symbol + timeframe] || []).length > 1) && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Normalized Performance ({timeframe})</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rebased to 100 at period start</span>
              </div>
              <NormalizedChart coins={coins} chartData={chartData} timeframe={timeframe} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NormalizedChart({ coins, chartData, timeframe }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    ctx.fillStyle = 'var(--bg-primary, #080c14)'; ctx.fillRect(0, 0, W, H);

    const allNorm = [];
    const seriesData = coins.map((coin, ci) => {
      const prices = chartData[coin.symbol + timeframe] || [];
      if (!prices.length) return null;
      const base = prices[0];
      const norm = prices.map(p => (p / base) * 100);
      allNorm.push(...norm);
      return { norm, color: COIN_COLORS[ci], symbol: coin.symbol };
    }).filter(Boolean);

    if (!seriesData.length) return;

    const minV = Math.min(...allNorm) * 0.99;
    const maxV = Math.max(...allNorm) * 1.01;
    const toX = (i, len) => 50 + (i / (len - 1)) * (W - 60);
    const toY = (v) => 20 + (H - 50) - ((v - minV) / (maxV - minV)) * (H - 50);

    // Grid
    [100, 110, 120, 90, 80, 130].filter(v => v >= minV && v <= maxV).forEach(v => {
      const y = toY(v);
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.setLineDash([3, 3]);
      ctx.moveTo(50, y); ctx.lineTo(W, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#4a5e78'; ctx.font = '9px Space Mono'; ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(0), 44, y + 3);
    });

    // Baseline 100
    const base100y = toY(100);
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.moveTo(50, base100y); ctx.lineTo(W, base100y); ctx.stroke();

    // Each series
    seriesData.forEach(({ norm, color, symbol }) => {
      ctx.beginPath();
      norm.forEach((v, i) => {
        const x = toX(i, norm.length), y = toY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

      // End label
      const lastVal = norm[norm.length - 1];
      const lx = toX(norm.length - 1, norm.length);
      const ly = toY(lastVal);
      ctx.fillStyle = color; ctx.font = 'bold 10px Space Mono'; ctx.textAlign = 'left';
      ctx.fillText(`${symbol} ${lastVal.toFixed(1)}`, lx + 4, ly + 3);
    });

  }, [coins, chartData, timeframe]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '240px', display: 'block' }} />;
}
