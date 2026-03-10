import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAlerts } from '../context/AlertsContext';
import { getListings } from '../services/api';
import { formatCurrency } from '../utils/format';

function CreateAlertModal({ listings, onClose }) {
  const { addAlert, requestPermission } = useAlerts();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState('above');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Select a coin first');
    if (!value || isNaN(value)) return toast.error('Enter a valid price');
    await requestPermission();
    addAlert({ symbol: selected.symbol, coinName: selected.name, type, value, note });
    onClose();
  };

  const currentPrice = selected?.price;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <span className="modal-title">🔔 Create Price Alert</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Coin search */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Cryptocurrency</label>
          <input className="form-input" placeholder="Search coin…"
            value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} />
          {search && !selected && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', maxHeight: 220, overflowY: 'auto' }}>
              {filtered.map(c => (
                <div key={c.id} onMouseDown={() => { setSelected(c); setSearch(c.name); setValue(c.price.toFixed(2)); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <img src={c.logo} alt={c.symbol} width={24} height={24} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Space Mono' }}>{c.symbol}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 12 }}>{formatCurrency(c.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current price</span>
            <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(currentPrice)}</span>
          </div>
        )}

        {/* Alert type */}
        <div className="form-group">
          <label className="form-label">Alert Condition</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['above', '📈 Price goes ABOVE', 'var(--green)'], ['below', '📉 Price drops BELOW', 'var(--red)']].map(([v, label, color]) => (
              <button key={v} type="button" onClick={() => setType(v)}
                style={{ padding: '10px 12px', borderRadius: 8, border: `2px solid ${type === v ? color : 'var(--border)'}`, background: type === v ? color + '15' : 'var(--bg-input)', color: type === v ? color : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Target Price (USD)</label>
          <input className="form-input" type="number" step="any" placeholder="0.00"
            value={value} onChange={e => setValue(e.target.value)} />
          {selected && value && !isNaN(value) && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {type === 'above' ? '▲' : '▼'} {Math.abs(((parseFloat(value) - currentPrice) / currentPrice) * 100).toFixed(2)}% from current price
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input className="form-input" placeholder="e.g. Breakout level, Support zone…" value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>🔔 Create Alert</button>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert, currentPrice }) {
  const { removeAlert, toggleAlert } = useAlerts();
  const progress = currentPrice && alert.type !== 'change_pct'
    ? Math.min(100, Math.max(0, alert.type === 'above'
        ? (currentPrice / alert.value) * 100
        : (alert.value / currentPrice) * 100))
    : 0;
  const isClose = progress > 85 && !alert.triggered;
  const typeColor = alert.type === 'above' ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${alert.triggered ? 'rgba(245,158,11,0.3)' : alert.active ? 'var(--border)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '16px 18px', opacity: alert.active ? 1 : 0.55, transition: '0.2s',
      borderLeft: `3px solid ${alert.triggered ? 'var(--gold)' : alert.active ? typeColor : 'var(--border)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{alert.triggered ? '✅' : alert.active ? '🔔' : '🔕'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.coinName} <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>({alert.symbol})</span></div>
            <div style={{ fontSize: 12, color: typeColor, fontWeight: 600 }}>
              {alert.type === 'above' ? '↑ Above' : '↓ Below'} {formatCurrency(alert.value)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!alert.triggered && (
            <button onClick={() => toggleAlert(alert.id)} title={alert.active ? 'Pause' : 'Resume'}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
              {alert.active ? '⏸' : '▶'}
            </button>
          )}
          <button onClick={() => removeAlert(alert.id)}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--red-bg)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!alert.triggered && currentPrice && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Current: <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Mono' }}>{formatCurrency(currentPrice)}</span></span>
            <span style={{ color: isClose ? 'var(--gold)' : 'var(--text-muted)' }}>{isClose ? '⚡ Getting close!' : `${progress.toFixed(0)}%`}</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-input)', borderRadius: 2 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: isClose ? 'var(--gold)' : typeColor, borderRadius: 2, transition: '0.5s ease' }} />
          </div>
        </div>
      )}

      {alert.triggered && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          ✅ Triggered at {formatCurrency(alert.triggeredPrice)} · {new Date(alert.triggeredAt).toLocaleString()}
        </div>
      )}

      {alert.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>"{alert.note}"</div>}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Created {new Date(alert.createdAt).toLocaleDateString()}</div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, clearTriggered } = useAlerts();
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getListings().then(res => {
      const data = res.data.data;
      setListings(data);
      const p = {}; data.forEach(c => { p[c.symbol] = c.price; });
      setPrices(p);
    });
    const i = setInterval(() => {
      getListings().then(res => { const p = {}; res.data.data.forEach(c => { p[c.symbol] = c.price; }); setPrices(p); });
    }, 15000);
    return () => clearInterval(i);
  }, []);

  const filtered = alerts.filter(a =>
    filter === 'all' ? true : filter === 'active' ? a.active && !a.triggered : a.triggered
  );
  const activeCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Price Alerts <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 8 }}>{activeCount} active</span></div>
          <div className="page-subtitle">Real-time notifications when prices hit your targets</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {triggeredCount > 0 && (
            <button className="btn btn-ghost" onClick={clearTriggered}>Clear Triggered ({triggeredCount})</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Alert</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Alerts</div>
          <div className="stat-value">{alerts.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Active</div>
          <div className="stat-value">{activeCount}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Triggered</div>
          <div className="stat-value">{triggeredCount}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {[['all', 'All'], ['active', '🔔 Active'], ['triggered', '✅ Triggered']].map(([v, l]) => (
          <button key={v} className={`tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {/* Browser notification prompt */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius)', padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13 }}>🔔 Enable browser notifications to get alerts even when this tab isn't focused</span>
          <button className="btn btn-primary btn-sm" onClick={() => Notification.requestPermission()}>Enable</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <h3>No alerts yet</h3>
            <p>Set price alerts and get notified when your targets are hit</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>Create First Alert</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} currentPrice={prices[alert.symbol]} />
          ))}
        </div>
      )}

      {showModal && <CreateAlertModal listings={listings} onClose={() => setShowModal(false)} />}
    </div>
  );
}
