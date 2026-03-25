import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';
import { getStrategies } from '../services/api';

export default function StrategyHub() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStrategies()
      .then(res => setStrategies(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="v4-ping-large" /></div>;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>ALGORITHMIC_DEPOT_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>STRATEGY_COORDINATOR</h1>
        </div>
        <button style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>+ INITIALIZE_NEURAL_BOT</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Table */}
          <div style={{ border: '2px solid var(--border)', background: '#000' }}>
            <div style={{ padding: '16px 24px', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#080808' }}>
               <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ACTIVE_SURVEILLANCE_VECTORS</span>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 9, fontWeight: 900 }}>
                 <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} />
                 <span>CORE_SYNC_ACTIVE</span>
               </div>
            </div>
            
            <div className="v4-scroller" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 9, fontWeight: 800, borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px' }}>BOT_ID</th>
                    <th style={{ padding: '16px' }}>LOGIC_MATRIX</th>
                    <th style={{ padding: '16px' }}>STATUS</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>YIELD</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>EXEC</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }} className="v4-row">
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 13, color: '#fff', fontFamily: 'var(--font-mono)' }}>{s.name}</div>
                            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>ID: {s.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                         <div style={{ fontSize: 10, color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '6px 10px', border: '1px solid var(--border)', background: '#050505', width: 'fit-content' }}>
                           {s.logic}
                         </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: s.status === 'Active' ? 'var(--green)' : 'var(--orange)' }}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: s.profit >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          {s.profit >= 0 ? '+' : ''}{formatCurrency(s.profit)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{s.trades}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine Preview */}
          {/* Engine Preview */}
          <div style={{ border: '2px dashed var(--border)', background: '#000', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🤖</div>
            <h3 style={{ fontSize: 20, color: '#fff', fontWeight: 900, margin: '0 0 12px' }}>NEURAL_STRATEGY_ENGINE_v4.2</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6, fontWeight: 500 }}>
              Autonomous market vector synthesis core. High-fidelity algorithmic execution nodes deployed via distributed neural backbone.
            </p>
            <button style={{ border: '2px solid var(--border)', background: '#000', color: '#fff', padding: '10px 24px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>GENERATE_BLUEPRINT</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Live Logs */}
          <div className="card" style={{ padding: 24, background: '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} />
                 <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>NEURAL_LOGS_STREAM</span>
               </div>
               <span style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800 }}>BUFFERING...</span>
            </div>
            <div style={{ background: '#050505', border: '1px solid var(--border)', padding: '16px', fontFamily: 'var(--font-mono)', lineHeight: 1.8, height: 260, overflowY: 'auto' }}>
              <div style={{ fontSize: 10 }}><span style={{ color: 'var(--text-dim)' }}>[20:47:20]</span> <span style={{ fontWeight: 900 }}>HOOK</span>: WHALE_ALERT // BTC_CLUSTER</div>
              <div style={{ fontSize: 10 }}><span style={{ color: 'var(--text-dim)' }}>[20:47:20]</span> <span style={{ fontWeight: 900, color: 'var(--blue)' }}>INFO</span>: NEURAL_SYNC: 94.2%</div>
              <div style={{ fontSize: 10 }}><span style={{ color: 'var(--text-dim)' }}>[20:47:21]</span> <span style={{ fontWeight: 900, color: 'var(--green)' }}>EXEC</span>: VECTOR_LONG_BTC_INIT</div>
              <div style={{ fontSize: 10 }}><span style={{ color: 'var(--text-dim)' }}>[20:47:35]</span> <span style={{ fontWeight: 900, color: 'var(--orange)' }}>LIMT</span>: PROFIT_TARGET // +2.50%</div>
              <div style={{ fontSize: 10 }}><span style={{ color: 'var(--text-dim)' }}>[20:48:05]</span> <span style={{ fontWeight: 900 }}>SYNC</span>: SCANNING_DEX_LIQUIDITY...</div>
              <div style={{ fontSize: 10, color: 'var(--blue)' }}>_</div>
            </div>
          </div>
          
          {/* System Params */}
          <div className="card" style={{ padding: 24, background: '#000' }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 20 }}>SYSTEM_PARAMETERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'NEURAL_PROTECTION', value: 'ACTIVE', active: true },
                { label: 'MAX_MULTIPLIER', value: '5.0x' },
                { label: 'LATENCY_THRESHOLD', value: '1.2ms' },
                { label: 'DECOMMISSIONING', value: 'DISABLED' }
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800 }}>{p.label}</span>
                  <span style={{ fontSize: 10, color: p.active ? 'var(--green)' : '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-strong); }
      `}</style>
    </div>
  );
}
