import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getListings, addToPortfolio, addToWatchlist } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';
import MarketSparkline from '../components/Charts/MarketSparkline';

export default function MarketPage() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await getListings();
      setListings(res.data.data);
      setLastUpdated(res.data.lastUpdated);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchListings(); 
    const i = setInterval(fetchListings, 30000); 
    return () => clearInterval(i); 
  }, []);

  useEffect(() => {
    let result = [...listings];
    if (search) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === 'gainers') result = result.filter(c => c.change24h > 0);
    if (filter === 'losers') result = result.filter(c => c.change24h < 0);
    
    result.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFiltered(result);
  }, [listings, search, sortBy, sortDir, filter]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const addPortfolio = async (coin) => {
    const qty = prompt(`PROTOCOL_INIT: DEPLOY ${coin.symbol.toUpperCase()}\nENTER_QUANTITY_FOR_NODE:`);
    if (!qty || isNaN(qty)) return;
    try {
      await addToPortfolio({ 
        coinId: String(coin.id), 
        symbol: coin.symbol, 
        name: coin.name, 
        logo: coin.logo, 
        quantity: parseFloat(qty), 
        buyPrice: coin.price 
      });
      toast.success('ASSET_NODE_DEPLOYED');
    } catch (e) { toast.error('DEPLOYMENT_ERROR'); }
  };

  const addWatch = async (coin) => {
    try {
      await addToWatchlist({ 
        coinId: String(coin.id), 
        symbol: coin.symbol, 
        name: coin.name, 
        logo: coin.logo 
      });
      toast.success('PRIORITY_WATCH_UPDATED');
    } catch (e) { toast.error('ALREADY_IN_SYNC'); }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="v4-ping-large" />
    </div>
  );

  const totalMCap = listings.reduce((a, b) => a + b.marketCap, 0);
  const totalVol = listings.reduce((a, b) => a + b.volume24h, 0);
  const btcDom = (listings.find(c => c.symbol === 'BTC')?.marketCap || 0) / (totalMCap || 1) * 100;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ── Market Intelligence Board ── */}
      <div className="card" style={{ padding: '24px', marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#000' }}>
        <div style={{ padding: '0 24px', borderRight: '2px solid var(--border)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>GLOBAL_MCAP</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalMCap)}</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--green)', marginTop: 4 }}>▲ 2.41%</div>
        </div>

        <div style={{ padding: '0 24px', borderRight: '2px solid var(--border)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>LIQUIDITY_24H</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalVol)}</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>ALPHA_FLOW: NOMINAL</div>
        </div>

        <div style={{ padding: '0 24px', borderRight: '2px solid var(--border)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>BTC_DOMINANCE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{btcDom.toFixed(1)}%</div>
          <div style={{ height: 4, width: '100%', background: 'var(--border)', marginTop: 8 }}>
            <div style={{ height: '100%', width: `${btcDom}%`, background: 'var(--gold)' }} />
          </div>
        </div>

        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ border: '2px solid var(--green)', color: 'var(--green)', padding: '8px 16px', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>
            SURVEILLANCE_ACTIVE
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>LIQUIDITY_MAP_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>MARKET_INTELLIGENCE</h1>
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
            <div style={{ border: '2px solid var(--border)', background: '#000', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
              <input 
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 12, height: 40, width: 220 }}
                placeholder="FILTER_BY_SYMBOL..." value={search} onChange={e => setSearch(e.target.value)} 
              />
            </div>
             {['all', 'gainers', 'losers'].map(f => (
               <button key={f} onClick={() => setFilter(f)}
                 style={{ 
                   background: filter === f ? '#fff' : '#000', 
                   color: filter === f ? '#000' : 'var(--text-dim)',
                   border: '2px solid var(--border)',
                   padding: '0 20px', fontSize: 9, fontWeight: 900, letterSpacing: 2, height: 44
                 }}>{f === 'all' ? 'FULL_NETWORK' : f === 'gainers' ? '▲_ALPHA' : '▼_BETA'}</button>
             ))}
        </div>
      </div>

      <div className="v4-scroller" style={{ border: '2px solid var(--border)', background: '#000' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#080808', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                <th onClick={() => handleSort('rank')} style={{ padding: '20px 24px', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid var(--border)' }}>#</th>
                <th onClick={() => handleSort('name')} style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid var(--border)' }}>ASSET_NODE</th>
                <th onClick={() => handleSort('price')} style={{ padding: '20px', textAlign: 'right', cursor: 'pointer', borderBottom: '2px solid var(--border)' }}>UNIT_PRICE</th>
                <th onClick={() => handleSort('change24h')} style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', borderBottom: '2px solid var(--border)' }}>24H_DELTA</th>
                <th onClick={() => handleSort('marketCap')} style={{ padding: '20px', textAlign: 'right', cursor: 'pointer', borderBottom: '2px solid var(--border)' }}>MCAP_LAYER</th>
                <th style={{ padding: '20px', textAlign: 'center', borderBottom: '2px solid var(--border)' }}>ALPHA_TRACE</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin, i) => (
                <tr key={coin.id} className="v4-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{coin.rank.toString().padStart(2, '0')}</span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={coin.logo} width={24} height={24} style={{ borderRadius: '2px', background: '#fff' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{coin.symbol}</div>
                        <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{coin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#fff', fontSize: 13 }}>{formatCurrency(coin.price)}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: coin.change24h >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                      {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{formatCurrency(coin.marketCap)}</div>
                  </td>
                  <td style={{ padding: '20px', width: 140 }}>
                    <div style={{ height: 30 }}>
                      <MarketSparkline data={coin.sparkline7d} change={coin.change24h} />
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                       <button onClick={() => addWatch(coin)} style={{ border: '2px solid var(--border)', color: 'var(--text-dim)', padding: '8px 12px', fontSize: 9, cursor: 'pointer', background: '#000' }}>WATCH</button>
                       <button onClick={() => addPortfolio(coin)} style={{ background: '#fff', color: '#000', border: '2px solid #fff', padding: '8px 12px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>+ DEPLOY</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-strong); }
      `}</style>
    </div>
  );
}
