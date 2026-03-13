import axios from "axios";

// Base API instance
const API = axios.create({
  baseURL: 'https://crypto-portfolio-manager-ufz4.vercel.app/api'  // ← add /api
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


// ================= MARKET =================
export const getListings = () => API.get("/market/listings");
export const getTrending = () => API.get("/market/trending");
export const getPrices = (symbols) =>
  API.get(`/market/prices${symbols ? `?symbols=${symbols}` : ""}`);
export const getChartData = (symbol, timeframe) =>
  API.get(`/market/chart/${symbol}/${timeframe}`);


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

export default API;