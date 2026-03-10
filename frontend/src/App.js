import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertsProvider } from './context/AlertsContext';
import { PaperTradingProvider } from './context/PaperTradingContext';
import Layout from './components/Layout/Layout';
import AIChatBot from './components/Charts/AIChatBot';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketPage from './pages/MarketPage';
import WatchlistPage from './pages/WatchlistPage';
import TrendingPage from './pages/TrendingPage';
import TradingPage from './pages/TradingPage';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import PaperTradingPage from './pages/PaperTradingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ComparePage from './pages/ComparePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Loading CryptoNova...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertsProvider>
          <PaperTradingProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="portfolio" element={<PortfolioPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="market" element={<MarketPage />} />
                  <Route path="compare" element={<ComparePage />} />
                  <Route path="watchlist" element={<WatchlistPage />} />
                  <Route path="trending" element={<TrendingPage />} />
                  <Route path="trading" element={<TradingPage />} />
                  <Route path="paper" element={<PaperTradingPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
              <AIChatBot />
            </BrowserRouter>
            <ToastContainer
              position="top-right" autoClose={3000}
              toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </PaperTradingProvider>
        </AlertsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
