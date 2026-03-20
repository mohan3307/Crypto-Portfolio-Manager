import React, { useState, useEffect, useRef } from 'react';
import { usePaperTrading } from '../context/PaperTradingContext';
import { getListings } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

function EquityCurve({ history, initial }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const displayW = canvas.offsetWidth;
    const displayH = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, displayW, displayH);

    if (history.length < 2) {
      ctx.fillStyle = '#4a5e78';
      ctx.font = '900 10px Space Mono'; ctx.textAlign = 'center';
      ctx.fillText('HISTORICAL_TELEMETRY_INSUFFICIENT', displayW / 2, displayH / 2);
      return;
    }

    let cum = initial;
    const pts = [initial, ...history.slice().reverse().map(h => (cum += h.pnl, cum))];
    const min = Math.min(...pts) * 0.999;
    const max = Math.max(...pts) * 1.001;
    const toX = (i) => (i / (pts.length - 1)) * displayW;
    const toY = (v) => displayH - ((v - min) / (max - min || 1)) * displayH;
    
    const isUp = pts[pts.length - 1] >= initial;
    const color = isUp ? '#10b981' : '#ff4d4d';

    const grad = ctx.createLinearGradient(0, 0, 0, displayH);
    grad.addColorStop(0, color + '10'); grad.addColorStop(1, color + '00');
    
    ctx.beginPath();
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(displayW, displayH); ctx.lineTo(0, displayH); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

    const baseY = toY(initial);
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.setLineDash([2, 4]);
    ctx.moveTo(0, baseY); ctx.lineTo(displayW, baseY); ctx.stroke(); ctx.setLineDash([]);
  }, [history, initial]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

function OrderModal({ listings, onClose }) {
  const { balance, openPosition } = usePaperTrading();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [side, setSide] = useState('long');
  const [qty, setQty] = useState('');

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6);

  const cost = selected && qty ? parseFloat(qty) * selected.price : 0;

  const handleOpen = () => {
    if (!selected || !qty) return;
    const ok = openPosition({
      symbol: selected.symbol, coinName: selected.name,
      logo: selected.logo, type: side,
      quantity: parseFloat(qty), price: selected.price,
    });
    if (ok) onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#000', border: '2px solid var(--border)', maxWidth: 420, width: '100%', padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
           <div>
             <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>TACTICAL_EXECUTION</div>
             <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 0', letterSpacing: -1 }}>INITIALIZE_SIM</h2>
           </div>
           <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
 
        <div style={{ padding: '12px 16px', border: '1px solid var(--border)', background: '#080808', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', letterSpacing: 1 }}>LIQUIDITY_AVAILABLE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#fff', fontSize: 14 }}>{formatCurrency(balance)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '2px solid var(--border)', marginBottom: 20, background: 'var(--border)' }}>
          {[['long', '▲ LONG', 'var(--green)'], ['short', '▼ SHORT', 'var(--red)']].map(([v, label, color]) => (
            <button key={v} onClick={() => setSide(v)}
              style={{ 
                padding: '12px', border: 'none',
                background: side === v ? '#fff' : '#000',
                color: side === v ? '#000' : color, 
                fontWeight: 900, fontSize: 10, cursor: 'pointer', transition: '0.1s', letterSpacing: 1
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>TARGET_NODE</label>
          <div style={{ position: 'relative' }}>
            <input 
              style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 12, outline: 'none' }}
              placeholder="SEARCH_COIN..." value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} 
            />
            {search && !selected && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#0a0a0a', border: '2px solid var(--border)', borderTop: 'none', maxHeight: 200, overflowY: 'auto' }}>
                {filtered.map(c => (
                  <div key={c.id} onClick={() => { setSelected(c); setSearch(c.name); }} 
                    style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} className="v4-row">
                    <img src={c.logo} width={20} height={20} style={{ borderRadius:'2px', background:'#fff' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: '#fff', fontFamily: 'var(--font-mono)' }}>{c.symbol}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>{formatCurrency(c.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>UNIT_QUANTITY</label>
          <input 
            style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', outline: 'none' }}
            type="number" step="any" placeholder="0.00" value={qty} onChange={e => setQty(e.target.value)} 
          />
          {selected && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', border: '2px solid var(--border)', marginTop: 8 }}>
              {[25, 50, 75, 100].map(p => (
                <button key={p} style={{ background: '#000', border: 'none', color: 'var(--text-dim)', padding: '8px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }} 
                  onClick={() => setQty(((balance * p / 100) / selected.price).toFixed(6))}>{p}%</button>
              ))}
            </div>
          )}
        </div>

        {selected && qty && (
          <div className="v4-receipt-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950 }}>NOTIONAL_VALUE</span>
              <span style={{ fontFamily: 'Space Mono', fontWeight: 900, color: '#fff' }}>{formatCurrency(cost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950 }}>MARGIN_REMAINDER</span>
              <span style={{ fontFamily: 'Space Mono', color: balance - cost >= 0 ? '#10b981' : '#ff4d4d', fontWeight: 900 }}>{formatCurrency(balance - cost)}</span>
            </div>
          </div>
        )}

        <button onClick={handleOpen} className={`v4-deploy-btn full-width ${side}`}>
          {side === 'long' ? 'ENGAGE_LONG_PROTOCOL' : 'ENGAGE_SHORT_PROTOCOL'}
        </button>
      </div>
    </div>
  );
}

function PositionRow({ pos }) {
  const { closePosition, livePrices } = usePaperTrading();
  const cp = livePrices[pos.symbol] || pos.entryPrice;
  const pnl = pos.type === 'long' ? (cp - pos.entryPrice) * pos.quantity : (pos.entryPrice - cp) * pos.quantity;
  const pnlPct = (pnl / (pos.entryPrice * pos.quantity)) * 100;
  const isUp = pnl >= 0;

  return (
    <tr className="v4-row" style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={pos.logo} width={24} height={24} style={{ borderRadius: '2px', background: '#fff' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{pos.symbol}</div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>{pos.coinName.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: pos.type === 'long' ? 'var(--green)' : 'var(--red)' }}>{pos.type.toUpperCase()}</span>
      </td>
      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 900 }}>{pos.quantity}</td>
      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: 11 }}>{formatCurrency(pos.entryPrice)}</td>
      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fff', fontSize: 11 }}>{formatCurrency(cp)}</td>
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <div style={{ color: isUp ? 'var(--green)' : 'var(--red)', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          {isUp ? '+' : ''}{formatCurrency(pnl)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800 }}>{formatPercent(pnlPct)}</div>
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <button onClick={() => closePosition(pos.id, cp)} 
          style={{ border: '2px solid var(--border)', background: '#000', color: 'var(--red)', padding: '6px 12px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>
          LIQUIDATE
        </button>
      </td>
    </tr>
  );
}

export default function PaperTradingPage() {
  const { balance, positions, history, totalEquity, totalPnL, historyPnL, winRate, resetAccount, updatePrices, INITIAL_BALANCE } = usePaperTrading();
  const [listings, setListings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');

  useEffect(() => {
    const fetch = async () => {
      const res = await getListings();
      const data = res.data.data;
      setListings(data);
      const p = {}; data.forEach(c => { p[c.symbol] = c.price; });
      updatePrices(p);
    };
    fetch();
    const i = setInterval(fetch, 10000);
    return () => clearInterval(i);
  }, []);

  const totalTrades = history.length;
  const wins = history.filter(h => h.pnl > 0).length;
  const netPnL = historyPnL;
  const totalValue = balance + totalEquity;
  const allTimeReturn = ((totalValue - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;
  const avgWin = wins > 0 ? history.filter(h => h.pnl > 0).reduce((s, h) => s + h.pnl, 0) / wins : 0;
  const avgLoss = totalTrades - wins > 0 ? history.filter(h => h.pnl <= 0).reduce((s, h) => s + Math.abs(h.pnl), 0) / (totalTrades - wins) : 0;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>SIMULATION_LAB_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>TACTICAL_TRAINING_GROUND</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ border: '2px solid var(--border)', background: '#000', color: 'var(--red)', padding: '10px 20px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }} onClick={resetAccount}>PURGE_SIM_DATA</button>
          <button style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }} onClick={() => setShowModal(true)}>+ INITIALIZE_VECTOR</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="LIQUIDITY_BALANCE" value={formatCurrency(balance)} color="#000" />
        <StatCard label="UNREALIZED_DELTA" value={formatCurrency(totalEquity)} color="#000" sub={`${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`} />
        <StatCard label="TOTAL_EQUITY" value={formatCurrency(totalValue)} color="#000" sub={`${allTimeReturn >= 0 ? '+' : ''}${allTimeReturn.toFixed(2)}% ROI`} />
        <StatCard label="NEURAL_WIN_RATE" value={`${winRate.toFixed(1)}%`} color="#000" sub={`${wins}/${totalTrades} SEQUENCES`} />
        <StatCard label="REALIZED_YIELD" value={formatCurrency(netPnL)} color="#000" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 24, background: '#000' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>EQUITY_CURVE_TELEMETRY</div>
          <div style={{ height: 260 }}><EquityCurve history={history} initial={INITIAL_BALANCE} /></div>
        </div>
        <div className="card" style={{ padding: 24, background: '#000' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>SIM_DIAGNOSTICS</div>
          {[
            ['AVG_WIN_VECTOR', formatCurrency(avgWin), 'var(--green)'],
            ['AVG_LOSS_VECTOR', formatCurrency(avgLoss), 'var(--red)'],
            ['PROBABILITY_COEFF', avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '∞', '#fff'],
            ['ACTIVE_NODES', positions.length, 'var(--blue)'],
            ['CLOSED_SESSIONS', totalTrades, 'var(--text-dim)'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800 }}>{l}</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 900, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 1, border: '2px solid var(--border)', background: 'var(--border)', marginBottom: 24, width: 'fit-content' }}>
        {[
          { id: 'positions', label: `ACTIVE_VECTORS (${positions.length})` },
          { id: 'history', label: `HISTORICAL_DATA (${history.length})` }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ 
              background: activeTab === t.id ? '#fff' : '#000', 
              color: activeTab === t.id ? '#000' : 'var(--text-dim)',
              border: 'none', padding: '12px 24px', fontSize: 9, fontWeight: 900, cursor: 'pointer', letterSpacing: 1
            }}>{t.label}</button>
        ))}
      </div>

      <div style={{ border: '2px solid var(--border)', background: '#000' }}>
        <div className="v4-scroller" style={{ overflowX: 'auto' }}>
          {activeTab === 'positions' ? (
            positions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                 <div style={{ fontSize: 40, marginBottom: 24, opacity: 0.1, color: '#fff' }}>📊</div>
                 <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 12 }}>SURVEILLANCE_SILENT</div>
                 <button style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 24px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }} 
                   onClick={() => setShowModal(true)}>INITIALIZE_PROTOCOL</button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#080808', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>ASSET_NODE</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>VECTOR</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>QUANTITY</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>ENTRY</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>MARKET</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>DELTA</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>PROTOCOL</th>
                  </tr>
                </thead>
                <tbody>{positions.map(p => <PositionRow key={p.id} pos={p} />)}</tbody>
              </table>
            )
          ) : (
            history.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '100px 0' }}>
                 <div style={{ fontSize: 11, fontWeight: 900, color: '#4a5e78', letterSpacing: 2 }}>CORE_HISTORY_VOID</div>
               </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#080808', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>COIN_ID</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>SIDE</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>QTY</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>ENTRY</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>EXIT</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>RESULT</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>DELTA %</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }} className="v4-row">
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={h.logo} width={20} height={20} style={{ borderRadius:'2px', background:'#fff' }} />
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 12, color: '#fff', fontFamily: 'var(--font-mono)' }}>{h.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                         <span style={{ fontSize: 8, fontWeight: 900, color: h.type === 'long' ? 'var(--green)' : 'var(--red)' }}>{h.type.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{h.quantity}</td>
                      <td style={{ padding: '14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>{formatCurrency(h.entryPrice)}</td>
                      <td style={{ padding: '14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{formatCurrency(h.exitPrice)}</td>
                      <td style={{ padding: '14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: h.pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 900 }}>{h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}</td>
                      <td style={{ padding: '14px', textAlign: 'right', fontSize: 11, fontWeight: 900, color: h.returnPct >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatPercent(h.returnPct)}</td>
                      <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{new Date(h.closedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {showModal && <OrderModal listings={listings} onClose={() => setShowModal(false)} />}

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-strong); }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: 20, background: '#000', border: '2px solid var(--border)' }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', marginTop: 6, opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  );
}
