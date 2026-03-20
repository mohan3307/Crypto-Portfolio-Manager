import React, { useState, useEffect } from 'react';

export default function MacroPulse() {
  const [data, setData] = useState({
    dxy: { val: 103.42, chg: 0.12 },
    us10y: { val: 4.21, chg: -0.05 },
    spx: { val: 5123.4, chg: 0.45 },
    vix: { val: 14.2, chg: -2.1 }
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setData(prev => ({
        ...prev,
        dxy: { val: prev.dxy.val + (Math.random() - 0.5) * 0.02, chg: prev.dxy.chg + (Math.random() - 0.5) * 0.01 },
        us10y: { val: prev.us10y.val + (Math.random() - 0.5) * 0.01, chg: prev.us10y.chg + (Math.random() - 0.5) * 0.01 }
      }));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="macro-pulse-strip">
      <div className="macro-pulse-item">
        <span className="macro-pulse-label">MACRO_PULSE_v4.2</span>
      </div>
      
      <PulseItem label="DXY" value={data.dxy.val.toFixed(2)} change={data.dxy.chg} />
      <PulseItem label="US10Y" value={data.us10y.val.toFixed(3) + '%'} change={data.us10y.chg} />
      <PulseItem label="S&P500" value={data.spx.val.toFixed(1)} change={data.spx.chg} />
      <PulseItem label="VIX" value={data.vix.val.toFixed(2)} change={data.vix.chg} />
      
      <div className="macro-pulse-item" style={{ marginLeft: 'auto' }}>
        <span className="macro-pulse-label">TERMINAL_STATUS:</span>
        <span style={{ color: 'var(--green)', fontWeight: 800 }}>OPTIMIZED</span>
      </div>
    </div>
  );
}

function PulseItem({ label, value, change }) {
  const isUp = change >= 0;
  return (
    <div className="macro-pulse-item">
      <span className="macro-pulse-label">{label}</span>
      <span className="macro-pulse-val data-update-pulse">{value}</span>
      <span className={`macro-pulse-chg ${isUp ? 'up' : 'down'}`}>
        {isUp ? '▲' : '▼'}{Math.abs(change).toFixed(2)}%
      </span>
    </div>
  );
}
