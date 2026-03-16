import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAlerts } from '../../context/AlertsContext';

const Icons = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Portfolio: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Analytics: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  Market:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>,
  Compare:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Watchlist: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trending:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  Trading:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="7,10 10,7 13,10 17,6"/></svg>,
  Paper:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  Alerts:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Profile:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Strategy:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  Roadmap:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M9 18l6-6-6-6"/></svg>,
};

const NAV = [
  { section: 'Overview',  items: [{ path:'/dashboard', label:'Dashboard',    icon:'Dashboard' }] },
  { section: 'Portfolio', items: [{ path:'/portfolio',  label:'My Portfolio', icon:'Portfolio' }, { path:'/analytics',  label:'Analytics',    icon:'Analytics' }] },
  { section: 'Markets',   items: [{ path:'/market',    label:'Market',       icon:'Market' }, { path:'/compare',   label:'Compare',      icon:'Compare' }, { path:'/watchlist',  label:'Watchlist',    icon:'Watchlist' }, { path:'/trending',   label:'Trending',     icon:'Trending' }] },
  {section: 'Trading',   items: [{ path:'/trading',   label:'Live Terminal', icon:'Trading' }, { path:'/paper',     label:'Paper Trading', icon:'Paper' }, { path:'/strategy',   label:'Strategy Hub',  icon:'Strategy' }] },
  { section: 'Vision',    items: [{ path:'/roadmap',   label:'Future Roadmap', icon:'Roadmap' }] },
  { section: 'Tools',     items: [{ path:'/alerts',    label:'Price Alerts', icon:'Alerts' }, { path:'/profile',   label:'Profile',      icon:'Profile' }] },
];

const TITLES = {
  '/dashboard':'Dashboard', '/portfolio':'My Portfolio', '/analytics':'Analytics',
  '/market':'Market', '/compare':'Compare', '/watchlist':'Watchlist',
  '/trending':'Trending', '/trading':'Live Terminal', '/paper':'Paper Trading',
  '/alerts':'Price Alerts', '/profile':'Profile', '/strategy':'Strategy Hub',
  '/roadmap':'Future Roadmap',
};

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { alerts } = useAlerts();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeAlerts = alerts.filter(a => a.active && !a.triggered).length;
  const title = TITLES[location.pathname] || 'CryptoNova';
  const isTradingPage = location.pathname === '/trading';

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">⬡</div>
            <div>
              <div className="sidebar-logo-text">CryptoNova</div>
              <div className="sidebar-logo-sub">Pro Terminal</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(({ path, label, icon }) => {
                const Icon = Icons[icon];
                return (
                  <NavLink key={path} to={path}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <Icon />
                    <span style={{ flex: 1 }}>{label}</span>
                    {path === '/alerts' && activeAlerts > 0 && (
                      <span className="nav-badge nav-badge-red">{activeAlerts}</span>
                    )}
                    {path === '/paper' && (
                      <span className="nav-badge nav-badge-blue">SIM</span>
                    )}
                    {path === '/trading' && (
                      <span style={{ width: 6, height: 6, background: '#00e5b3', borderRadius: '50%', display: 'inline-block', animation: 'livepulse 1.8s infinite', flexShrink: 0 }} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div className="user-email" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logoutUser(); navigate('/login'); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <div className="header-title" style={{ fontFamily:'var(--font-display)' }}>{title}</div>
            {isTradingPage && (
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#00e5b3', background:'rgba(0,229,179,0.07)', border:'1px solid rgba(0,229,179,0.2)', padding:'3px 10px', borderRadius:20, fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>
                <span style={{ width:5, height:5, background:'#00e5b3', borderRadius:'50%', display:'inline-block', animation:'livepulse 1.8s infinite' }} />
                TERMINAL ACTIVE
              </div>
            )}
          </div>
          <div className="header-right">
            <div className="live-badge">
              <div className="live-dot" />
              LIVE
            </div>
            <div className="header-clock">{time}</div>
            <div className="header-icon-btn alert-bell" onClick={() => navigate('/alerts')} title="Price Alerts">
              🔔
              {activeAlerts > 0 && <div className="header-notif-dot">{activeAlerts}</div>}
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className={isTradingPage ? '' : 'page-content'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
