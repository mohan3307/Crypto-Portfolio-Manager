import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPortfolio, addToPortfolio, deletePortfolioItem, getListings } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';


function SummaryCard({ label, value, sub, cls }) {
  const accent = cls === 'red' ? 'var(--cmc-red)' : cls === 'green' ? 'var(--cmc-green)' : 'var(--cmc-blue)';
  return (
    <div className="card-cmc" style={{ padding: '24px', flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function AddAssetModal({ listings, onAdd, onClose }) {
  const [form, setForm] = useState({ coinId: '', symbol: '', name: '', logo: '', quantity: '', buyPrice: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6);

  const selectCoin = (coin) => {
    setForm(f => ({ ...f, coinId: String(coin.id), symbol: coin.symbol, name: coin.name, logo: coin.logo || '', buyPrice: coin.price }));
    setSearch(coin.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coinId) return toast.error('Please select an asset');
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } catch(err) {
      toast.error('Failed to add asset');
    } finally { setLoading(false); }
  };

  return (
    <div className="v4-modal-overlay" onClick={onClose}>
      <div className="card-cmc" style={{ maxWidth: '480px', padding: 0, borderRadius: 24, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--cmc-border)', background: 'var(--bg-input)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Add Asset</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10, display: 'block' }}>Search Asset</label>
            <input autoFocus value={search} onChange={e => { setSearch(e.target.value); setForm(f => ({ ...f, coinId: '' })); }} placeholder="Search e.g. Bitcoin..." 
                   style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600 }} />
            
            {search && !form.coinId && filtered.length > 0 && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', 
                borderRadius: 12, marginTop: 8, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', 
                overflow: 'hidden' 
              }}>
                {filtered.map(coin => (
                  <div key={coin.id} className="v4-search-item" onClick={() => selectCoin(coin)} 
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--cmc-border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <img src={coin.logo} alt="" width={24} height={24} style={{ borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{coin.name}</div>
                       <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{coin.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10, display: 'block' }}>Quantity</label>
              <input type="number" step="any" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0.00" 
                     style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10, display: 'block' }}>Buy Price (USD)</label>
              <input type="number" step="any" required value={form.buyPrice} onChange={e => setForm({...form, buyPrice: e.target.value})} placeholder="0.00" 
                     style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600 }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800 }}>
            {loading ? 'Adding...' : 'Add to Portfolio'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const [p, l] = await Promise.all([getPortfolio(), getListings()]);
      setPortfolio(p.data);
      setListings(l.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i); }, []);

  const handleAdd = async (form) => {
    await addToPortfolio({ ...form, quantity: parseFloat(form.quantity), buyPrice: parseFloat(form.buyPrice) });
    toast.success('Asset added successfully');
    fetchData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} from your portfolio?`)) return;
    try {
      await deletePortfolioItem(id);
      toast.success('Asset removed');
      fetchData();
    } catch (e) { toast.error('Failed to remove asset'); }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div className="v4-ping-large" />
    </div>
  );

  const { summary, items = [] } = portfolio || { summary: {}, items: [] };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      
      <GlobalStats listings={listings} />

      <header className="v4-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0', borderBottom: 'none' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>TOTAL_BALANCE</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Portfolio</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 28px', fontSize: 13, borderRadius: 12, fontWeight: 800 }}>+ Add Asset</button>
      </header>

      <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
        <SummaryCard label="Current Balance" value={formatCurrency(summary.totalValue)} sub={`${formatPercent(summary.totalPnLPct)} total change`} cls="blue" />
        <SummaryCard label="Total Profit/Loss" value={formatCurrency(summary.totalPnL)} sub="Unrealized P&L" cls={summary.totalPnL >= 0 ? 'green' : 'red'} />
        <SummaryCard label="Total Invested" value={formatCurrency(summary.totalInvested)} sub={`${items.length} assets`} />
      </div>

       <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--cmc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Your Assets ( {items.length} )</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Asset</th>
                <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Price</th>
                <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Holdings</th>
                <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Avg. Cost</th>
                <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Profit/Loss</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>No assets found in portfolio.</div>
                  </td>
                </tr>
              ) : items.map((item) => (
                <tr key={item._id} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={item.logo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff' }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: 14 }}>{formatCurrency(item.currentPrice)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(item.currentValue)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.quantity.toLocaleString()} {item.symbol}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 13 }}>{formatCurrency(item.buyPrice)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ color: item.profitLoss >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontWeight: 800, fontSize: 14 }}>
                       {item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}
                    </div>
                    <div style={{ fontSize: 11, color: item.profitLoss >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', opacity: 0.8 }}>
                       {formatPercent(item.profitPct)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(item._id, item.name)} style={{ color: 'var(--cmc-red)', fontSize: 16, cursor: 'pointer', background: 'none' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {showModal && <AddAssetModal listings={listings} onAdd={handleAdd} onClose={() => setShowModal(false)} />}

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
        .v4-modal-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); }
        .v4-scroller::-webkit-scrollbar { width: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--cmc-border); }
      `}</style>
    </div>
  );
}
