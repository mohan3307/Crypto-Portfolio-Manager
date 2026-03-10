import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cn-alerts') || '[]'); } catch { return []; }
  });
  const [triggeredIds, setTriggeredIds] = useState(new Set());
  const pricesRef = useRef({});

  // Persist alerts
  useEffect(() => {
    localStorage.setItem('cn-alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now().toString(),
      symbol: alert.symbol.toUpperCase(),
      coinName: alert.coinName,
      type: alert.type,       // 'above' | 'below' | 'change_pct'
      value: parseFloat(alert.value),
      note: alert.note || '',
      createdAt: new Date().toISOString(),
      triggered: false,
      active: true,
    };
    setAlerts(prev => [newAlert, ...prev]);
    toast.success(`Alert set for ${alert.coinName}`);
    return newAlert;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const clearTriggered = () => {
    setAlerts(prev => prev.filter(a => !a.triggered));
  };

  // Check alerts against live prices (called by market polling)
  const checkAlerts = (prices) => {
    pricesRef.current = prices;
    setAlerts(prev => prev.map(alert => {
      if (!alert.active || alert.triggered || triggeredIds.has(alert.id)) return alert;
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) return alert;

      let fired = false;
      let message = '';

      if (alert.type === 'above' && currentPrice >= alert.value) {
        fired = true;
        message = `🚨 ${alert.coinName} crossed ABOVE $${alert.value.toLocaleString()}`;
      } else if (alert.type === 'below' && currentPrice <= alert.value) {
        fired = true;
        message = `🚨 ${alert.coinName} dropped BELOW $${alert.value.toLocaleString()}`;
      }

      if (fired) {
        toast.error(message, { autoClose: 8000 });
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('CryptoNova Alert', { body: message, icon: '/favicon.ico' });
        }
        setTriggeredIds(s => new Set([...s, alert.id]));
        return { ...alert, triggered: true, triggeredAt: new Date().toISOString(), triggeredPrice: currentPrice };
      }
      return alert;
    }));
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, removeAlert, toggleAlert, clearTriggered, checkAlerts, requestPermission }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertsContext);
