import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useMarket } from '../context/MarketContext';
import { useAlerts } from '../context/AlertsContext';
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
  ).slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('PROTOCOL_ERR: TARGET_UNDEFINED');
    if (!value || isNaN(value)) return toast.error('PROTOCOL_ERR: INVALID_THRESHOLD');
    await requestPermission();
    try {
      await addAlert({ symbol: selected.symbol, coinName: selected.name, type, value, note });
      toast.success('NEURAL_VECTOR_INITIALIZED');
      onClose();
    } catch (err) { toast.error('DEPLOYMENT_ERROR'); }
  };

  return (
    <div className="v4-modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000 }}>
      <div className="cmd-palette" style={{ width: '100%', maxWidth: 480, padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '2px solid var(--border)', background: '#000' }}>
           <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>CONFIG_SURVEILLANCE_v4.2</div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>NEURAL_VECTOR_INIT</h2>
             <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 24, cursor: 'pointer' }}>✕</button>
           </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', background: '#080808', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, letterSpacing: 2 }}>TARGET_ASSET_NODE</label>
            <div style={{ border: '2px solid var(--border)', padding: '0 12px', background: '#000' }}>
              <input 
                autoFocus
                style={{ width: '100%', height: '48px', background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 14 }}
                placeholder="SCAN_NETWORK_FOR_ASSET..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }} 
              />
              {search && !selected && filtered.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 100, background: '#000', border: '2px solid var(--border-strong)', padding: 8 }}>
                  {filtered.map(c => (
                    <div key={c.id || c.symbol} onClick={() => { setSelected(c); setSearch(c.name); setValue(c.price.toFixed(4)); }}
                       style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                      <img src={c.logo} width={20} height={20} style={{ borderRadius: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 12, color: '#fff' }}>{c.symbol}/USDT</div>
                        <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>{c.name.toUpperCase()}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)', fontWeight: 800 }}>{formatCurrency(c.price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, letterSpacing: 2 }}>VECTOR_CONDITION</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {[
                { id: 'above', label: '▲ BREAKOUT', color: 'var(--green)' },
                { id: 'below', label: '▼ BREAKDOWN', color: 'var(--red)' }
              ].map(opt => (
                <button key={opt.id} type="button" onClick={() => setType(opt.id)}
                  style={{ 
                    padding: '14px', border: '2px solid var(--border)',
                    background: type === opt.id ? '#fff' : '#000',
                    color: type === opt.id ? '#000' : 'var(--text-dim)', 
                    fontWeight: 900, fontSize: 10, cursor: 'pointer', letterSpacing: 1
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, letterSpacing: 2 }}>PRICE_THRESHOLD (USDT)</label>
            <div style={{ border: '2px solid var(--border)', padding: '0 12px', background: '#000' }}>
              <input 
                type="number" step="any" placeholder="0.0000"
                value={value} onChange={e => setValue(e.target.value)} 
                style={{ width: '100%', height: '48px', background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900 }}
              />
            </div>
          </div>

          <button type="submit" className="btn-success" style={{ padding: '16px', fontSize: 11, fontWeight: 900, letterSpacing: 2, marginTop: 12 }}>ENGAGE_NEURAL_SURVEILLANCE</button>
        </form>
      </div>
    </div>
  );
}

function AlertCard({ alert, currentPrice }) {
  const { removeAlert, toggleAlert } = useAlerts();
  const progress = currentPrice 
    ? Math.min(100, Math.max(0, alert.type === 'above'
        ? (currentPrice / alert.value) * 100
        : (alert.value / currentPrice) * 100))
    : 0;
  const isCritical = progress > 90 && !alert.triggered;
  const typeColor = alert.type === 'above' ? '#10b981' : '#ff4d4d';

  return (
    <div className="card alert-card-v4" style={{ 
      padding: '20px 24px', borderLeft: `4px solid ${alert.triggered ? 'var(--gold)' : typeColor}`,
      background: '#080808', opacity: alert.active ? 1 : 0.5, transition: '0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <div style={{ fontSize: 16 }}>
             {alert.triggered ? '⚡' : alert.active ? '📡' : '⏸'}
           </div>
           <div>
             <div style={{ fontWeight: 900, fontSize: 13, color: '#fff', fontFamily: 'var(--font-mono)' }}>{alert.symbol}/USDT</div>
             <div style={{ fontSize: 8, color: typeColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
               VECTOR_{alert.type === 'above' ? 'BREAKOUT' : 'BREAKDOWN'} @ {formatCurrency(alert.value)}
             </div>
           </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
           {!alert.triggered && (
             <button onClick={() => toggleAlert(alert._id)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '4px 8px', fontSize: 9, cursor: 'pointer' }}>
               {alert.active ? 'PAUSE' : 'RESUME'}
             </button>
           )}
           <button onClick={() => removeAlert(alert._id)} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 8px', fontSize: 9, cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      {!alert.triggered ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 6 }}>
            <span>NODE_SPOT: <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{currentPrice ? formatCurrency(currentPrice) : 'SYNCING...'}</span></span>
            <span style={{ color: isCritical ? 'var(--gold)' : 'var(--text-dim)' }}>{isCritical ? 'CRITICAL_PROXIMITY' : `${progress.toFixed(1)}%`}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', width: '100%', borderRadius: 2 }}>
            <div style={{ 
              height: '100%', width: `${progress}%`, background: isCritical ? 'var(--gold)' : typeColor,
              borderRadius: 2, transition: '0.1s'
            }} />
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--gold)', padding: '10px 14px', marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>LATCH_HIT @ {formatCurrency(alert.triggeredPrice)}</div>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 4, fontWeight: 800 }}>UTC: {new Date(alert.triggeredAt).toISOString().split('T')[1].slice(0, 8)}</div>
        </div>
      )}

      {alert.note && <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 12, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>"{alert.note}"</div>}
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, loading } = useAlerts();
  const { listings, prices } = useMarket();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="v4-ping-large" />
    </div>
  );

  const filtered = alerts.filter(a =>
    filter === 'all' ? true : filter === 'active' ? a.active && !a.triggered : a.triggered
  );
  const activeCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>SURVEILLANCE_CENTER_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>NEURAL_THREAT_MONITOR</h1>
        </div>
        <button className="btn-success" onClick={() => setShowModal(true)} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>+ INITIALIZE_SURVEILLANCE</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--blue)', background: '#080808' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>TOTAL_MONITORS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{alerts.length}</div>
        </div>
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--green)', background: '#080808' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>ACTIVE_VECTORS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{activeCount}</div>
        </div>
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--gold)', background: '#080808' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>LATCHED_INTERSECTS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{triggeredCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 1, marginBottom: 32 }}>
        {[
          { id: 'all', label: 'ALL_VECTORS' },
          { id: 'active', label: 'ACTIVE_VECTORS' },
          { id: 'triggered', label: 'LATCH_HITS' }
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} 
            style={{ 
              background: filter === f.id ? '#fff' : '#000', 
              color: filter === f.id ? '#000' : 'var(--text-dim)',
              border: '2px solid var(--border)',
              padding: '10px 20px', fontSize: 9, fontWeight: 900, letterSpacing: 2
            }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="v4-card" style={{ textAlign: 'center', padding: '120px 0', borderStyle: 'dashed' }}>
           <div style={{ fontSize: 48, marginBottom: 24, opacity: 0.1, color: '#fff' }}>📡</div>
           <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>SURVEILLANCE_MATRIX_EMPTY</div>
           <p style={{ fontSize: 13, color: '#4a5e78', maxWidth: 450, margin: '0 auto', lineHeight: 1.6 }}>Initialize your first neural price vector to begin real-time terminal surveillance across all market nodes.</p>
           <button className="v4-deploy-btn" style={{ marginTop: 32 }} onClick={() => setShowModal(true)}>INITIALIZE_PRIMARY_VECTOR</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
          {filtered.map(alert => (
            <AlertCard key={alert._id} alert={alert} currentPrice={prices[alert.symbol]} />
          ))}
        </div>
      )}

      {showModal && <CreateAlertModal listings={listings} onClose={() => setShowModal(false)} />}

      <style>{`
        .alert-card-v4 { transition: 0.1s; border: 2px solid var(--border); }
        .alert-card-v4:hover { border-color: #fff; }
      `}</style>
    </div>
  );
}
