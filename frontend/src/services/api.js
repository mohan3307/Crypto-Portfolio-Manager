import axios from "axios";

// Base API instance
const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api` || "http://localhost:5000/api"
});

// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or unauthorized
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


// ================= AUTH =================
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const getMe = () => API.get("/auth/me");
export const askAI = (data) => API.post("/ai/ask", data);
export const getAIPredictions = () => API.get("/ai/predictions");


// ================= MARKET =================
export const getListings = () => API.get("/market/listings");
export const getTrending = () => API.get("/market/trending");
export const getPrices = (symbols) =>
  API.get(`/market/prices${symbols ? `?symbols=${symbols}` : ""}`);
export const getChartData = (symbol, timeframe) =>
  API.get(`/market/chart/${symbol}/${timeframe}`);

export const getExchanges = () => API.get("/market/exchanges");
export const getCategories = () => API.get("/market/categories");
export const getNews = () => API.get("/market/news/feed");
export const getNFTs = () => API.get("/market/nfts/top");
export const getCalendar = () => API.get("/market/calendar/events");
export const getCommunity = () => API.get("/market/community/feed");
export const getFearGreed = () => API.get("/market/fear-greed");
export const getRiskTelemetry = () => API.get("/market/risk-telemetry");
export const getGlobalStats = () => API.get("/market/global-stats");
export const getMacroCalendar = () => API.get("/market/calendar/macro");
export const getRoadmap = () => API.get("/market/roadmap");
export const getStrategies = () => API.get("/market/strategies");


// ================= PORTFOLIO =================
export const getPortfolio = () => API.get("/portfolio");
export const addToPortfolio = (data) => API.post("/portfolio/add", data);
export const updatePortfolioItem = (id, data) =>
  API.put(`/portfolio/${id}`, data);
export const deletePortfolioItem = (id) =>
  API.delete(`/portfolio/${id}`);


// ================= WATCHLIST =================
export const getWatchlist = () => API.get("/watchlist");
export const addToWatchlist = (data) =>
  API.post("/watchlist/add", data);
export const removeFromWatchlist = (coinId) =>
  API.delete(`/watchlist/${coinId}`);


// ================= USER =================
export const updateProfile = (data) =>
  API.put("/user/profile", data);
export const changePassword = (data) =>
  API.put("/user/password", data);


// ================= ALERTS =================
export const getAlerts = () => API.get("/alerts");
export const createAlert = (data) => API.post("/alerts", data);
export const toggleAlert = (id) => API.patch(`/alerts/${id}/toggle`);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);


// ================= PAPER TRADING =================
export const getPaperPositions = () => API.get("/paper/positions");
export const getPaperHistory = () => API.get("/paper/history");
export const openPaperPosition = (data) => API.post("/paper/open", data);
export const closePaperPosition = (id, data) => API.post(`/paper/close/${id}`, data);
export const resetPaperAccount = () => API.post("/paper/reset");


export default API;