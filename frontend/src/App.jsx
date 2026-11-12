<<<<<<< HEAD
import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return Boolean(token && token !== "undefined" && token !== "null");
  });

  return auth ? (
    <Dashboard setAuth={setAuth} />
  ) : (
    <Login setAuth={setAuth} />
  );
}

export default App;
=======
import { Routes, Route } from 'react-router-dom'
import Sidebar      from './components/Sidebar'
import Dashboard    from './pages/Dashboard'
import Predict      from './pages/Predict'
import Transactions from './pages/Transactions'
import Alerts       from './pages/Alerts'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/"              element={<Dashboard />}    />
            <Route path="/predict"       element={<Predict />}      />
            <Route path="/transactions"  element={<Transactions />} />
            <Route path="/alerts"        element={<Alerts />}       />
          </Routes>
        </div>
      </main>
    </div>
  )
}
>>>>>>> a9ecf3619af91e3193a93059edaf30eb81b1a071
