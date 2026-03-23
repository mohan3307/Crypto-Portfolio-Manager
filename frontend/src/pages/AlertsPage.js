import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useMarket } from '../context/MarketContext';
import { useAlerts } from '../context/AlertsContext';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

function CreateAlertModal({ listings, onClose }) {
  const { addAlert, requestPermission } = useAlerts();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState('above');
  const [value, setValue] = useState('');

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Please select an asset');
    if (!value || isNaN(value)) return toast.error('Please enter a valid price');
    await requestPermission();
    try {
      await addAlert({ symbol: selected.symbol, coinName: selected.name, type, value, note: '' });
      toast.success('Price alert set');
      onClose();
    } catch (err) { toast.error('Failed to set alert'); }
  };

  return (
    <div className="v4-modal-overlay" onClick={onClose}>
      <div className="card-cmc" style={{ maxWidth: 480, padding: 0, borderRadius: 20 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--cmc-border)', background: 'var(--bg-input)' }}>
           <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Create Price Alert</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10 }}>Select Asset</label>
            <input autoFocus value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} placeholder="Search coin..." 
                   style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, color: '#fff' }} />
            
            {search && !selected && filtered.length > 0 && (
              <div style={{ position: 'absolute', left: 32, right: 32, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--cmc-border)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                {filtered.map(c => (
                  <div key={c.id} onClick={() => { setSelected(c); setSearch(c.name); setValue(c.price.toFixed(4)); }}
                       style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>
                    <img src={c.logo} width={20} height={20} style={{ borderRadius: '50%' }} />
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{c.name} ({c.symbol})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
             <label style={{ display: 'block', fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10 }}>Condition</label>
             <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setType('above')} style={{ flex: 1, padding: '10px', borderRadius: 10, background: type === 'above' ? 'var(--cmc-blue)' : 'var(--bg-input)', border: 'none', color: '#fff', fontWeight: 700 }}>Above</button>
                <button type="button" onClick={() => setType('below')} style={{ flex: 1, padding: '10px', borderRadius: 10, background: type === 'below' ? 'var(--cmc-blue)' : 'var(--bg-input)', border: 'none', color: '#fff', fontWeight: 700 }}>Below</button>
             </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10 }}>Price ($)</label>
            <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} 
                   style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, color: '#fff', fontSize: 18, fontWeight: 800 }} />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: 12, fontWeight: 800 }}>Create Alert</button>
        </form>
      </div>
    </div>
  );
}

function AlertCard({ alert, currentPrice }) {
  const { removeAlert, toggleAlert } = useAlerts();
  const typeColor = alert.type === 'above' ? 'var(--cmc-green)' : 'var(--cmc-red)';
  
  return (
    <div className="card-cmc" style={{ padding: '20px 24px', opacity: alert.active ? 1 : 0.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
             {alert.triggered ? '🔔' : '📡'}
           </div>
           <div>
             <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{alert.symbol}</div>
             <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
               Price is {alert.type} {formatCurrency(alert.value)}
             </div>
           </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
           <button onClick={() => toggleAlert(alert._id)} style={{ padding: '6px 12px', border: '1px solid var(--cmc-border)', background: 'none', color: 'var(--text-muted)', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{alert.active ? 'Pause' : 'Resume'}</button>
           <button onClick={() => removeAlert(alert._id)} style={{ padding: '6px 12px', border: 'none', background: 'var(--red-bg)', color: 'var(--cmc-red)', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
         <span>Current Price: <span style={{ color: '#fff' }}>{currentPrice ? formatCurrency(currentPrice) : '...'}</span></span>
         <span style={{ color: typeColor }}>{alert.triggered ? 'TRIGGERED' : 'TRACKING'}</span>
      </div>
      <div style={{ height: 6, width: '100%', background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
         <div style={{ height: '100%', width: alert.triggered ? '100%' : '65%', background: alert.triggered ? 'var(--cmc-blue)' : typeColor }} />
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, loading } = useAlerts();
  const { listings, prices } = useMarket();
  const [showModal, setShowModal] = useState(false);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>REAL-TIME NOTIFICATIONS</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Price Alerts</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 28px', fontSize: 13, borderRadius: 12, fontWeight: 800 }}>+ Create Alert</button>
      </header>

      <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
        <div className="card-cmc" style={{ flex: 1, padding: 24 }}>
           <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Total Alerts</div>
           <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{alerts.length}</div>
        </div>
        <div className="card-cmc" style={{ flex: 1, padding: 24 }}>
           <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Active</div>
           <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--cmc-green)' }}>{alerts.filter(a => a.active && !a.triggered).length}</div>
        </div>
        <div className="card-cmc" style={{ flex: 1, padding: 24 }}>
           <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Triggered</div>
           <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--cmc-blue)' }}>{alerts.filter(a => a.triggered).length}</div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card-cmc" style={{ textAlign: 'center', padding: '100px 0', borderRadius: 20 }}>
           <div style={{ fontSize: 48, marginBottom: 24 }}>🔔</div>
           <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>No alerts set</div>
           <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>Stay on top of the market by setting price targets for your favorite coins.</p>
           <button className="btn-primary" style={{ marginTop: 32, padding: '12px 32px', borderRadius: 12 }} onClick={() => setShowModal(true)}>Set First Alert</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {alerts.map(alert => (
            <AlertCard key={alert._id} alert={alert} currentPrice={prices[alert.symbol]} />
          ))}
        </div>
      )}

      {showModal && <CreateAlertModal listings={listings} onClose={() => setShowModal(false)} />}
    </div>
  );
}
