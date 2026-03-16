import React from 'react';

const ROADMAP_DATA = [
  {
    quarter: 'Next Up',
    title: 'Exchange Bridge',
    desc: 'Deep integration with Binance and Coinbase APIs for seamless cross-exchange execution.',
    status: 'In Development',
    impact: 'Institutional'
  },
  {
    quarter: 'Q2 2026',
    title: 'Monte Carlo Simulations',
    desc: 'Model 50,000+ potential price paths for any asset using Gaussian volatility curves.',
    status: 'Researching',
    impact: 'Predictive'
  },
  {
    quarter: 'Q3 2026',
    title: 'Custodial Secure Vaults',
    desc: 'Enterprise-grade MPC (Multi-Party Computation) security for custodial asset management.',
    status: 'Planned',
    impact: 'Security'
  },
  {
    quarter: 'Q4 2026',
    title: 'Prop-Firm Engine',
    desc: 'Fully featured dashboard for managing multiple sub-accounts and copy-trading sub-portfolios.',
    status: 'Concept',
    impact: 'Scalability'
  }
];

export default function RoadmapHub() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, background: 'linear-gradient(90deg, #fff, #4a5e78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Future Horizon</h1>
        <p style={{ color: '#8899b4', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>Building the future of institutional-grade retail trading terminals.</p>
      </div>

      <div style={{ position: 'relative', padding: '20px 0' }}>
        {/* Central Line */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.3) 10%, rgba(59,130,246,0.3) 90%, transparent)' }} />
        
        {ROADMAP_DATA.map((item, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', 
            alignItems: 'center',
            marginBottom: 40,
            width: '100%',
            position: 'relative'
          }}>
            <div style={{ 
              width: '45%', 
              padding: '30px', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: 20, 
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              textAlign: i % 2 === 0 ? 'right' : 'left'
            }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{item.quarter}</span>
              <h3 style={{ fontSize: 20, color: '#fff', margin: '10px 0' }}>{item.title}</h3>
              <p style={{ color: '#8899b4', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 9, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#eef2fa', marginRight: 10 }}>{item.impact}</span>
                <span style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700 }}>● {item.status}</span>
              </div>
            </div>
            {/* Timeline Dot */}
            <div style={{ 
              position: 'absolute', 
              left: '50%', 
              width: 12, 
              height: 12, 
              background: 'var(--blue)', 
              borderRadius: '50%', 
              transform: 'translateX(-50%)',
              boxShadow: '0 0 15px var(--blue)'
            }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 100, textAlign: 'center', padding: 60, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 30, background: 'rgba(255,255,255,0.01)' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Shape the Vision</h2>
        <p style={{ color: '#4a5e78', marginBottom: 30, maxWidth: 500, margin: '0 auto 30px' }}>Join our alpha testing group to provide direct feedback on these features as they transition to development.</p>
        <button className="btn btn-primary">Join Alpha Program</button>
      </div>
    </div>
  );
}
