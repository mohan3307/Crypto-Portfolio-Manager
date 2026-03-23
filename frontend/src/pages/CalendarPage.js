import { getListings, getCalendar } from '../services/api';

export default function CalendarPage() {
  const [listings, setListings] = useState([]);
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    Promise.all([getListings(), getCalendar()])
      .then(([lRes, cRes]) => {
        setListings(lRes.data.data);
        setCalendar(cRes.data.data);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PROTOCOL_MILESTONES_v4</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Crypto Events & ICOs</h1>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Type</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Project</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Date / Deadline</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Target / Goal</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Stage</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((ev) => (
              <tr key={ev.id} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 900,
                      background: ev.type === 'ICO' ? 'rgba(56, 97, 251, 0.1)' : ev.type === 'AIRDROP' ? 'rgba(22, 199, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: ev.type === 'ICO' ? 'var(--cmc-blue)' : ev.type === 'AIRDROP' ? 'var(--cmc-green)' : '#fff',
                      border: `1px solid ${ev.type === 'ICO' ? 'var(--cmc-blue)' : ev.type === 'AIRDROP' ? 'var(--cmc-green)' : 'var(--cmc-border)'}`
                    }}>{ev.type}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{ev.project}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{ev.date}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{ev.goal}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{ev.stage}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.status === 'Upcoming' ? 'var(--cmc-blue)' : 'var(--cmc-green)' }} />
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{ev.status}</span>
                   </div>
                </td>
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
