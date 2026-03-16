import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { getPortfolio, getTrending, getChartData } from '../services/api';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import FearGreedGauge from '../components/Charts/FearGreedGauge';
import NewsFeed from '../components/Charts/NewsFeed';
import MarketPulse from '../components/Dashboard/MarketPulse';
import OnChainFeed from '../components/Dashboard/OnChainFeed';
import AITrendScanner from '../components/Tools/AITrendScanner';
import RiskCalculator from '../components/Tools/RiskCalculator';
import EconomicCalendar from '../components/Tools/EconomicCalendar';
import SystemTelemetry from '../components/Dashboard/SystemTelemetry';
import SessionTracker from '../components/Dashboard/SessionTracker';
import SentimentGauge from '../components/Charts/SentimentGauge';
import PredictiveGlance from '../components/Dashboard/PredictiveGlance';
import OrderBookDepth from '../components/Dashboard/OrderBookDepth';
import RiskTelemetry from '../components/Dashboard/RiskTelemetry';
import CorrelationMatrix from '../components/Charts/CorrelationMatrix';
import MacroBarometer from '../components/Dashboard/MacroBarometer';
import NeuralForecastingHub from '../components/Dashboard/NeuralForecastingHub';
import StrategyBacktester from '../components/Dashboard/StrategyBacktester';
import WhaleFlowMap from '../components/Dashboard/WhaleFlowMap';
import SectorDecomposition from '../components/Dashboard/SectorDecomposition';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#3b82f6', '#00d4aa', '#f59e0b', '#8b5cf6', '#ff4757', '#06b6d4', '#10b981'];

export default function DashboardPage() {
  const { socket, listings } = useMarket();
  const [portfolio, setPortfolio] = useState(null);
  const [trending, setTrending] = useState([]);
  const [showCommand, setShowCommand] = useState(false);
  const [workspace, setWorkspace] = useState('TACTICAL'); // TACTICAL or ANALYTICS
  const [alphaSignal, setAlphaSignal] = useState(null);
  const [btcChart, setBtcChart] = useState([]);
  const [btcPrices, setBtcPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, t, c] = await Promise.all([getPortfolio(), getTrending(), getChartData('BTC', '7d')]);
        setPortfolio(p.data);
        setTrending(t.data);
        const pts = c.data.data;
        setBtcChart(pts);
        setBtcPrices(pts.map(d => d.price));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommand(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Initializing terminal...</p>
    </div>
  );

  const { summary, items } = portfolio || { summary: { totalValue: 0, totalInvested: 0, totalPnL: 0, totalPnLPct: 0 }, items: [] };
  const sortedItems = [...items].sort((a, b) => b.currentValue - a.currentValue);

  const allocationData = {
    labels: sortedItems.slice(0, 7).map(i => i.symbol),
    datasets: [{ data: sortedItems.slice(0, 7).map(i => i.currentValue), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }]
  };

  const lineData = {
    labels: btcChart.map((d, i) => i % 12 === 0 ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    datasets: [{ label: 'BTC Price', data: btcChart.map(d => d.price), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5e78', maxTicksLimit: 6 } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5e78', callback: v => '$' + v.toLocaleString() } }
    }
  };

  const donutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '75%',
    plugins: { legend: { position: 'right', labels: { color: '#8899b4', font: { size: 11 }, usePointStyle: true, padding: 20 } } }
  };

  const topCoin = [...items].sort((a, b) => b.profitPct - a.profitPct)[0];
  const totalMCap = listings?.reduce((s, c) => s + (c.marketCap || 0), 0) || 1;
  const btcDom = ((listings?.find(c => c.symbol === 'BTC')?.marketCap || 0) / totalMCap * 100);
  const ethDom = ((listings?.find(c => c.symbol === 'ETH')?.marketCap || 0) / totalMCap * 100);
  const altDom = Math.max(0, 100 - btcDom - ethDom);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 10px', position: 'relative' }}>
      {/* ── Command Bar (Floating) ─────────────────────────────────── */}
      {showCommand && (
        <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 500, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', borderRadius: 12, border: '1px solid var(--accent)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 9999, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 15, mb: 15 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <input autoFocus placeholder="Execute Terminal Command... (e.g., 'nav exchange', 'buy btc', 'calc risk')" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }} onBlur={() => setShowCommand(false)} />
          </div>
          <div style={{ fontSize: 10, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, mb: 10 }}>QUICK LINKS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Dashboard', 'Exchange', 'Alerts', 'Strategy Hub'].map(link => (
              <div key={link} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: 12, color: '#eef2fa', cursor: 'pointer' }} onMouseEnter={e => e.target.style.background = 'rgba(59,130,246,0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                Jump to {link}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Header Telemetry ────────────────────────────────────────── */}
      <SystemTelemetry />
      <MarketPulse />

      {/* ── Workspace Switcher & Alpha Signal ────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 20 }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
          {['TACTICAL', 'ANALYTICS'].map(mode => (
            <div key={mode} onClick={() => setWorkspace(mode)} style={{ 
              padding: '8px 20px', fontSize: 11, fontWeight: 800, cursor: 'pointer', borderRadius: 8,
              background: workspace === mode ? 'var(--blue)' : 'transparent',
              color: workspace === mode ? '#fff' : '#4a5e78',
              transition: 'all 0.2s ease'
            }}>
              {mode} MODE
            </div>
          ))}
        </div>

        {alphaSignal && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 15, padding: '10px 20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--blue)' }}>QUANT ALPHA FEED</span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 11, color: '#eef2fa' }}>[{alphaSignal.type}] <span style={{ fontWeight: 800 }}>{alphaSignal.asset}:</span> {alphaSignal.signal}</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--green)', fontWeight: 700 }}>C: {(alphaSignal.quality * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* ── The Multi-Pane Trading Console ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24, marginBottom: 24 }}>
        
        {/* CENTER COLUMN: Analysis & Execution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {workspace === 'TACTICAL' ? (
            <>
              {/* Row 1: Vital Metrics (Elite Glazed Tiles) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                 {[
                   { label: 'NET EQUITY', val: formatCurrency(summary.totalValue), change: formatPercent(summary.totalPnLPct), cls: 'blue' },
                   { label: 'INVESTED', val: formatCurrency(summary.totalInvested), change: `${items.length} POS`, cls: 'green' },
                   { label: 'TOTAL PNL', val: (summary.totalPnL >= 0 ? '+' : '') + formatCurrency(summary.totalPnL), change: formatPercent(summary.totalPnLPct), cls: summary.totalPnL >= 0 ? 'green' : 'red' },
                   { label: 'TRADING VOL', val: '$420.5k', change: '+12.4%', cls: 'gold' }
                 ].map((stat, i) => (
                    <div key={i} className={`stat-card ${stat.cls} glass-heavy`} style={{ padding: '16px 20px' }}>
                      <div className="stat-label" style={{ fontSize: 9 }}>{stat.label}</div>
                      <div className="stat-value" style={{ fontSize: 18, margin: '4px 0' }}>{stat.val}</div>
                      <div className={`stat-change ${getChangeClass(stat.change)}`}>{stat.change}</div>
                    </div>
                 ))}
              </div>

              {/* Row 2: Charts & Depth Diagnostics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
                <div className="card glass" style={{ padding: 0 }}>
                  <div className="card-header" style={{ padding: '12px 20px' }}>
                    <span className="card-title">BENCHMARK (BTC/USDT)</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <span className="badge badge-blue">WSS</span>
                       <span className="badge badge-green">LIVE</span>
                    </div>
                  </div>
                  <div style={{ height: 320, padding: 20 }}><Line data={lineData} options={chartOptions} /></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <OrderBookDepth />
                  <div className="card glass-heavy" style={{ padding: '16px', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <div style={{ fontSize: 10, color: '#4a5e78', mb: 10, fontWeight: 700 }}>EXECUTION BLADE</div>
                     <div style={{ display: 'flex', gap: 8, mt: 'auto' }}>
                        <button className="btn btn-primary" style={{ flex: 1, fontSize: 11, padding: 10, background: 'var(--green)' }}>MARKET BUY</button>
                        <button className="btn btn-primary" style={{ flex: 1, fontSize: 11, padding: 10, background: 'var(--red)' }}>MARKET SELL</button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Tactical & Flows Hub */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20 }}>
                <WhaleFlowMap />
                <StrategyBacktester />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <PredictiveGlance />
                   <SentimentGauge />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ANALYTICS MODE: Macro & Correlation Views */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 20 }}>
                <NeuralForecastingHub />
                <MacroBarometer />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                 <CorrelationMatrix />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <SectorDecomposition />
                   <RiskTelemetry />
                 </div>
              </div>
            </>
          )}

          {/* Row 4: Adaptive Intelligence Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: 20 }}>
            {workspace === 'TACTICAL' ? <RiskTelemetry /> : <StrategyBacktester />}
            <AITrendScanner />
            <EconomicCalendar />
          </div>

          {/* Row 5: Utility Row */}
          {workspace === 'TACTICAL' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <RiskCalculator />
              <SessionTracker />
              <div className="card glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#4a5e78' }}>
                 TERMINAL STATUS: NOMINAL
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Command Feed & Allocation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card glass" style={{ padding: 0 }}>
             <div className="card-header" style={{ padding: '12px 20px' }}><span className="card-title">ALLOCATION DENSITY</span></div>
             <div style={{ height: 250, padding: 20 }}>
                {items.length > 0 ? <Doughnut data={allocationData} options={donutOptions} /> : <div className="empty-state"><p>HOLDINGS EMPTY</p></div>}
             </div>
          </div>

          <div style={{ height: 450 }}><OnChainFeed /></div>
          
          <div className="card glass-heavy" style={{ flex: 1, padding: 0 }}>
            <div className="card-header" style={{ padding: '12px 20px' }}><span className="card-title">ALPHA LEADERS</span></div>
            <div style={{ padding: '0 16px 16px' }}>
              {trending?.topGainers?.slice(0, 8).map((coin, i) => (
                <div key={i} style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={coin.logo} width={18} height={18} alt="" />
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{coin.symbol}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>{formatPercent(coin.change24h)}</span>
                </div>
              ))}
            </div>
          </div>

          <FearGreedGauge />
        </div>
      </div>

      {/* ── Global Market News ────────────────────────────────────────── */}
      <div className="card glass-heavy">
        <div className="card-header"><span className="card-title">INTER-MARKET HUB FEED</span></div>
        <div style={{ padding: '0 20px 20px' }}>
          <NewsFeed />
        </div>
      </div>

      <style>{`
        .glass { background: rgba(255, 255, 255, 0.02) !important; backdrop-filter: blur(12px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.05) !important; }
        .glass-heavy { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.08) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .stat-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .stat-card:hover { transform: translateY(-5px) scale(1.02); border-color: rgba(255, 255, 255, 0.15) !important; }
        .card-title { font-family: 'Inter', sans-serif; letter-spacing: 0.5px; font-weight: 800; font-size: 11px; color: #8899b4; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
