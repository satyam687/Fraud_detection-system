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
