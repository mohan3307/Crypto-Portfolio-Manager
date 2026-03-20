import React from 'react';
import { Line } from 'react-chartjs-2';

export default function NeuralProjectionChart({ historical, projection, symbol }) {
  const labels = [
    ...historical.map((_, i) => `H-${historical.length - i}`),
    ...projection.map((_, i) => `T+${i + 1}H`)
  ];

  const data = {
    labels,
    datasets: [
      {
        label: `${symbol} HISTORICAL`,
        data: [...historical, ...Array(projection.length).fill(null)],
        borderColor: 'rgba(59, 130, 246, 0.9)',
        backgroundColor: (context) => {
          if (!context.chart.chartArea) return;
          const { ctx, chartArea } = context.chart;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'transparent');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 3,
        fill: true,
      },
      {
        label: `${symbol} NEURAL PROJECTION`,
        data: [...Array(historical.length - 1).fill(null), historical[historical.length - 1], ...projection],
        borderColor: 'var(--green)',
        borderDash: [8, 4],
        tension: 0.4,
        pointRadius: (ctx) => (ctx.dataIndex === historical.length - 1 ? 6 : 2),
        pointBackgroundColor: (ctx) => (ctx.dataIndex === historical.length - 1 ? '#fff' : 'var(--green)'),
        pointBorderColor: 'var(--green)',
        pointBorderWidth: 2,
        borderWidth: 2,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(10, 15, 28, 0.9)',
        titleColor: '#8899b4',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 10, weight: 900, family: 'Space Mono' },
        bodyFont: { size: 12, weight: 700, family: 'Space Mono' }
      }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: 'rgba(255,255,255,0.02)' },
        ticks: { color: '#4a5e78', font: { size: 9, weight: 800 } }
      }
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <Line data={data} options={options} />
    </div>
  );
}
