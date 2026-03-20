import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPortfolio, addToPortfolio, deletePortfolioItem, getListings } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

function SummaryCard({ label, value, sub, cls, icon }) {
  const accent = cls === 'red' ? 'var(--red)' : cls === 'green' ? 'var(--green)' : cls === 'blue' ? 'var(--blue)' : 'var(--text-primary)';
  return (
    <div className="card portfolio-stat" style={{ padding: '20px', borderLeft: `4px solid ${accent}`, background: '#080808' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>{label}</div>
        <div style={{ fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 9, color: accent, fontWeight: 800, marginTop: 8, letterSpacing: 1 }}>{sub}</div>
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
    if (!form.coinId) return toast.error('PROTOCOL_ERR: ASSET_UNDEFINED');
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } catch(err) {
      toast.error('DEPLOYMENT_FAILURE');
    } finally { setLoading(false); }
  };

  return (
    <div className="v4-modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.85)' }}>
      <div className="cmd-palette" style={{ maxWidth: '520px', padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '2px solid var(--border)', background: '#000' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 3, marginBottom: 8 }}>NODE_INITIALIZATION_v4.2</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>DEPLOY_ASSET_NODE</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, background: '#080808' }}>
          <div className="v4-field">
            <label style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, display: 'block' }}>LIQUIDITY_SCAN</label>
            <div className="v4-input-box" style={{ border: '2px solid var(--border)', padding: '0 12px' }}>
               <input autoFocus value={search} onChange={e => { setSearch(e.target.value); setForm(f => ({ ...f, coinId: '' })); }} placeholder="SCAN_NETWORK_FOR_ASSET..." 
                  style={{ width: '100%', height: '48px', background: 'none', border: 'none', color: '#fff', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
            </div>
            {search && !form.coinId && filtered.length > 0 && (
              <div className="v4-search-drop v4-card" style={{ border: '2px solid var(--border-strong)', background: '#000' }}>
                {filtered.map(coin => (
                  <div key={coin.id} className="v4-search-item" onClick={() => selectCoin(coin)} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <img src={coin.logo} alt="" width={20} height={20} style={{ borderRadius: '2px' }} />
                    <div style={{ flex: 1, marginLeft: 12 }}>
                       <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{coin.symbol}</div>
                       <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>{coin.name}</div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 800 }}>{formatCurrency(coin.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="v4-field">
              <label style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, display: 'block' }}>ALLOCATION_SIZE</label>
              <div className="v4-input-box" style={{ border: '2px solid var(--border)', padding: '0 12px' }}>
                <input type="number" step="any" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0.00" 
                  style={{ width: '100%', height: '48px', background: 'none', border: 'none', color: '#fff', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>
            </div>
            <div className="v4-field">
              <label style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 10, display: 'block' }}>BASIS_PRICE</label>
              <div className="v4-input-box" style={{ border: '2px solid var(--border)', padding: '0 12px' }}>
                <input type="number" step="any" required value={form.buyPrice} onChange={e => setForm({...form, buyPrice: e.target.value})} placeholder="0.00" 
                  style={{ width: '100%', height: '48px', background: 'none', border: 'none', color: '#fff', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>
            </div>
          </div>

          {form.coinId && form.quantity && form.buyPrice && (
            <div className="v4-preview-box" style={{ padding: '16px', border: '1px solid var(--border)', background: '#000', textAlign: 'center' }}>
               <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>ESTIMATED_NOTIONAL_v4</div>
               <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(form.quantity * form.buyPrice)}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-success" style={{ padding: '16px', fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>
            {loading ? 'SYNCHRONIZING...' : 'INITIALIZE_DEPLOYMENT'}
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
    toast.success('ASSET_NODE_AUTHORIZED');
    fetchData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`DECOMMISSION ${name.toUpperCase()} FROM CORE_TERMINAL?`)) return;
    try {
      await deletePortfolioItem(id);
      toast.success('NODE_DECOMMISSIONED');
      fetchData();
    } catch (e) { toast.error('DECOMMISSION_FAILURE'); }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div className="v4-ping-large" />
    </div>
  );

  const { summary, items = [] } = portfolio || { summary: {}, items: [] };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            <header className="v4-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>STRUCTURAL_VAULT_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>ASSET_INVENTORY_CORE</h1>
        </div>
        <button className="btn-success" onClick={() => setShowModal(true)} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>+ INITIALIZE_POSITION</button>
      </header>

      <div className="v4-stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <SummaryCard label="TACTICAL_EQUITY" value={formatCurrency(summary.totalValue)} sub={`${formatPercent(summary.totalPnLPct)} 24H`} cls="blue" icon="⬢" />
        <SummaryCard label="NODE_CAPITAL" value={formatCurrency(summary.totalInvested)} sub={`${items.length} ACTIVE_NODES`} cls="white" icon="💰" />
        <SummaryCard label="NET_ALPHA_YIELD" value={formatCurrency(summary.totalPnL)} sub="UNREALIZED_P&L" cls={summary.totalPnL >= 0 ? 'green' : 'red'} icon="📈" />
        <SummaryCard label="PROTOCOL_SCORE" value={formatPercent(summary.totalPnLPct)} sub="BETA_ALIGNMENT" cls={summary.totalPnLPct >= 0 ? 'green' : 'red'} icon="🧬" />
      </div>
       <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ACTIVE_TERMINAL_DEPLOYS // {items.length} NODES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800 }}>ORACLE_STREAMING_v4.2</span>
             <div className="v4-status-ping-small" style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 10px var(--green)' }} />
          </div>
        </div>

        <div className="v4-table-wrap v4-scroller">
          <table className="v4-premium-table">
            <thead>
              <tr style={{ background: '#080808' }}>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'left' }}>ASSET_NODE</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>QUANTITY</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>BASIS_PRICE</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>SPOT_PRICE</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>TOTAL_VAL</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'center' }}>P&L_GRADIENT</th>
                <th style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '120px 0' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 900, letterSpacing: 2 }}>VAULT_EMPTY: NO_ACTIVE_CHANNELS</div>
                  </td>
                </tr>
              ) : items.map((item, i) => (
                <tr key={item._id} className="v4-row" style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }}>
                  <td style={{ padding: '20px' }}>
                    <div className="v4-asset-cell" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className="v4-asset-icon" style={{ position: 'relative' }}>
                        <img src={item.logo} alt="" style={{ width: 32, height: 32, borderRadius: '2px', border: '1px solid var(--border)' }} onError={e => e.target.style.display='none'} />
                      </div>
                      <div>
                        <div className="v4-asset-symbol" style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{item.symbol}/USDT</div>
                        <div className="v4-asset-name" style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="right v4-mono" style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', fontWeight: 700 }}>{item.quantity}</td>
                  <td className="right v4-mono sub" style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>{formatCurrency(item.buyPrice)}</td>
                  <td className="right v4-mono highlight" style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', fontWeight: 800 }}>{formatCurrency(item.currentPrice)}</td>
                  <td className="right v4-mono primary" style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue)', fontWeight: 900 }}>{formatCurrency(item.currentValue)}</td>
                  <td className="center" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className={`v4-pl-badge ${item.profitLoss >= 0 ? 'up' : 'down'}`} style={{ 
                      display: 'inline-flex', flexDirection: 'column', padding: '6px 12px', border: `1px solid ${item.profitLoss >= 0 ? 'var(--green)' : 'var(--red)'}`,
                      background: item.profitLoss >= 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: item.profitLoss >= 0 ? 'var(--green)' : 'var(--red)',
                      fontWeight: 900, fontSize: 10, fontFamily: 'var(--font-mono)'
                    }}>
                       <div>{item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}</div>
                       <div style={{ fontSize: 9, opacity: 0.8 }}>{formatPercent(item.profitPct)}</div>
                    </div>
                  </td>
                  <td className="right" style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="v4-row-btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 12px', fontSize: 9, fontWeight: 900 }}>OPTIMIZE</button>
                      <button className="v4-row-btn" onClick={() => handleDelete(item._id, item.name)} style={{ background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', padding: '6px 12px', fontSize: 9, fontWeight: 900 }}>CLOSE_POS</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddAssetModal listings={listings} onAdd={handleAdd} onClose={() => setShowModal(false)} />}

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
        .v4-modal-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); }
        .v4-table-wrap { max-height: 600px; overflow-y: auto; }
        .v4-premium-table th { background: #080808; position: sticky; top: 0; z-index: 10; cursor: default; }
        .v4-scroller::-webkit-scrollbar { width: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-light); }
      `}</style>
    </div>
  );
}
