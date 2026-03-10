import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const DARK = {
  '--bg-primary': '#080c14',
  '--bg-secondary': '#0d1420',
  '--bg-card': '#111827',
  '--bg-card-hover': '#161f30',
  '--bg-input': '#1a2435',
  '--border': '#1e2d42',
  '--border-light': '#243347',
  '--text-primary': '#e8edf5',
  '--text-secondary': '#8899b4',
  '--text-muted': '#4a5e78',
  '--accent': '#3b82f6',
  '--accent-hover': '#2563eb',
  '--accent-glow': 'rgba(59,130,246,0.15)',
  '--green': '#00d4aa',
  '--green-bg': 'rgba(0,212,170,0.08)',
  '--red': '#ff4757',
  '--red-bg': 'rgba(255,71,87,0.08)',
  '--gold': '#f59e0b',
  '--purple': '#8b5cf6',
  '--shadow': '0 4px 24px rgba(0,0,0,0.4)',
  '--chart-bg': '#080c14',
  '--chart-grid': 'rgba(255,255,255,0.04)',
};

const LIGHT = {
  '--bg-primary': '#f0f4f8',
  '--bg-secondary': '#ffffff',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#f8fafc',
  '--bg-input': '#f1f5f9',
  '--border': '#e2e8f0',
  '--border-light': '#cbd5e1',
  '--text-primary': '#0f172a',
  '--text-secondary': '#475569',
  '--text-muted': '#94a3b8',
  '--accent': '#2563eb',
  '--accent-hover': '#1d4ed8',
  '--accent-glow': 'rgba(37,99,235,0.12)',
  '--green': '#059669',
  '--green-bg': 'rgba(5,150,105,0.08)',
  '--red': '#dc2626',
  '--red-bg': 'rgba(220,38,38,0.08)',
  '--gold': '#d97706',
  '--purple': '#7c3aed',
  '--shadow': '0 4px 24px rgba(0,0,0,0.08)',
  '--chart-bg': '#ffffff',
  '--chart-grid': 'rgba(0,0,0,0.04)',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('cn-theme') || 'dark');

  useEffect(() => {
    const vars = theme === 'dark' ? DARK : LIGHT;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('cn-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
