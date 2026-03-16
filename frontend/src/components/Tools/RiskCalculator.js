import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';

export default function RiskCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);

  const riskAmount = (balance * riskPct) / 100;
  const priceDiff = Math.abs(entry - stopLoss);
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const notional = positionSize * entry;
  const leverage = balance > 0 ? notional / balance : 0;

  return (
    <div className="card glass" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Risk & Size Calculator</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Calculate optimal position sizing</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 10 }}>Account Balance ($)</label>
          <input className="form-input" style={{ fontSize: 12, padding: '8px' }} type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 10 }}>Risk Per Trade (%)</label>
          <input className="form-input" style={{ fontSize: 12, padding: '8px' }} type="number" value={riskPct} onChange={e => setRiskPct(Number(e.target.value))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 10 }}>Entry Price</label>
          <input className="form-input" style={{ fontSize: 12, padding: '8px' }} type="number" value={entry} onChange={e => setEntry(Number(e.target.value))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 10 }}>Stop Loss</label>
          <input className="form-input" style={{ fontSize: 12, padding: '8px' }} type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} />
        </div>
      </div>

      <div style={{ background: 'rgba(59,130,246,0.05)', borderRadius: 10, padding: '14px', border: '1px solid rgba(59,130,246,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#8899b4' }}>Risk Amount</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', fontFamily: 'Space Mono' }}>{formatCurrency(riskAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#8899b4' }}>Position Size</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#eef2fa', fontFamily: 'Space Mono' }}>{positionSize.toFixed(4)} Units</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#8899b4' }}>Notional Value</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#eef2fa', fontFamily: 'Space Mono' }}>{formatCurrency(notional)}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#8899b4' }}>Req. Leverage</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue)', fontFamily: 'Space Mono' }}>{leverage.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}
