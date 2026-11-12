// import axios from 'axios'

// const API = axios.create({
//   baseURL: '/api/fraud',
//   headers: { 'Content-Type': 'application/json' },
// })


// fetch("http://127.0.0.1:8000/api/fraud/predict/", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({
//     time: 10000,
//     amount: 500,
//     v1: 0.1,
//     v2: -0.2
//   })
// })
// .then(res => res.json())
// .then(data => console.log(data))

// // ── Fraud prediction ─────────────────────────────────────────────────────
// export const predictFraud = (payload) => API.post('/predict/', payload)

// // ── Transactions list  (supports ?risk=high&is_fraud=true&search=TX&page=1)
// export const getTransactions = (params = {}) =>
//   API.get('/transactions/', { params })

// // ── Single transaction
// export const getTransaction = (id) => API.get(`/transactions/${id}/`)

// // ── Dashboard stats
// export const getDashboardStats = () => API.get('/stats/')

// // ── Fraud alerts
// export const getAlerts = () => API.get('/alerts/')
// export const resolveAlert = (id) => API.patch(`/alerts/${id}/resolve/`)

import axios from "axios";
// ✅ Use relative URL - Vite proxy will forward to http://localhost:8000
const API = axios.create({
  baseURL: "/api/fraud",
  headers: { "Content-Type": "application/json" },
});

// ── Fraud prediction ─────────────────────────────
export const predictFraud = async (payload) => {
  try {
    const res = await API.post("/predict/", payload);
    return res.data;
  } catch (error) {
    console.error("Predict API Error:", error.response?.data || error.message);
    throw error;
  }
};

// ── Transactions list ───────────────────────────
export const getTransactions = async (params = {}) => {
  const res = await API.get("/transactions/", { params });
  return res.data;
};

// ── Single transaction ──────────────────────────
export const getTransaction = async (id) => {
  const res = await API.get(`/transactions/${id}/`);
  return res.data;
};

// ── Dashboard stats ─────────────────────────────
export const getDashboardStats = async () => {
  const res = await API.get("/stats/");
  return res.data;
};

// ── Fraud alerts ────────────────────────────────
export const getAlerts = async () => {
  const res = await API.get("/alerts/");
  return res.data;
};

export const resolveAlert = async (id) => {
  const res = await API.patch(`/alerts/${id}/resolve/`);
  return res.data;
};
