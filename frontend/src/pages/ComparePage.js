import React, { useState, useEffect, useRef } from 'react';
import { getListings, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

const V4_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

function SparkLine({ prices, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prices.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const displayW = canvas.offsetWidth;
    const displayH = canvas.offsetHeight;
    
    const min = Math.min(...prices), max = Math.max(...prices);
    const toX = (i) => (i / (prices.length - 1)) * displayW;
    const toY = (v) => displayH - ((v - min) / (max - min || 1)) * displayH * 0.8 - displayH * 0.1;

    ctx.clearRect(0, 0, displayW, displayH);

    const grad = ctx.createLinearGradient(0, 0, 0, displayH);
    grad.addColorStop(0, color + '25'); grad.addColorStop(1, color + '00');
    
    ctx.beginPath();
    prices.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(displayW, displayH); ctx.lineTo(0, displayH); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    prices.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  }, [prices, color]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

function V4RadarChart({ coins, metrics }) {
  const canvasRef = useRef(null);
  const axes = ['PERFORMANCE', 'VOLUME_DEPTH', 'CAPITAL_WEIGHT', 'STABILITY', 'NEURAL_INDEX'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !coins.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const displayW = canvas.offsetWidth;
    const displayH = canvas.offsetHeight;

    const cx = displayW / 2, cy = displayH / 2, r = Math.min(displayW, displayH) * 0.35;
    const n = axes.length;

    ctx.clearRect(0, 0, displayW, displayH);

    // Grid webs
    [0.2, 0.4, 0.6, 0.8, 1].forEach(scale => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * scale * Math.cos(angle);
        const y = cy + r * scale * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = scale === 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)'; 
      ctx.setLineDash(scale === 1 ? [] : [2, 2]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Axes
    axes.forEach((label, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
      
      const lx = cx + (r + 25) * Math.cos(angle), ly = cy + (r + 25) * Math.sin(angle);
      ctx.fillStyle = '#4a5e78'; ctx.font = 'bold 8px Space Mono';
      ctx.textAlign = Math.cos(angle) > 0.1 ? 'left' : Math.cos(angle) < -0.1 ? 'right' : 'center';
      ctx.fillText(label, lx, ly + 3);
    });

    // Plot data
    coins.slice(0, 4).forEach((coin, ci) => {
      const m = metrics[coin.symbol];
      if (!m) return;
      const vals = [
        Math.min(1, Math.max(0, (m.change24h + 15) / 30)),
        Math.min(1, Math.max(0, m.volumeScore * 1.5)),
        Math.min(1, Math.max(0, m.marketCapScore * 2)),
        Math.min(1, Math.max(0, 1 - (m.volatilityScore * 2))),
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
      ctx.fillStyle = V4_COLORS[ci] + '10'; ctx.fill();
      ctx.strokeStyle = V4_COLORS[ci]; ctx.lineWidth = 1.5; ctx.stroke();
      
      // Points
      vals.forEach((v, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * v * Math.cos(angle), y = cy + r * v * Math.sin(angle);
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fillStyle = V4_COLORS[ci]; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5; ctx.stroke();
      });
    });
  }, [coins, metrics]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '320px', display: 'block' }} />;
}

function V4AssetSelector({ value, onChange, listings, exclude, color, index }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = listings.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())) &&
    !exclude.includes(c.symbol)
  ).slice(0, 8);

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 260 }} ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} style={{ 
        width: '100%', border: '2px solid var(--border)', background: '#000', height: 64,
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', cursor: 'pointer'
      }}>
        {value ? (
          <>
            <img src={value.logo} width={28} height={28} style={{ borderRadius: '2px', background: '#fff' }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{value.symbol}</div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>{value.name.toUpperCase()}</div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }} onClick={(e) => { e.stopPropagation(); onChange(null); }}>✕</div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>+</div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, color: 'var(--text-dim)' }}>INITIALIZE_NODE_{index + 1}</span>
          </div>
        )}
      </button>

      {open && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, 
          background: '#0a0a0a', border: '2px solid var(--border)', borderTop: 'none',
          maxHeight: 300, overflowY: 'auto'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input 
              style={{ width: '100%', background: '#000', border: '1px solid var(--border)', padding: '8px', color: '#fff', fontSize: 11, outline: 'none' }}
              placeholder="SEARCH_NODE..." value={search} onChange={e => setSearch(e.target.value)} autoFocus 
            />
          </div>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
              style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.1s' }}
              className="v4-row">
              <img src={c.logo} width={20} height={20} style={{ borderRadius: '2px', background: '#fff' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 12, color: '#fff', fontFamily: 'var(--font-mono)' }}>{c.symbol}</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>{c.name.toUpperCase()}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>{formatCurrency(c.price)}</div>
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

  const activeSymbols = selected.filter(Boolean).map(c => c.symbol);

  useEffect(() => {
    const fetchCharts = async () => {
      const results = {};
      await Promise.all(
        selected.filter(Boolean).map(async coin => {
          const key = coin.symbol + timeframe;
          if (!chartData[key]) {
            const res = await getChartData(coin.symbol, timeframe);
            results[key] = res.data.data.map(d => d.price);
          }
        })
      );
      if (Object.keys(results).length) setChartData(prev => ({ ...prev, ...results }));
    };
    fetchCharts();
  }, [selected, timeframe]);

  const setAt = (i, coin) => setSelected(prev => { const n = [...prev]; n[i] = coin; return n; });
  const activeCoins = selected.filter(Boolean);

  const maxVol = Math.max(...listings.map(c => c.volume24h || 1));
  const maxMcap = Math.max(...listings.map(c => c.marketCap || 1));

  const radarMetrics = {};
  activeCoins.forEach(c => {
    radarMetrics[c.symbol] = {
      change24h: c.change24h,
      volumeScore: c.volume24h / maxVol,
      marketCapScore: c.marketCap / maxMcap,
      volatilityScore: Math.min(1, Math.abs(c.change24h) / 20),
      rsiScore: 0.5 + (c.change24h / 40),
    };
  });

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div style={{ width: 44, height: 44, border: '4px solid var(--border)', borderTopColor: '#fff', borderRadius: '50%', animation: 'v4-spin 1s linear infinite' }} />
       <style>{`@keyframes v4-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>BENCHMARK_CONSOLE_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>CROSS_ASSET_DIAGNOSTICS</h1>
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
          {['1h', '24h', '7d', '30d'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              style={{ 
                background: timeframe === tf ? '#fff' : '#000', 
                color: timeframe === tf ? '#000' : 'var(--text-dim)',
                border: '2px solid var(--border)',
                padding: '10px 20px', fontSize: 9, fontWeight: 900, letterSpacing: 2
              }}>{tf.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', gap: 15, marginBottom: 32 }}>
        {[0, 1, 2, 3].map(i => (
          <V4AssetSelector key={i} value={selected[i]} onChange={(c) => setAt(i, c)} listings={listings} exclude={activeSymbols.filter((_, j) => j !== i)} color={V4_COLORS[i]} index={i} />
        ))}
      </div>

      {activeCoins.length < 2 ? (
        <div className="v4-card" style={{ padding: '120px 0', textAlign: 'center', borderStyle: 'dashed' }}>
           <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.1, color: '#fff' }}>⚖️</div>
           <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>BENCHMARK_PENDING</div>
           <p style={{ color: '#4a5e78', fontSize: 12, fontWeight: 900 }}>MINIMUM 2 ACTIVE NODES REQUIRED FOR DIFFERENTIAL DIAGNOSTICS</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Sparklines Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeCoins.length}, 1fr)`, gap: 12 }}>
              {activeCoins.map((coin, i) => {
                const prices = chartData[coin.symbol + timeframe] || [];
                const chg = prices.length >= 2 ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 : coin.change24h;
                return (
                  <div key={coin.symbol} className="card" style={{ padding: 24, borderTop: `4px solid ${V4_COLORS[i]}`, background: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img src={coin.logo} width={24} height={24} style={{ borderRadius: '2px', background: '#fff' }} />
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{coin.symbol}</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: chg >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                        {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>{formatCurrency(coin.price)}</div>
                    <div style={{ height: 80 }}>
                      <SparkLine prices={prices} color={V4_COLORS[i]} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
              <div style={{ padding: '16px 24px', background: '#080808', borderBottom: '2px solid var(--border)', fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>NODE_DIFFERENTIAL_DATA</div>
              <div className="v4-scroller" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#050505', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>METRIC_PROTOCOL</th>
                      {activeCoins.map((c, i) => (
                        <th key={c.symbol} style={{ padding: '16px', textAlign: 'right', color: V4_COLORS[i] }}>{c.symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'UNIT_PRICE', key: 'price', fmt: formatCurrency },
                      { label: 'DEL_24H_INDEX', key: 'change24h', fmt: formatPercent, colored: true },
                      { label: 'CAPITAL_WEIGHT', key: 'marketCap', fmt: formatCurrency },
                      { label: 'LIQUIDITY_DEPTH', key: 'volume24h', fmt: formatCurrency },
                      { label: 'SECTOR_RANK', key: 'rank', fmt: v => '#' + v },
                    ].map(f => {
                      const vals = activeCoins.map(c => c[f.key] || 0);
                      const best = f.key === 'rank' ? Math.min(...vals) : Math.max(...vals.map(Math.abs));
                      return (
                        <tr key={f.key} style={{ borderBottom: '1px solid var(--border)' }} className="v4-row">
                          <td style={{ padding: '14px 24px', fontSize: 10, fontWeight: 900, color: 'var(--text-dim)' }}>{f.label}</td>
                          {activeCoins.map((c, i) => {
                            const val = c[f.key] || 0;
                            const isBest = f.key === 'rank' ? val === best : Math.abs(val) === best;
                            return (
                              <td key={c.symbol} style={{ 
                                padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900,
                                color: f.colored ? (val >= 0 ? 'var(--green)' : 'var(--red)') : isBest ? '#fff' : 'var(--text-dim)'
                              }}>
                                {f.fmt(val)} {isBest && <span style={{ color: V4_COLORS[i], marginLeft: 4 }}>★</span>}
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 24, background: '#000' }}>
               <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase' }}>RADAR_VECTOR_MAP</div>
               <V4RadarChart coins={activeCoins} metrics={radarMetrics} />
            </div>
            
            <div style={{ padding: 20, background: '#080808', border: '2px solid var(--border)' }}>
               <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--blue)', letterSpacing: 2, marginBottom: 16 }}>NEURAL_ADVISORY</div>
               <div style={{ fontSize: 11, color: '#fff', lineHeight: 1.8, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                 DETECTED: {activeCoins[0].symbol} shows {(activeCoins[0].change24h - (activeCoins[1]?.change24h || 0)).toFixed(1)}% relative alpha against {activeCoins[1]?.symbol || 'market'}.<br/><br/>
                 Structural volatility is higher in {activeCoins.sort((a,b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0].symbol} cluster. Deploy hedge vectors accordingly.
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-strong); }
      `}</style>
    </div>
  );
}
