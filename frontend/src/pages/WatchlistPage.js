import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getWatchlist, removeFromWatchlist, getListings } from '../services/api';
import { formatCurrency } from '../utils/format';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [w, l] = await Promise.all([getWatchlist(), getListings()]);
      setWatchlist(w.data.coins);
      setListings(l.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchData(); 
    const i = setInterval(fetchData, 30000); 
    return () => clearInterval(i); 
  }, []);

  const handleRemove = async (coinId, name) => {
    try {
      await removeFromWatchlist(coinId);
      toast.success(`${name.toUpperCase()} MONITOR_DECOMMISSIONED`);
      fetchData();
    } catch (e) { toast.error('PROTOCOL_REJECTED'); }
  };

  const enrichedWatchlist = watchlist.map(wCoin => {
    const live = listings.find(l => String(l.id) === wCoin.coinId);
    return { ...wCoin, ...(live || {}) };
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
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>ACTIVE_SURVEILLANCE_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>MONITORED_VECTORS</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <div style={{ border: '2px solid var(--green)', color: 'var(--green)', padding: '8px 16px', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>
             SCANNING_NETWORK
           </div>
        </div>
      </header>

      {enrichedWatchlist.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '120px 0', border: '2px dashed var(--border)', background: '#080808' }}>
           <div style={{ fontSize: 48, marginBottom: 24, opacity: 0.1, color: '#fff' }}>👁️</div>
           <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: 1 }}>MONITOR_VOID_DETECTED</div>
           <div style={{ fontSize: 12, color: 'var(--text-dim)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
             Initial primary scans show zero active monitors. Navigate to the MARKET console to initialize asset surveillance protocols.
           </div>
           <button style={{ 
             marginTop: 32, background: '#fff', color: '#000', border: 'none', padding: '12px 32px', 
             fontSize: 10, fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' 
           }} onClick={() => window.location.hash = '/market'}>ACCESS_MARKET_CONSOLE</button>
        </div>
      ) : (
        <div className="v4-scroller" style={{ border: '2px solid var(--border)', background: '#000' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#080808', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                  <th style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>NETWORK_ID</th>
                  <th style={{ padding: '20px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>LIVE_VALUATION</th>
                  <th style={{ padding: '20px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>24H_DELTA</th>
                  <th style={{ padding: '20px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>LIQUIDITY</th>
                  <th style={{ padding: '20px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>INITIALIZED</th>
                  <th style={{ padding: '20px 24px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {enrichedWatchlist.map((coin, i) => (
                  <tr key={coin.coinId} className="v4-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={coin.logo} width={24} height={24} style={{ borderRadius: '2px', background: '#fff' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{coin.symbol}</div>
                          <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#fff', fontSize: 13 }}>
                      {coin.price ? formatCurrency(coin.price) : 'PENDING'}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      {coin.change24h !== undefined ? (
                        <div style={{ color: coin.change24h >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                          {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: 11 }}>
                      {coin.volume24h ? formatCurrency(coin.volume24h) : '—'}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right', color: 'var(--text-dim)', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {new Date(coin.addedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button onClick={() => handleRemove(coin.coinId, coin.name)} 
                        style={{ border: '2px solid var(--border)', color: 'var(--red)', padding: '8px 16px', fontSize: 9, fontWeight: 900, cursor: 'pointer', background: '#000' }}>
                        DECOMMISSION
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
