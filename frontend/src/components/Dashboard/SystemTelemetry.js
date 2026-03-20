import React, { useState, useEffect } from 'react';

export default function SystemTelemetry() {
  const [latency, setLatency] = useState(21);
  const [uptime, setUptime] = useState(549);
  const [nodes, setNodes] = useState(3);

  useEffect(() => {
    const itv = setInterval(() => {
      setLatency(16 + Math.floor(Math.random() * 14));
      setUptime(prev => prev + 1);
      setNodes(2 + Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(itv);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}H_${String(m).padStart(2, '0')}M_${String(sec).padStart(2, '0')}S`;
  };

  return (
    <div className="v4-sys-bar">
      {/* Status */}
      <div className="v4-sys-item">
        <div className="v4-status-dot" />
        <span className="v4-sys-label">CORE_STATUS</span>
        <span className="v4-sys-val green">OPERATIONAL</span>
      </div>

      <div className="v4-sys-sep" />

      {/* Latency */}
      <div className="v4-sys-item">
        <span className="v4-sys-label">WS_LATENCY</span>
        <span className={`v4-sys-val ${latency > 28 ? 'gold' : 'green'}`}>{latency}MS</span>
      </div>

      <div className="v4-sys-sep" />

      {/* Uptime */}
      <div className="v4-sys-item">
        <span className="v4-sys-label">UPTIME</span>
        <span className="v4-sys-val white">{formatUptime(uptime)}</span>
      </div>

      <div className="v4-sys-sep" />

      {/* Nodes */}
      <div className="v4-sys-item">
        <div style={{ display: 'flex', gap: 3 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 3, height: `${8 + i * 3}px`, background: i <= nodes ? '#3b82f6' : 'rgba(255,255,255,0.07)', borderRadius: 1, transition: '0.5s', boxShadow: i <= nodes ? '0 0 6px #3b82f640' : 'none' }} />
          ))}
        </div>
        <span className="v4-sys-label">{nodes}/3_NODES</span>
      </div>

      {/* Kernel Badge (right) */}
      <div style={{ marginLeft: 'auto' }}>
        <span className="v4-kernel-badge">EVOLUTION_V4.2_KERNEL</span>
      </div>

      <style>{`
        .v4-sys-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(7, 11, 20, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 18px;
          padding: 12px 24px;
          margin-bottom: 32px;
          backdrop-filter: blur(30px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          font-family: 'Space Mono', monospace;
        }
        .v4-sys-item { display: flex; align-items: center; gap: 10px; }
        .v4-sys-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.05); }
        .v4-sys-label { font-size: 9px; font-weight: 950; color: #4a5e78; letter-spacing: 1px; }
        .v4-sys-val { font-size: 9px; font-weight: 950; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px; }
        .v4-sys-val.green { color: #10b981; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16,185,129,0.15); }
        .v4-sys-val.gold { color: #f59e0b; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245,158,11,0.15); }
        .v4-sys-val.white { color: #fff; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
        .v4-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 12px #10b981; animation: v4-status-glow 2s infinite alternate; }
        @keyframes v4-status-glow { from { opacity: 0.5; box-shadow: 0 0 6px #10b981; } to { opacity: 1; box-shadow: 0 0 18px #10b981; } }
        .v4-kernel-badge { font-size: 9px; font-weight: 950; color: #3b82f6; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); padding: 4px 12px; border-radius: 8px; letter-spacing: 1px; }
      `}</style>
    </div>
  );
}
