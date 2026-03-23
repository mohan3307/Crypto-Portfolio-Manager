import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getWatchlist, removeFromWatchlist, getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

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
      toast.success(`${name} removed from watchlist`);
      fetchData();
    } catch (e) { toast.error('Failed to remove asset'); }
  };

  const enrichedWatchlist = watchlist.map(wCoin => {
    const live = listings.find(l => String(l.id) === wCoin.coinId);
    return { ...wCoin, ...(live || {}) };
  });

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div className="v4-ping-large" />
    </div>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PERSONAL_TRACKER</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>My Watchlist</h1>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800 }} onClick={() => window.location.hash = '/market'}>+ Add Coins</button>
      </header>

      {enrichedWatchlist.length === 0 ? (
        <div className="card-cmc" style={{ textAlign: 'center', padding: '100px 24px', borderRadius: 20 }}>
           <div style={{ fontSize: 48, marginBottom: 24 }}>⭐</div>
           <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Your watchlist is empty</div>
           <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 32px', lineHeight: 1.6 }}>
             Start tracking your favorite assets by clicking the star icon in the market dashboard.
           </p>
           <button className="btn-primary" style={{ padding: '12px 32px', fontSize: 13, borderRadius: 12 }} 
             onClick={() => window.location.hash = '/market'}>Go to Market</button>
        </div>
      ) : (
        <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)', width: 60 }}>#</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Price</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h %</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Market Cap</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Volume (24h)</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}></th>
                </tr>
              </thead>
              <tbody>
                {enrichedWatchlist.map((coin, i) => (
                  <tr key={coin.coinId} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span onClick={() => handleRemove(coin.coinId, coin.name)} style={{ cursor: 'pointer', color: '#ffcd3c', fontSize: 18 }}>★</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={coin.logo} width={24} height={24} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{coin.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: 14 }}>
                      {coin.price ? formatCurrency(coin.price) : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {coin.change24h !== undefined ? (
                        <div style={{ color: coin.change24h >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 13, fontWeight: 800 }}>
                          {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {coin.marketCap ? formatCurrency(coin.marketCap) : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {coin.volume24h ? formatCurrency(coin.volume24h) : '—'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="buy-pill-container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                           <button className="buy-pill" style={{ opacity: 0 }}>Buy</button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
        .v4-row:hover .buy-pill { opacity: 1 !important; }
        .buy-pill { background: var(--cmc-blue); color: #fff; border: none; padding: 4px 12px; borderRadius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; transition: 0.1s; }
        .buy-pill:hover { background: #2b50d8; transform: scale(1.05); }
      `}</style>
    </div>
  );
}
