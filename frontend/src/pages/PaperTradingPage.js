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
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    if (history.length < 2) {
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '12px Arial'; ctx.textAlign = 'center';
      ctx.fillText('Close trades to see equity curve', W / 2, H / 2);
      return;
    }

    // Build cumulative equity points
    let cum = initial;
    const pts = [initial, ...history.slice().reverse().map(h => (cum += h.pnl, cum))];
    const min = Math.min(...pts) * 0.995;
    const max = Math.max(...pts) * 1.005;
    const toX = (i) => (i / (pts.length - 1)) * W;
    const toY = (v) => H - ((v - min) / (max - min)) * H;
    const isProfit = pts[pts.length - 1] >= initial;
    const lineColor = isProfit ? '#00d4aa' : '#ff4757';

    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, lineColor + '30'); grad.addColorStop(1, lineColor + '00');
    ctx.beginPath();
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2; ctx.stroke();

    // Baseline
    const baseY = toY(initial);
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke(); ctx.setLineDash([]);
  }, [history, initial]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

function OrderModal({ listings, onClose }) {
  const { balance, openPosition } = usePaperTrading();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [side, setSide] = useState('long');
  const [qty, setQty] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

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

  const pctButtons = [25, 50, 75, 100];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">📊 Place Paper Trade</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '8px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available Balance</span>
          <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(balance)}</span>
        </div>

        {/* Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['long', '📈 LONG (Buy)', 'var(--green)'], ['short', '📉 SHORT (Sell)', 'var(--red)']].map(([v, label, color]) => (
            <button key={v} onClick={() => setSide(v)} type="button"
              style={{ padding: '10px', borderRadius: 8, border: `2px solid ${side === v ? color : 'var(--border)'}`, background: side === v ? color + '15' : 'var(--bg-input)', color: side === v ? color : 'var(--text-secondary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: '0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Coin search */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Coin</label>
          <input className="form-input" placeholder="Search…" value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }} />
          {search && !selected && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
              {filtered.map(c => (
                <div key={c.id} onMouseDown={() => { setSelected(c); setSearch(c.name); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <img src={c.logo} alt={c.symbol} width={22} height={22} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 12 }}>{formatCurrency(c.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label className="form-label">Quantity {selected && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>@ {formatCurrency(selected.price)}</span>}</label>
          <input className="form-input" type="number" step="any" placeholder="0.00" value={qty}
            onChange={e => setQty(e.target.value)} />
          {selected && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {pctButtons.map(p => (
                <button key={p} type="button" onClick={() => setQty(((balance * p / 100) / selected.price).toFixed(6))}
                  style={{ flex: 1, padding: '4px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>
                  {p}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SL / TP */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stop Loss (optional)</label>
            <input className="form-input" type="number" step="any" placeholder="Price" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Take Profit (optional)</label>
            <input className="form-input" type="number" step="any" placeholder="Price" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} />
          </div>
        </div>

        {/* Order summary */}
        {selected && qty && (
          <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '12px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order Total</span>
              <span style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{formatCurrency(cost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Balance After</span>
              <span style={{ fontFamily: 'Space Mono', color: balance - cost >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(balance - cost)}</span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleOpen}
            style={{ background: side === 'long' ? 'var(--green)' : 'var(--red)' }}>
            {side === 'long' ? '📈 Open Long' : '📉 Open Short'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PositionRow({ pos }) {
  const { closePosition, setStopLoss, setTakeProfit, livePrices } = usePaperTrading();
  const cp = livePrices[pos.symbol] || pos.entryPrice;
  const pnl = pos.type === 'long' ? (cp - pos.entryPrice) * pos.quantity : (pos.entryPrice - cp) * pos.quantity;
  const pnlPct = (pnl / (pos.entryPrice * pos.quantity)) * 100;
  const isUp = pnl >= 0;

  return (
    <tr>
      <td>
        <div className="coin-cell">
          <img src={pos.logo} alt={pos.symbol} className="coin-logo" onError={e => e.target.style.display = 'none'} />
          <div><div className="coin-name">{pos.coinName}</div><div className="coin-symbol">{pos.symbol}</div></div>
        </div>
      </td>
      <td><span className={`badge ${pos.type === 'long' ? 'badge-green' : 'badge-red'}`}>{pos.type.toUpperCase()}</span></td>
      <td style={{ fontFamily: 'Space Mono' }}>{pos.quantity}</td>
      <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(pos.entryPrice)}</td>
      <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(cp)}</td>
      <td style={{ fontFamily: 'Space Mono', color: isUp ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
        {isUp ? '+' : ''}{formatCurrency(pnl)}<br />
        <span style={{ fontSize: 11 }}>{formatPercent(pnlPct)}</span>
      </td>
      <td style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)' }}>
        {pos.stopLoss ? formatCurrency(pos.stopLoss) : '—'}
      </td>
      <td style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)' }}>
        {pos.takeProfit ? formatCurrency(pos.takeProfit) : '—'}
      </td>
      <td>
        <button className="btn btn-danger btn-sm" onClick={() => closePosition(pos.id, cp)}>Close</button>
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
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Paper Trading <span style={{ fontSize: 13, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, marginLeft: 8, fontWeight: 500 }}>SIMULATION</span></div>
          <div className="page-subtitle">Practice trading with $100,000 virtual money — no real risk</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={resetAccount}>Reset Account</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Trade</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{formatCurrency(balance)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Positions Value</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{formatCurrency(totalEquity)}</div>
          <div className={`stat-change ${totalPnL >= 0 ? 'positive' : 'negative'}`}>{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)} open P&L</div>
        </div>
        <div className={`stat-card ${allTimeReturn >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Total Return</div>
          <div className={`stat-value ${allTimeReturn >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: 18 }}>{formatPercent(allTimeReturn)}</div>
          <div className="stat-change neutral">{formatCurrency(totalValue)} total</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{winRate.toFixed(0)}%</div>
          <div className="stat-change neutral">{wins}/{totalTrades} trades</div>
        </div>
        <div className={`stat-card ${netPnL >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Realized P&L</div>
          <div className={`stat-value ${netPnL >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: 18 }}>{netPnL >= 0 ? '+' : ''}{formatCurrency(netPnL)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 24 }}>
        {/* Equity Curve */}
        <div className="card">
          <div className="card-header"><span className="card-title">Equity Curve</span></div>
          <div style={{ height: 180 }}><EquityCurve history={history} initial={INITIAL_BALANCE} /></div>
        </div>
        {/* Stats Panel */}
        <div className="card">
          <div className="card-header"><span className="card-title">Performance</span></div>
          {[
            ['Avg Win', formatCurrency(avgWin), 'var(--green)'],
            ['Avg Loss', formatCurrency(avgLoss), 'var(--red)'],
            ['Profit Factor', avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '∞', 'var(--accent)'],
            ['Open Positions', positions.length, 'var(--text-primary)'],
            ['Closed Trades', totalTrades, 'var(--text-secondary)'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: 13, fontFamily: 'Space Mono', fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'positions' ? 'active' : ''}`} onClick={() => setActiveTab('positions')}>Open Positions ({positions.length})</button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Trade History ({history.length})</button>
      </div>

      {activeTab === 'positions' && (
        <div className="card" style={{ padding: 0 }}>
          {positions.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
              <h3>No open positions</h3>
              <p>Click "New Trade" to open your first paper trade</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Coin</th><th>Side</th><th>Qty</th><th>Entry</th>
                  <th>Current</th><th>P&L</th><th>Stop Loss</th><th>Take Profit</th><th>Action</th>
                </tr></thead>
                <tbody>{positions.map(p => <PositionRow key={p.id} pos={p} />)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card" style={{ padding: 0 }}>
          {history.length === 0 ? (
            <div className="empty-state"><h3>No closed trades yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Coin</th><th>Side</th><th>Qty</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Return</th><th>Closed</th>
                </tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td><div className="coin-cell"><img src={h.logo} alt={h.symbol} className="coin-logo" onError={e => e.target.style.display = 'none'} /><div><div className="coin-name">{h.coinName}</div><div className="coin-symbol">{h.symbol}</div></div></div></td>
                      <td><span className={`badge ${h.type === 'long' ? 'badge-green' : 'badge-red'}`}>{h.type.toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'Space Mono' }}>{h.quantity}</td>
                      <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(h.entryPrice)}</td>
                      <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(h.exitPrice)}</td>
                      <td style={{ fontFamily: 'Space Mono', color: h.pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}</td>
                      <td><span className={`badge ${h.returnPct >= 0 ? 'badge-green' : 'badge-red'}`}>{formatPercent(h.returnPct)}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(h.closedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && <OrderModal listings={listings} onClose={() => setShowModal(false)} />}
    </div>
  );
}
