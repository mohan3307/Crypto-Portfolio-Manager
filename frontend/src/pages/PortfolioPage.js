import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPortfolio, addToPortfolio, deletePortfolioItem, getListings } from '../services/api';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';

function AddCoinModal({ listings, onAdd, onClose }) {
  const [form, setForm] = useState({ coinId: '', symbol: '', name: '', logo: '', quantity: '', buyPrice: '', buyDate: '', notes: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = listings.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const selectCoin = (coin) => {
    setForm(f => ({ ...f, coinId: String(coin.id), symbol: coin.symbol, name: coin.name, logo: coin.logo || '', buyPrice: coin.price.toFixed(2) }));
    setSearch(coin.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coinId) return toast.error('Please select a coin');
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } catch(err) {
      toast.error(err.response?.data?.error || 'Failed to add coin');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add to Portfolio</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Select Cryptocurrency</label>
            <input className="form-input" placeholder="Search coin..." value={search}
              onChange={e => { setSearch(e.target.value); setForm(f => ({ ...f, coinId: '' })); }} />
            {search && !form.coinId && filtered.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                {filtered.map(coin => (
                  <div key={coin.id} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onMouseDown={() => selectCoin(coin)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <img src={coin.logo} alt={coin.symbol} width="24" height="24" style={{ borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                    <span style={{ fontWeight: 600 }}>{coin.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{coin.symbol}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: '12px' }}>{formatCurrency(coin.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" step="any" placeholder="0.00"
                value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Price (USD)</label>
              <input className="form-input" type="number" step="any" placeholder="0.00"
                value={form.buyPrice} onChange={e => setForm({...form, buyPrice: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Buy Date</label>
            <input className="form-input" type="date" value={form.buyDate}
              onChange={e => setForm({...form, buyDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input className="form-input" placeholder="e.g. Long term hold" value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          {form.coinId && form.quantity && form.buyPrice && (
            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Investment</span>
                <strong>{formatCurrency(form.quantity * form.buyPrice)}</strong>
              </div>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : '+ Add to Portfolio'}
            </button>
          </div>
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

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i); }, []);

  const handleAdd = async (form) => {
    await addToPortfolio({ ...form, quantity: parseFloat(form.quantity), buyPrice: parseFloat(form.buyPrice) });
    toast.success(`${form.name} added to portfolio!`);
    fetchData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from portfolio?`)) return;
    try {
      await deletePortfolioItem(id);
      toast.success('Removed from portfolio');
      fetchData();
    } catch (e) { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const { summary, items } = portfolio || { summary: {}, items: [] };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Portfolio</div>
          <div className="page-subtitle">{items.length} assets tracked</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Coin</button>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Value</div>
          <div className="stat-value" style={{ fontSize: '20px' }}>{formatCurrency(summary.totalValue)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value" style={{ fontSize: '20px' }}>{formatCurrency(summary.totalInvested)}</div>
        </div>
        <div className={`stat-card ${summary.totalPnL >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Profit / Loss</div>
          <div className={`stat-value ${getChangeClass(summary.totalPnL)}`} style={{ fontSize: '20px' }}>
            {summary.totalPnL >= 0 ? '+' : ''}{formatCurrency(summary.totalPnL)}
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Return</div>
          <div className={`stat-value ${getChangeClass(summary.totalPnLPct)}`} style={{ fontSize: '20px' }}>
            {formatPercent(summary.totalPnLPct)}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Holdings</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updates every 30s</span>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No holdings yet</h3>
            <p>Add your first cryptocurrency to start tracking</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>+ Add First Coin</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Quantity</th>
                  <th>Buy Price</th>
                  <th>Current Price</th>
                  <th>Total Invested</th>
                  <th>Current Value</th>
                  <th>Profit / Loss</th>
                  <th>Return %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="coin-cell">
                        <img src={item.logo} alt={item.symbol} className="coin-logo"
                          onError={e => { e.target.style.display = 'none'; }} />
                        <div>
                          <div className="coin-name">{item.name}</div>
                          <div className="coin-symbol">{item.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Space Mono' }}>{item.quantity}</td>
                    <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(item.buyPrice)}</td>
                    <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(item.currentPrice)}</td>
                    <td style={{ fontFamily: 'Space Mono' }}>{formatCurrency(item.totalInvestment)}</td>
                    <td style={{ fontFamily: 'Space Mono', fontWeight: 600 }}>{formatCurrency(item.currentValue)}</td>
                    <td className={getChangeClass(item.profitLoss)} style={{ fontFamily: 'Space Mono', fontWeight: 600 }}>
                      {item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}
                    </td>
                    <td>
                      <span className={`badge ${item.profitPct >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {formatPercent(item.profitPct)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id, item.name)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddCoinModal listings={listings} onAdd={handleAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
}
