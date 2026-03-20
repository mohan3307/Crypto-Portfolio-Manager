import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function StrategyBacktester() {
  const [strategy, setStrategy] = useState('DCA');
  
  const strategies = {
    'DCA': { roi: 12.4, risk: 'LOW_FACTOR', color: 'var(--blue)' },
    'GRID': { roi: 24.8, risk: 'MEDIUM_EXPOSURE', color: 'var(--green)' },
    'MEAN': { roi: -8.2, risk: 'HIGH_VARIANCE', color: 'var(--red)' },
    'QUAN': { roi: 42.1, risk: 'EXTREME_ALPHA', color: 'var(--gold)' }
  };

  const chartData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    datasets: [{
      label: 'SIMULATED PNL (%)',
      data: Array.from({ length: 12 }, (_, i) => strategies[strategy].roi * (i / 11) + (Math.random() - 0.5) * 5),
      borderColor: strategies[strategy].color,
      borderWidth: 3,
      pointRadius: 0,
      tension: 0.4,
      fill: true,
      backgroundColor: (context) => {
        const bg = strategies[strategy].color;
        if (!context.chart.chartArea) return;
        const { ctx, chartArea } = context.chart;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, bg.replace(')', ', 0.15)'));
        gradient.addColorStop(1, 'transparent');
        return gradient;
      }
    }]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#4a5e78', font: { size: 9, weight: 800 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5e78', font: { size: 9, weight: 800 } } }
    }
  };

  return (
    <div className="glass-heavy strategy-lab" style={{ padding: '24px', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid rgba(59, 130, 246, 0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>🧪</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: -0.2 }}>PREDICTIVE_SANDBOX</div>
            <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 900 }}>12M HISTORICAL TRAJECTORY</div>
          </div>
        </div>
        <select 
          value={strategy} 
          onChange={(e) => setStrategy(e.target.value)}
          className="pro-select"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: 10, padding: '8px 12px', borderRadius: 10, outline: 'none', fontWeight: 900 }}
        >
          <option value="DCA">ACTIVE_DCA</option>
          <option value="GRID">DYNAMIC_GRID</option>
          <option value="MEAN">MEAN_REVERSAL</option>
          <option value="QUAN">QUANT_ALPHA_MAX</option>
        </select>
      </div>

      <div style={{ height: 180, position: 'relative' }}>
         <Line data={chartData} options={options} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
         <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900, marginBottom: 6, letterSpacing: 0.5 }}>PROJECTED_ROI</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: strategies[strategy].color, fontFamily: 'Space Mono' }}>{strategies[strategy].roi >= 0 ? '+' : ''}{strategies[strategy].roi}%</div>
         </div>
         <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 900, marginBottom: 6, letterSpacing: 0.5 }}>RISK_RATING</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{strategies[strategy].risk}</div>
         </div>
      </div>

      <style>{`
        .strategy-lab { background: rgba(10, 15, 28, 0.7) !important; backdrop-filter: blur(25px) saturate(210%); }
        .pro-select:hover { border-color: rgba(59, 130, 246, 0.3) !important; background: rgba(59, 130, 246, 0.05) !important; }
      `}</style>
    </div>
  );
}
