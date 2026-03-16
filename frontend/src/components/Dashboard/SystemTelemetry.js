import React, { useState, useEffect } from 'react';

export default function SystemTelemetry() {
  const [latency, setLatency] = useState(24);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const itv = setInterval(() => {
      setLatency(15 + Math.floor(Math.random() * 20));
      setUptime(prev => prev + 1);
    }, 3000);
    return () => clearInterval(itv);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      background: 'rgba(0,0,0,0.2)',
      padding: '6px 16px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.05)',
      fontSize: 10,
      fontFamily: 'Space Mono',
      color: '#4a5e78',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
        <span style={{ color: '#8899b4' }}>NETWORK:</span> <span style={{ color: '#eef2fa' }}>SECURE SSL/WSS</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#8899b4' }}>LATENCY:</span> 
        <span style={{ color: latency > 30 ? 'var(--gold)' : 'var(--green)' }}>{latency}ms</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#8899b4' }}>UPTIME:</span> 
        <span style={{ color: '#eef2fa' }}>{formatUptime(uptime)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <span style={{ color: '#8899b4' }}>ENVIRONMENT:</span> 
        <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px' }}>PRO-LEVEL v4.2</span>
      </div>
    </div>
  );
}
