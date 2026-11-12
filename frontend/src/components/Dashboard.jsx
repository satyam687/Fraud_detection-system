 import { useEffect, useState } from "react";
import axios from "axios";
import TransactionForm from "./TransactionForm";
import FraudChart from "./FraudChart";

export default function Dashboard({ setAuth }) {
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  const fetchData = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [historyRes, metricsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/history/", { headers }),
        axios.get("http://127.0.0.1:8000/metrics/", { headers }),
      ]);

      setTransactions(historyRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.log(err);

      if (!err.response) {
        setError("Backend server not running 🚨");
      } else if (err.response.status === 401) {
        handleLogout();
      }
    }
  };

  // ✅ load data
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Fraud Detection Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* ❌ ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500 text-white p-3 mb-4 rounded">
          {error}
        </div>
      )}

      {/* ✅ FORM */}
      <TransactionForm refresh={fetchData} onUnauthorized={handleLogout} />

      {/* ✅ MODEL & DATASET METRICS */}
      {metrics && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-bold mb-3">ML Model & Dataset Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Dataset Size</span>
              <span className="font-semibold">{metrics.dataset_size} records</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Fraud Records</span>
              <span className="font-semibold text-red-600">{metrics.fraud_records}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Legitimate Records</span>
              <span className="font-semibold text-green-600">{metrics.legitimate_records}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">ML Algorithm</span>
              <span className="font-semibold">{metrics.ml_algorithm}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Train / Test Split</span>
              <span className="font-semibold">
                {metrics.train_test_split} ({metrics.train_size} / {metrics.test_size})
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Precision</span>
              <span className="font-semibold">{(metrics.precision * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">Recall</span>
              <span className="font-semibold">{(metrics.recall * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">F1-Score</span>
              <span className="font-semibold">{(metrics.f1_score * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 block">ROC-AUC</span>
              <span className="font-semibold">{(metrics.roc_auc * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* ✅ TRANSACTION LIST */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Transactions</h2>

          {transactions.length === 0 ? (
            <p>No data</p>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="border-b py-2">
                ₹{t.amount} | {t.email} |{" "}
                <span
                  className={
                    t.is_fraud
                      ? "text-red-500 font-bold"
                      : "text-green-500 font-bold"
                  }
                >
                  {t.is_fraud ? "❌ Fraud" : "✅ Safe"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ✅ CHART */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Analytics</h2>
          <FraudChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
}