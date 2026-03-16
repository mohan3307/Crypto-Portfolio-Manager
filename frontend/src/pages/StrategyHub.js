import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';

const MOCK_STRATEGIES = [
  { id: 1, name: 'Whale Rider', status: 'Active', logic: 'If Whale Move > $10M & Sentiment=Bullish → Buy', profit: 450.20, trades: 14 },
  { id: 2, name: 'Dip Snatcher', status: 'Paused', logic: 'If RSI < 30 & Pattern=Support Bounce → Buy', profit: -12.40, trades: 5 },
  { id: 3, name: 'Alpha Scanner', status: 'Active', logic: 'If AI Confidence > 90% → Long BTC', profit: 1280.90, trades: 21 },
];

export default function StrategyHub() {
  const [strategies, setStrategies] = useState(MOCK_STRATEGIES);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Strategy Hub</h1>
        <p style={{ color: '#4a5e78', fontSize: 14 }}>Deploy and monitor automated trading intelligence bots.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30 }}>
        {/* Main List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card glass" style={{ padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#eef2fa' }}>Active Strategies</span>
              <button className="btn btn-primary btn-sm">+ Build New Strategy</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 20px', fontSize: 11, color: '#4a5e78' }}>STRATEGY NAME</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, color: '#4a5e78' }}>LOGIC ENGINE</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, color: '#4a5e78' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, color: '#4a5e78' }}>TOTAL PNL</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, color: '#4a5e78' }}>TRADES</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: 13 }}>{s.name}</td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: '#8899b4', fontFamily: 'Space Mono' }}>{s.logic}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${s.status === 'Active' ? 'green' : 'gold'}`} style={{ fontSize: 9 }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: s.profit >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'Space Mono', fontSize: 13 }}>
                      {s.profit >= 0 ? '+' : ''}{formatCurrency(s.profit)}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#eef2fa' }}>{s.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card glass" style={{ padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 10 }}>AI Strategy Optimizer</h3>
            <p style={{ color: '#8899b4', fontSize: 14, maxWidth: 400, margin: '0 auto 20px' }}>
              Let our AI analyze your past trades and the current "Master Terminal" data to suggest a high-probability strategy for the next 24 hours.
            </p>
            <button className="btn btn-secondary">Analyze My Performance</button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card glass-heavy" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 14, color: '#eef2fa', marginBottom: 16 }}>Live Strategy Logs</h4>
            <div style={{ fontSize: 11, color: '#4a5e78', fontFamily: 'Space Mono', lineHeight: 1.6 }}>
              [22:15:20] Hook: Whale Alert Spotted BTC<br/>
              [22:15:20] Signal: Sentiment is Bullish<br/>
              <span style={{ color: 'var(--green)' }}>[22:15:21] Order: [Whale Rider] Long BTC/USDT Executed</span><br/>
              [22:16:05] Update: Profit Target Set (+2.5%)<br/>
              <span style={{ color: 'var(--blue)' }}>[22:16:40] Monitoring active signals...</span>
            </div>
          </div>
          
          <div className="card glass" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 14, color: '#eef2fa', marginBottom: 10 }}>Strategy Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8899b4' }}>Safe Mode</span>
                <div style={{ width: 34, height: 18, background: 'var(--green)', borderRadius: 10, position: 'relative' }}>
                  <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8899b4' }}>Max Leverage</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>5x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
