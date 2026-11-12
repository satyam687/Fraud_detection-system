import { useEffect, useState } from 'react'
import { getAlerts, resolveAlert } from '../api/fraud'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)

    getAlerts()
      .then(res => {
        console.log("API RESPONSE:", res.data) // ✅ debug
        setAlerts(res?.data?.results || res?.data || [])
      })
      .catch(() => setAlerts([])) // ✅ fallback
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()

    const interval = setInterval(() => {
      load()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleResolve = async (id) => {
    await resolveAlert(id)
    load()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fraud Alerts</h1>
          <p className="text-sm text-gray-500">
            {alerts?.length || 0} alerts
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading...</p>
      ) : alerts?.length === 0 ? (
        <p>No alerts</p>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className="bg-white p-4 rounded shadow">
            <p>{alert.message}</p>
            <button onClick={() => handleResolve(alert.id)}>
              Resolve
            </button>
          </div>
        ))
      )}
    </div>
  )
}

// import { useEffect, useState } from 'react'
// import { getAlerts, resolveAlert } from '../api/fraud'
// import { useEffect, useState } from "react";

// export default function Alerts() {
//   const [alerts, setAlerts] = useState([]);

//   useEffect(() => {
//     fetchAlerts();
//   }, []); // ✅ important

//   const fetchAlerts = async () => {
//     const res = await fetch("/api/fraud/alerts/");
//     const data = await res.json();
//     setAlerts(data);
//   };

//   return (
//     <div>
//       <h3>Fraud Alerts</h3>
//       {alerts.length === 0 ? <p>No alerts</p> : alerts.map(a => <p key={a.id}>{a.message}</p>)}
//     </div>
//   );
// }
// useEffect(() => {
//   fetchAlerts();

//   const interval = setInterval(() => {
//     fetchAlerts();
//   }, 10000); // every 10 sec

//   return () => clearInterval(interval);
// }, []);
// export default function Alerts() {
//   const [alerts,  setAlerts]  = useState([])
//   const [loading, setLoading] = useState(true)

//   const load = () => {
//     setLoading(true)
//     getAlerts().then(r => setAlerts(r.data)).finally(() => setLoading(false))
//   }

//   useEffect(() => { load() }, [])

//   const handleResolve = async (id) => {
//     await resolveAlert(id)
//     load()
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Fraud Alerts</h1>
//           <p className="text-sm text-slate-500 mt-1">{alerts.length} unresolved alert{alerts.length !== 1 ? 's' : ''}</p>
//         </div>
//         <button onClick={load} className="btn-secondary text-sm">↻ Refresh</button>
//       </div>

//       {loading
//         ? <div className="flex justify-center py-16">
//             <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
//           </div>
//         : alerts.length === 0
//           ? <div className="card text-center py-16">
//               <p className="text-4xl mb-3">✅</p>
//               <p className="text-slate-600 font-medium">No active alerts</p>
//               <p className="text-sm text-slate-400 mt-1">All transactions look clean</p>
//             </div>
//           : <div className="space-y-4">
//               {alerts.map(alert => (
//                 <div key={alert.id}
//                   className="card border-l-4 border-red-400 flex items-start justify-between gap-4">
//                   <div className="flex gap-4 items-start">
//                     <div className="text-2xl">🚨</div>
//                     <div>
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <span className="font-mono text-xs font-bold text-slate-700">
//                           {alert.transaction.transaction_id}
//                         </span>
//                         <span className="badge-fraud">Fraud</span>
//                         <span className={`badge-${alert.transaction.risk_level}`}>
//                           {alert.transaction.risk_level} risk
//                         </span>
//                       </div>
//                       <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
//                       <div className="flex gap-4 mt-2 text-xs text-slate-400">
//                         <span>Amount: <strong className="text-red-600">${Number(alert.transaction.amount).toFixed(2)}</strong></span>
//                         <span>Probability: <strong className="text-red-600">{(alert.transaction.fraud_prob * 100).toFixed(1)}%</strong></span>
//                         <span>{new Date(alert.created_at).toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleResolve(alert.id)}
//                     className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap shrink-0">
//                     ✓ Resolve
//                   </button>
//                 </div>
//               ))}
//             </div>
//       }
//     </div>
//   )
// }
