import { getListings, getExchanges } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

export default function ExchangesPage() {
  const [listings, setListings] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getListings(), getExchanges()])
      .then(([lRes, eRes]) => {
        setListings(lRes.data.data);
        setExchanges(eRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>SPOT_EXCHANGE_INDEX</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Top Crypto Exchanges</h1>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Exchange</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Exchange Score</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>24h Volume</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Avg. Liquidity</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Weekly Visits</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}># Markets</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}># Coins</th>
            </tr>
          </thead>
          <tbody>
            {exchanges.map((ex) => (
              <tr key={ex.name} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700 }}>{ex.rank}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={ex.logo} width={24} height={24} style={{ borderRadius: 4 }} alt="" />
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{ex.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                   <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8, background: 'var(--cmc-blue)', color: '#fff', fontWeight: 900, fontSize: 13 }}>{ex.score}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{formatCurrency(ex.volume24h)}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.liquidity}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.weeklyVisits.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ex.markets}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right', color: '#fff' }}>{ex.coins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
      `}</style>
    </div>
  );
}
