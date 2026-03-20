import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/format';

export default function ExecutionBlade({ symbol, currentPrice }) {
  const [balance, setBalance] = useState(25000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(currentPrice || 0);
  const [stopLoss, setStopLoss] = useState(0);
  const [side, setSide] = useState('long');
  const [orderType, setOrderType] = useState('market');
  const [sizeApplied, setSizeApplied] = useState(false);

  useEffect(() => {
    if (currentPrice && entry === 0) setEntry(currentPrice);
  }, [currentPrice]);

  const riskAmount = (balance * riskPct) / 100;
  const priceDiff = Math.abs(entry - stopLoss);
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const notional = positionSize * entry;
  const leverage = balance > 0 ? notional / balance : 0;

  const handleOneClickSize = () => {
    setSizeApplied(true);
    setTimeout(() => setSizeApplied(false), 1000);
  };

  return (
    <div className="card execution-blade" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>EXECUTION_BLADE_v4.2</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{symbol}/USDT</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(currentPrice)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <button onClick={() => setSide('long')} style={{ 
          padding: '14px', border: 'none', background: side === 'long' ? 'var(--green-bg)' : 'transparent',
          color: side === 'long' ? 'var(--green)' : 'var(--text-dim)', borderBottom: `2px solid ${side === 'long' ? 'var(--green)' : 'transparent'}`,
          fontWeight: 900, fontSize: 11, letterSpacing: 1, fontFamily: 'var(--font-mono)', transition: '0.2s'
        }}>BUY / LONG</button>
        <button onClick={() => setSide('short')} style={{ 
          padding: '14px', border: 'none', background: side === 'short' ? 'var(--red-bg)' : 'transparent',
          color: side === 'short' ? 'var(--red)' : 'var(--text-dim)', borderBottom: `2px solid ${side === 'short' ? 'var(--red)' : 'transparent'}`,
          fontWeight: 900, fontSize: 11, letterSpacing: 1, fontFamily: 'var(--font-mono)', transition: '0.2s'
        }}>SELL / SHORT</button>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['market', 'limit', 'stop'].map(t => (
            <button key={t} onClick={() => setOrderType(t)} style={{
              flex: 1, padding: '6px', fontSize: 10, fontWeight: 800, borderRadius: '2px', border: `1px solid ${orderType === t ? 'var(--text-muted)' : 'var(--border)'}`,
              background: orderType === t ? 'var(--bg-elevated)' : 'transparent', color: orderType === t ? '#fff' : 'var(--text-dim)', textTransform: 'uppercase'
            }}>{t}</button>
          ))}
        </div>

        <div className="risk-calc-integration" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 12, letterSpacing: 1 }}>RISK_TELEMETRY_ENGINE</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 9 }}>ACC_BAL</label>
              <input className="form-input" style={{ padding: '6px', fontSize: 11, fontFamily: 'var(--font-mono)' }} type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 9 }}>RISK_PCT</label>
              <input className="form-input" style={{ padding: '6px', fontSize: 11, fontFamily: 'var(--font-mono)' }} type="number" value={riskPct} onChange={e => setRiskPct(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 9 }}>ENTRY</label>
              <input className="form-input" style={{ padding: '6px', fontSize: 11, fontFamily: 'var(--font-mono)' }} type="number" value={entry} onChange={e => setEntry(Number(e.target.value))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 9 }}>STOP_LOSS</label>
              <input className="form-input" style={{ padding: '6px', fontSize: 11, fontFamily: 'var(--font-mono)' }} type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-dim)' }}>CALC_SIZE:</span>
              <span style={{ color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{positionSize.toFixed(4)} {symbol}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 12 }}>
              <span style={{ color: 'var(--text-dim)' }}>LEVERAGE:</span>
              <span style={{ color: 'var(--gold)', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{leverage.toFixed(2)}x</span>
            </div>
            
            <button onClick={handleOneClickSize} className={sizeApplied ? 'btn-success' : 'btn-ghost'} style={{ width: '100%', padding: '10px', fontSize: 10 }}>
              {sizeApplied ? 'SIZE_APPLIED' : 'ONE_CLICK_SIZE'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 800 }}>NOTIONAL_VALUE:</span>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{formatCurrency(notional)}</span>
          </div>
          <button className={side === 'long' ? 'btn-success' : 'btn-danger'} style={{ width: '100%', padding: '16px', fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
            EXECUTE_{side.toUpperCase()}
          </button>
        </div>
      </div>

      <style jsx>{`
        .execution-blade { border: 2px solid var(--border-strong) !important; background: var(--bg-card); }
        .risk-calc-integration:focus-within { border-color: var(--text-muted); }
        .data-update-pulse { animation: pulse 0.5s ease-out; }
        @keyframes pulse { 0% { color: var(--green); } 100% { color: inherit; } }
      `}</style>
    </div>
  );
}
