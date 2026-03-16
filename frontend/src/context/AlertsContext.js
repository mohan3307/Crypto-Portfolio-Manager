import { getAlerts, createAlert, toggleAlert as apiToggleAlert, deleteAlert as apiDeleteAlert } from '../services/api';
import { useMarket } from './MarketContext';
import { useAuth } from './AuthContext';

const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useMarket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts on mount or user change
  useEffect(() => {
    if (user) {
      setLoading(true);
      getAlerts()
        .then(res => {
          setAlerts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch alerts:', err);
          setLoading(false);
        });
    } else {
      setAlerts([]);
    }
  }, [user]);

  // Handle real-time alert triggers from socket
  useEffect(() => {
    if (socket) {
      socket.on('priceAlertTriggered', (data) => {
        // Double check it's for this user (server broadcasts for now)
        if (data.userId === user?.id) {
          toast.error(data.message, { autoClose: 10000 });
          
          if (Notification.permission === 'granted') {
            new Notification('CryptoNova Pro Alert', { body: data.message, icon: '/favicon.ico' });
          }

          // Update local state to show as triggered
          setAlerts(prev => prev.map(a => 
            a._id === data.alertId ? { ...a, triggered: true, active: false, triggeredPrice: data.price, triggeredAt: new Date().toISOString() } : a
          ));
        }
      });
      return () => socket.off('priceAlertTriggered');
    }
  }, [socket, user]);

  const addAlert = async (alertData) => {
    try {
      const res = await createAlert(alertData);
      setAlerts(prev => [res.data, ...prev]);
      toast.success(`Alert set for ${alertData.coinName}`);
      return res.data;
    } catch (err) {
      toast.error('Failed to create alert');
      throw err;
    }
  };

  const removeAlert = async (id) => {
    try {
      await apiDeleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
      toast.success('Alert removed');
    } catch (err) {
      toast.error('Failed to remove alert');
    }
  };

  const toggleAlertStatus = async (id) => {
    try {
      const res = await apiToggleAlert(id);
      setAlerts(prev => prev.map(a => a._id === id ? res.data : a));
      toast.success(`Alert ${res.data.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to toggle alert');
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <AlertsContext.Provider value={{ alerts, loading, addAlert, removeAlert, toggleAlert: toggleAlertStatus, requestPermission }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertsContext);
