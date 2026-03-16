import React from 'react';
import { Line } from 'react-chartjs-2';

export default function NeuralProjectionChart({ historical, projection, symbol }) {
  // Combine historical and projected data for the chart
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
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        fill: true,
      },
      {
        label: `${symbol} NEURAL PROJECTION`,
        data: [...Array(historical.length - 1).fill(null), historical[historical.length - 1], ...projection],
        borderColor: 'rgba(16, 185, 129, 0.6)',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: 'var(--green)',
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
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#8899b4',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#4a5e78', font: { size: 9 } }
      }
    }
  };

  return <Line data={data} options={options} />;
}
