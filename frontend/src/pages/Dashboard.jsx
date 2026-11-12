// import { useEffect, useState } from 'react'
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
// } from 'recharts'
// import { getDashboardStats, getTransactions } from '../api/fraud'
// import StatCard from '../components/StatCard'

// const COLORS = ['#3b5bdb', '#f03e3e']

// export default function Dashboard() {
//   const [stats, setStats]   = useState(null)
//   const [recent, setRecent] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     Promise.all([getDashboardStats(), getTransactions({ page_size: 7 })])
//       .then(([s, t]) => {
//         setStats(s.data)
//         setRecent(t.data.results || [])
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <div className="flex items-center justify-center h-64">
//       <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
//     </div>
//   )

//   const pieData = [
//     { name: 'Legitimate', value: stats?.total_legitimate || 0 },
//     { name: 'Fraud',      value: stats?.total_fraud      || 0 },
//   ]

//   const riskData = [
//     { name: 'Low Risk',    value: (stats?.total_transactions || 0) - (stats?.high_risk_count || 0) - Math.floor((stats?.total_fraud || 0) * 0.4) },
//     { name: 'Medium Risk', value: Math.floor((stats?.total_fraud || 0) * 0.4) },
//     { name: 'High Risk',   value: stats?.high_risk_count || 0 },
//   ]

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
//         <p className="text-sm text-slate-500 mt-1">Real-time fraud monitoring overview</p>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
//         <StatCard icon="⇄" label="Total Transactions" value={stats?.total_transactions?.toLocaleString() ?? 0}   color="blue"  />
//         <StatCard icon="⚠" label="Fraud Detected"     value={stats?.total_fraud?.toLocaleString() ?? 0}          color="red"   sub={`${stats?.fraud_rate ?? 0}% rate`} />
//         <StatCard icon="✓" label="Legitimate"          value={stats?.total_legitimate?.toLocaleString() ?? 0}     color="green" />
//         <StatCard icon="⬆" label="High Risk"           value={stats?.high_risk_count?.toLocaleString() ?? 0}      color="amber" />
//       </div>

//       {/* Amount cards */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="card">
//           <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Amount Processed</p>
//           <p className="text-3xl font-bold text-slate-800 mt-1">
//             ${stats?.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
//           </p>
//         </div>
//         <div className="card border-red-100 bg-red-50">
//           <p className="text-xs font-medium text-red-400 uppercase tracking-wide">Fraud Amount</p>
//           <p className="text-3xl font-bold text-red-600 mt-1">
//             ${stats?.fraud_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
//           </p>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="card">
//           <h2 className="font-semibold text-slate-700 mb-4">Transaction Distribution</h2>
//           <ResponsiveContainer width="100%" height={220}>
//             <PieChart>
//               <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
//                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
//                    labelLine={false}>
//                 {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
//               </Pie>
//               <Tooltip formatter={(v) => v.toLocaleString()} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="card">
//           <h2 className="font-semibold text-slate-700 mb-4">Risk Level Breakdown</h2>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={riskData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//               <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//               <YAxis tick={{ fontSize: 11 }} />
//               <Tooltip />
//               <Bar dataKey="value" fill="#3b5bdb" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent transactions */}
//       <div className="card">
//         <h2 className="font-semibold text-slate-700 mb-4">Recent Transactions</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
//                 <th className="pb-3 text-left">Transaction ID</th>
//                 <th className="pb-3 text-right">Amount</th>
//                 <th className="pb-3 text-center">Risk</th>
//                 <th className="pb-3 text-center">Fraud %</th>
//                 <th className="pb-3 text-center">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {recent.map(tx => (
//                 <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
//                   <td className="py-3 font-mono text-xs text-slate-600">{tx.transaction_id}</td>
//                   <td className="py-3 text-right font-semibold">${Number(tx.amount).toFixed(2)}</td>
//                   <td className="py-3 text-center">
//                     <span className={`badge-${tx.risk_level}`}>{tx.risk_level}</span>
//                   </td>
//                   <td className="py-3 text-center text-slate-600">{(tx.fraud_prob * 100).toFixed(1)}%</td>
//                   <td className="py-3 text-center">
//                     {tx.is_fraud
//                       ? <span className="badge-fraud">Fraud</span>
//                       : <span className="badge-ok">OK</span>}
//                   </td>
//                 </tr>
//               ))}
//               {recent.length === 0 && (
//                 <tr><td colSpan={5} className="py-8 text-center text-slate-400">No transactions yet</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { getDashboardStats, getTransactions } from '../api/fraud'
import StatCard from '../components/StatCard'

const COLORS = ['#3b5bdb', '#f03e3e']

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getTransactions({ page_size: 7 })])
      .then(([s, t]) => {
        // ✅ FIX: API functions already return res.data, no need for .data again
        setStats(s)
        setRecent(t.results || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
    </div>
  )

  const pieData = [
    { name: 'Legitimate', value: stats?.total_legitimate || 0 },
    { name: 'Fraud',      value: stats?.total_fraud      || 0 },
  ]

  const riskData = [
    { name: 'Low Risk',    value: (stats?.total_transactions || 0) - (stats?.high_risk_count || 0) - Math.floor((stats?.total_fraud || 0) * 0.4) },
    { name: 'Medium Risk', value: Math.floor((stats?.total_fraud || 0) * 0.4) },
    { name: 'High Risk',   value: stats?.high_risk_count || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time fraud monitoring overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="⇄" label="Total Transactions" value={stats?.total_transactions?.toLocaleString() ?? 0}   color="blue"  />
        <StatCard icon="⚠" label="Fraud Detected"     value={stats?.total_fraud?.toLocaleString() ?? 0}          color="red"   sub={`${stats?.fraud_rate ?? 0}% rate`} />
        <StatCard icon="✓" label="Legitimate"          value={stats?.total_legitimate?.toLocaleString() ?? 0}     color="green" />
        <StatCard icon="⬆" label="High Risk"           value={stats?.high_risk_count?.toLocaleString() ?? 0}      color="amber" />
      </div>

      {/* Amount cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Amount Processed</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            ${stats?.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </p>
        </div>
        <div className="card border-red-100 bg-red-50">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wide">Fraud Amount</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            ${stats?.fraud_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Transaction Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                   dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                   labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Risk Level Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b5bdb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="pb-3 text-left">Transaction ID</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Risk</th>
                <th className="pb-3 text-center">Fraud %</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono text-xs text-slate-600">{tx.transaction_id}</td>
                  <td className="py-3 text-right font-semibold">${Number(tx.amount).toFixed(2)}</td>
                  <td className="py-3 text-center">
                    <span className={`badge-${tx.risk_level}`}>{tx.risk_level}</span>
                  </td>
                  <td className="py-3 text-center text-slate-600">{(tx.fraud_prob * 100).toFixed(1)}%</td>
                  <td className="py-3 text-center">
                    {tx.is_fraud
                      ? <span className="badge-fraud">Fraud</span>
                      : <span className="badge-ok">OK</span>}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
