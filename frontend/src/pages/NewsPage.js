import { getListings, getNews } from '../services/api';

export default function NewsPage() {
  const [listings, setListings] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    Promise.all([getListings(), getNews()])
      .then(([lRes, nRes]) => {
        setListings(lRes.data.data);
        setNews(nRes.data.data);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>CRYPTO_INTELLIGENCE_STREAM</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Latest Crypto News</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {news.map(n => (
          <div key={n.id} className="card-cmc" style={{ padding: 0, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 200, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               <img src={n.img} width={80} style={{ opacity: 0.1, position: 'absolute' }} alt="" />
               <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--cmc-blue)', zIndex: 1 }}>{n.category.toUpperCase()}</div>
            </div>
            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cmc-blue)' }}>{n.source}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{n.time}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 20px 0', lineHeight: 1.4, flex: 1 }}>{n.title}</h2>
              <button style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Read Full Story</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
