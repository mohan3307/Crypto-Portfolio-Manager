import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function StrategyBacktester() {
  const [strategy, setStrategy] = useState('DCA');
  
  const strategies = {
    'DCA': { roi: 12.4, risk: 'Low', color: 'var(--blue)' },
    'GRID': { roi: 24.8, risk: 'Med', color: 'var(--green)' },
    'MEAN': { roi: -8.2, risk: 'High', color: 'var(--red)' },
    'QUAN': { roi: 42.1, risk: 'Extreme', color: 'var(--gold)' }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'SIMULATED PNL (%)',
      data: Array.from({ length: 12 }, (_, i) => strategies[strategy].roi * (i / 11) + (Math.random() - 0.5) * 5),
      borderColor: strategies[strategy].color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
      fill: true,
      backgroundColor: strategies[strategy].color.replace(')', ', 0.05)')
    }]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#4a5e78', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5e78', font: { size: 9 } } }
    }
  };

  return (
    <div className="card glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', textTransform: 'uppercase' }}>Strategy Lab (12M Backtest)</div>
        <select 
          value={strategy} 
          onChange={(e) => setStrategy(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 6, outline: 'none' }}
        >
          <option value="DCA">ACTIVE DCA</option>
          <option value="GRID">HIGH-FREQ GRID</option>
          <option value="MEAN">MEAN REVERSAL</option>
          <option value="QUAN">QUANT ALPHA+</option>
        </select>
      </div>

      <div style={{ height: 160 }}><Line data={chartData} options={options} /></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
         <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 8, color: '#4a5e78', mb: 2 }}>PROJECTED ROI</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: strategies[strategy].color }}>{strategies[strategy].roi >= 0 ? '+' : ''}{strategies[strategy].roi}%</div>
         </div>
         <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 8, color: '#4a5e78', mb: 2 }}>RISK RATING</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{strategies[strategy].risk}</div>
         </div>
      </div>
    </div>
  );
}
