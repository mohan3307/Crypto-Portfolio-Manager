import React from 'react';

const ROADMAP_DATA = [
  { quarter: 'NEXT_UP', title: 'EXCHANGE_BRIDGE_V1', desc: 'Structural integration with Tier-1 exchange APIs for low-latency cross-vector execution.', status: 'DEPLOYING', impact: 'Institutional' },
  { quarter: 'Q2_2026', title: 'MONTE_CARLO_ENGINE', desc: 'Predictive modeling of 50,000+ stochastic price paths utilizing Gaussian volatility curvature.', status: 'NEURAL_STORM', impact: 'Predictive' },
  { quarter: 'Q3_2026', title: 'MPC_SECURE_VAULTS', desc: 'Enterprise-grade Multi-Party Computation architecture for high-assurance asset custody.', status: 'PENDING', impact: 'Security' },
  { quarter: 'Q4_2026', title: 'PROP-FIRM_PROTOCOLS', desc: 'Advanced sub-account reconciliation for institutional scale copy-trading and risk management.', status: 'DORMANT', impact: 'Scalability' }
];

export default function RoadmapHub() {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 100, marginTop: 40 }}>
        <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 900, letterSpacing: 6, marginBottom: 12 }}>PREDICTIVE_HORIZON_V4.2</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -2 }}>EVOLUTION_BLUEPRINT</h1>
        <p style={{ fontSize: 15, color: '#4a5e78', fontWeight: 600, maxWidth: 600, margin: '16px auto 0', lineHeight: 1.6 }}>Establishing the structural architecture for next-generation institutional trading intelligence and high-fidelity execution.</p>
      </header>

      <div style={{ position: 'relative', padding: '60px 0', maxWidth: 1100, margin: '0 auto' }}>
        {/* Central Spine */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.3) 15%, rgba(59,130,246,0.3) 85%, transparent)', transform: 'translateX(-50%)' }} />
        
        {ROADMAP_DATA.map((item, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', 
            alignItems: 'center',
            marginBottom: 100,
            width: '100%',
            position: 'relative'
          }}>
            <div className={`v4-card roadmap-node ${i % 2 === 0 ? 'left' : 'right'}`} style={{ 
              width: '45%', 
              padding: '40px', 
              borderRadius: 32, 
              textAlign: i % 2 === 0 ? 'right' : 'left',
              animationDelay: `${i * 0.2}s`,
              position: 'relative'
            }}>
              <div className="v4-node-corner" style={{ [i % 2 === 0 ? 'right' : 'left']: 0, top: 0 }} />
              
              <span className="v4-node-tag" style={{ color: '#3b82f6' }}>{item.quarter}</span>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '16px 0', letterSpacing: -1 }}>{item.title}</h3>
              <p style={{ color: '#8899b4', fontSize: 13, lineHeight: 1.8, fontWeight: 500 }}>{item.desc}</p>
              
              <div style={{ marginTop: 32, display:'flex', gap:10, justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
                <span className="v4-impact-pill">#{item.impact.toUpperCase()}</span>
                <div className="v4-status-label">
                   <div className="v4-status-dot" style={{ background: item.status === 'DEPLOYING' ? '#10b981' : '#f59e0b' }} />
                   {item.status}
                </div>
              </div>
            </div>

            {/* Hub Point */}
            <div className="v4-hub-point">
               <div className="v4-hub-inner" />
            </div>
          </div>
        ))}
      </div>

      <div className="v4-card v4-enrollment-box" style={{ marginTop: 80, padding: 80, borderRadius: 48, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="neural-grid-bg" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: -1.5 }}>SHAPE_THE_VISION</h2>
          <p style={{ color: '#8899b4', marginBottom: 40, maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.8, fontWeight: 500, fontSize: 16 }}>Join the elite Alpha Surveillance unit to provide structural feedback on emerging terminal prototypes and tactical features.</p>
          <button className="v4-deploy-btn pulse-main" style={{ padding: '16px 48px', fontSize: 13 }}>INITIALIZE_ALPHA_ENROLLMENT</button>
        </div>
      </div>

      <style>{`
        .v4-card { background: rgba(7, 11, 20, 0.6); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); }
        .roadmap-node { opacity: 0; transform: translateY(20px); transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); animation: v4-node-in 0.8s forwards; }
        
        .v4-node-tag { fontSize: 10px; fontWeight: 950; letterSpacing: 3px; textTransform: uppercase; background: rgba(59, 130, 246, 0.05); padding: 4px 12px; borderRadius: 8px; }
        .v4-impact-pill { fontSize: 8px; fontWeight: 900; background: rgba(255,255,255,0.02); color: #4a5e78; padding: 4px 10px; borderRadius: 6px; letterSpacing: 1px; }
        
        .v4-status-label { fontSize: 10px; fontWeight: 900; color: #fff; display: flex; alignItems: center; gap: 8px; padding: 4px 12px; background: rgba(255,255,255,0.02); borderRadius: 8px; }
        .v4-status-dot { width: 6px; height: 6px; borderRadius: 50%; box-shadow: 0 0 10px currentColor; animation: v4-status-ping 1.5s infinite alternate; }
        
        .v4-hub-point { position: absolute; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; background: rgba(10, 15, 28, 0.9); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; alignItems: center; justifyContent: center; z-index: 10; }
        .v4-hub-inner { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 15px #3b82f6; }
        
        .v4-node-corner { position: absolute; width: 60px; height: 60px; background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 70%); pointer-events: none; }
        
        .v4-deploy-btn { background: #3b82f6; border: none; color: #fff; padding: 14px 28px; borderRadius: 16px; fontSize: 11px; fontWeight: 900; letterSpacing: 1px; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); }
        .v4-deploy-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4); }
        .pulse-main { animation: v4-pulse 2s infinite; }
        
        .neural-grid-bg { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%); pointer-events: none; }
        
        @keyframes v4-node-in { to { opacity: 1; transform: translateY(0); } }
        @keyframes v4-pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes v4-status-ping { from { opacity: 0.4; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
