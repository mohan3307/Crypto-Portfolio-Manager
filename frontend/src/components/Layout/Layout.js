import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAlerts } from '../../context/AlertsContext';
import MacroPulse from './MacroPulse';
import CommandPalette from './CommandPalette';

const Icons = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Portfolio: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Analytics: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  Market:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>,
  Compare:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Watchlist: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trending:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  Trading:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8,10 10,7 13,10 17,6"/></svg>,
  Paper:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  Alerts:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Profile:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Strategy:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  Roadmap:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>,
  Exchanges: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20z"/></svg>,
  Categories:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Community: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  News:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="12" x2="16" y2="10"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  NFTs:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Volatility:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Calendar:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  AI:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/><path d="M12 22v-5"/><circle cx="12" cy="12" r="3"/></svg>,
};

const NAV = [
  { section: 'PRIME', items: [{ path: '/dashboard', label: 'MISSION_CONTROL', icon: 'Dashboard' }] },
  { section: 'DIAGNOSTICS', items: [{ path: '/portfolio', label: 'ASSET_VAULT', icon: 'Portfolio' }, { path: '/analytics', label: 'INTELLIGENCE', icon: 'Analytics' }, { path: '/ai-predictions', label: 'NEURAL_FORECAST', icon: 'AI' }] },
  { section: 'SURVEILLANCE', items: [
      { path: '/market', label: 'LIQUIDITY_MAP', icon: 'Market' }, 
      { path: '/exchanges', label: 'EXCHANGE_INDEX', icon: 'Exchanges' },
      { path: '/categories', label: 'ECOSYSTEM_SEGMENT', icon: 'Categories' },
      { path: '/community', label: 'COMMUNITY_HUB', icon: 'Community' },
      { path: '/news', label: 'INTEL_STREAM', icon: 'News' },
      { path: '/nfts', label: 'COLLECTIBLE_INDEX', icon: 'NFTs' },
      { path: '/volatility', label: 'VOLATILITY_ENGINE', icon: 'Volatility' },
      { path: '/calendar', label: 'PROTOCOL_EVENTS', icon: 'Calendar' },
      { path: '/compare', label: 'NODE_COMPARE', icon: 'Compare' }, 
      { path: '/watchlist', label: 'PRIORITY_LIST', icon: 'Watchlist' }
    ] 
  },
  { section: 'EXECUTION', items: [{ path: '/trading', label: 'LIVE_TERMINAL', icon: 'Trading' }, { path: '/paper', label: 'SIM_PROTOCOL', icon: 'Paper' }, { path: '/strategy', label: 'ALGO_WORKSPACE', icon: 'Strategy' }] },
  { section: 'PROTOCOL', items: [{ path: '/roadmap', label: 'EVOLUTION_MAP', icon: 'Roadmap' }, { path: '/alerts', label: 'THREAT_LOGS', icon: 'Alerts' }, { path: '/profile', label: 'IDENTITY_CORE', icon: 'Profile' }] },
];

const TITLES = {
  '/dashboard': 'MISSION_CONTROL', '/portfolio': 'ASSET_VAULT', '/analytics': 'INTELLIGENCE_CENTER',
  '/market': 'LIQUIDITY_MAP', '/compare': 'NODE_DIAGNOSTICS', '/watchlist': 'PRIORITY_SURVEILLANCE',
  '/trending': 'MOMENTUM_RADAR', '/trading': 'LIVE_EXECUTION', '/paper': 'SIMULATION_TERMINAL',
  '/alerts': 'THREAT_MONITOR', '/profile': 'IDENTITY_CORE', '/strategy': 'ALGORITHM_DEPOT',
  '/roadmap': 'EVOLUTION_BLUEPRINT', '/exchanges': 'EXCHANGE_DATABASE', '/categories': 'ECOSYSTEM_SEGMENTS',
  '/community': 'COMMUNITY_NETWORK', '/news': 'LATEST_INTELLIGENCE', '/nfts': 'NFT_REGISTRY', 
  '/volatility': 'HIGH_VOLATILITY_ENGINE', '/calendar': 'EVENT_CHRONOLOGY', '/ai-predictions': 'NEURAL_INTELLIGENCE',
};

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  const activeAlerts = alerts.filter(a => a.active && !a.triggered).length;
  const title = TITLES[location.pathname] || 'CRYPTONOVA_V4.2';
  const isTradingPage = location.pathname === '/trading';

  return (
    <>
      {/* ── Macro Pulse Strip ── */}
      <MacroPulse />

      <div className="v4-layout-container">
        {/* ── Sidebar ── */}
        <aside className="v4-sidebar">
          <div className="v4-sidebar-header">
            <div className="v4-logo-cluster">
              <div className="v4-logo-icon">⬢</div>
              <div>
                <div className="v4-logo-text">CRYPTONOVA</div>
                <div className="v4-logo-sub">V4.2_TERMINAL</div>
              </div>
            </div>
          </div>

          <nav className="v4-sidebar-nav v4-scroller">
            {NAV.map(({ section, items }) => (
              <div key={section} className="v4-nav-section">
                <div className="v4-section-label">{section}</div>
                {items.map(({ path, label, icon }) => {
                  const Icon = Icons[icon];
                  return (
                    <NavLink key={path} to={path} className={({ isActive }) => `v4-nav-link ${isActive ? 'active' : ''}`}>
                      <div className="v4-nav-icon"><Icon /></div>
                      <span className="v4-nav-label">{label}</span>
                      {path === '/alerts' && activeAlerts > 0 && <span className="v4-nav-badge red">{activeAlerts}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="v4-sidebar-footer">
            <div className="v4-user-box">
              <div className="v4-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div className="v4-user-info">
                <div className="v4-user-name">{user?.name}</div>
                <div className="v4-user-role">ID: {user?.id?.slice(0,8)}</div>
              </div>
            </div>
            <button className="v4-logout-btn" onClick={() => { logoutUser(); navigate('/login'); }}>
              <span>TERMINATE</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="v4-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <header className="v4-topbar">
            <div className="v4-topbar-left">
              <div className="v4-page-title">{title}</div>
            </div>
            
            <div className="v4-topbar-right">
              <div className="v4-kbd-trigger" onClick={() => setCmdOpen(true)}>
                <span className="hint">NAVIGATE</span>
                <span className="kbd">⌘ K</span>
              </div>
              <div className="v4-time-node">{time}</div>
              <div className="v4-topbar-actions">
                  <button className="v4-action-btn" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              </div>
            </div>
          </header>

          <main className={isTradingPage ? 'v4-content-full' : 'v4-content-padded'} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette isOpen={cmdOpen} onClose={setCmdOpen} />

      <style>{`
        .v4-layout-container { display: flex; flex-direction: row; height: calc(100vh - 28px); width: 100vw; background: #000; color: #fff; overflow: hidden; font-family: var(--font-mono); }
        
        .v4-sidebar { width: 240px; background: #070707; border-right: 2px solid var(--border); display: flex; flex-direction: column; }
        .v4-sidebar-header { padding: 24px; border-bottom: 2px solid var(--border); }
        .v4-logo-cluster { display: flex; align-items: center; gap: 12px; }
        .v4-logo-icon { width: 32px; height: 32px; background: #fff; color: #000; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; }
        .v4-logo-text { font-size: 14px; font-weight: 900; letter-spacing: -0.5px; }
        .v4-logo-sub { font-size: 8px; color: var(--text-dim); font-weight: 800; letter-spacing: 2px; margin-top: 2px; }

        .v4-sidebar-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
        .v4-nav-section { margin-bottom: 24px; }
        .v4-section-label { font-size: 8px; color: var(--text-dim); font-weight: 950; letter-spacing: 2px; padding: 0 16px 8px; text-transform: uppercase; }
        
        .v4-nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--text-muted); text-decoration: none; font-size: 11px; font-weight: 700; transition: 0.1s; border-left: 2px solid transparent; }
        .v4-nav-link:hover { background: #0d0d0d; color: #fff; }
        .v4-nav-link.active { background: #0f0f0f; color: #fff; border-left-color: #fff; }
        
        .v4-nav-icon { display: flex; align-items: center; width: 14px; opacity: 0.6; }
        .v4-nav-link.active .v4-nav-icon { opacity: 1; }

        .v4-sidebar-footer { padding: 16px; border-top: 2px solid var(--border); }
        .v4-user-box { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .v4-avatar { width: 32px; height: 32px; border-radius: 2px; background: #111; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #fff; border: 1px solid var(--border); }
        .v4-user-name { font-size: 12px; font-weight: 900; color: #fff; }
        .v4-user-role { font-size: 8px; color: var(--text-dim); margin-top: 2px; }

        .v4-logout-btn { width: 100%; padding: 8px; background: transparent; border: 1px solid var(--border); color: var(--red); font-size: 9px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .v4-logout-btn:hover { background: var(--red); color: #fff; border-color: var(--red); }

        .v4-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #090909; }
        .v4-topbar { height: 52px; padding: 0 24px; background: #000; border-bottom: 2px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .v4-page-title { font-size: 14px; font-weight: 900; color: #fff; letter-spacing: 1px; text-transform: uppercase; }

        .v4-topbar-right { display: flex; align-items: center; gap: 24px; }
        .v4-kbd-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; background: #090909; transition: 0.2s; }
        .v4-kbd-trigger:hover { border-color: var(--text-muted); }
        .v4-kbd-trigger .hint { font-size: 9px; color: var(--text-dim); font-weight: 800; }
        .v4-kbd-trigger .kbd { font-size: 10px; color: #fff; font-weight: 900; background: #1a1a1a; padding: 1px 4px; border-radius: 2px; }

        .v4-time-node { font-size: 11px; font-weight: 900; color: var(--text-secondary); font-family: var(--font-mono); }
        .v4-action-btn { background: none; border: none; color: var(--text-muted); font-size: 16px; cursor: pointer; transition: 0.2s; }
        .v4-action-btn:hover { color: #fff; }

        .v4-content-padded { padding: 24px; flex: 1; overflow-y: auto; }
        .v4-content-full { flex: 1; overflow: hidden; }

        .v4-scroller::-webkit-scrollbar { width: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-light); }
      `}</style>
    </>
  );
}
