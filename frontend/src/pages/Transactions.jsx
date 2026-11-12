import { useEffect, useState, useCallback } from 'react'
import { getTransactions } from '../api/fraud'

export default function Transactions() {
  const [txs, setTxs] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [risk, setRisk] = useState('')
  const [fraud, setFraud] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const PAGE_SIZE = 10

  // ✅ Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // ✅ Load data
  const load = useCallback(() => {
    setLoading(true)

    const params = {
      page,
      page_size: PAGE_SIZE
    }

    if (risk) params.risk = risk
    if (fraud) params.is_fraud = fraud
    if (debouncedSearch) params.search = debouncedSearch

    getTransactions(params)
      .then(res => {
        setTxs(res?.data?.results || [])
        setCount(res?.data?.count || 0)
      })
      .catch(() => {
        setTxs([])
        setCount(0)
      })
      .finally(() => setLoading(false))

  }, [page, risk, fraud, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  // ✅ Calculate total pages
  const totalPages = Math.ceil(count / PAGE_SIZE)

  // ✅ Fix invalid page safely
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [count, page])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <p className="text-sm text-gray-500">{count} total records</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">

        <input
          className="border p-2 rounded w-48"
          placeholder="Search..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />

        <select
          className="border p-2 rounded"
          value={risk}
          onChange={e => {
            setRisk(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          className="border p-2 rounded"
          value={fraud}
          onChange={e => {
            setFraud(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All</option>
          <option value="true">Fraud</option>
          <option value="false">Legit</option>
        </select>

        <button
          onClick={() => {
            setSearch('')
            setRisk('')
            setFraud('')
            setPage(1)
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Risk</th>
                <th className="p-3 text-center">Fraud</th>
              </tr>
            </thead>

            <tbody>
              {txs.map(tx => (
                <tr key={tx.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{tx.transaction_id}</td>
                  <td className="p-3 text-right">₹{tx.amount}</td>

                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-white text-xs 
                      ${tx.risk_level === 'high' ? 'bg-red-500' :
                        tx.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {tx.risk_level}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {tx.is_fraud ? (
                      <span className="text-red-600 font-semibold">Fraud</span>
                    ) : (
                      <span className="text-green-600">Legit</span>
                    )}
                  </td>
                </tr>
              ))}

              {txs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm text-gray-500">
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  )
}












// import { useEffect, useState, useCallback } from 'react'
// import { getTransactions } from '../api/fraud'
// import { useState, useEffect } from "react";

// export default function Transactions() {
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [transactions, setTransactions] = useState([]);

//   // ✅ Step 1: Debounce input
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [search]);

//   // ✅ Step 2: API call only after debounce
//   useEffect(() => {
//     fetchTransactions();
//   }, [debouncedSearch]);

//   const fetchTransactions = async () => {
//     const res = await fetch(
//       `/api/fraud/transactions/?search=${debouncedSearch}`
//     );
//     const data = await res.json();
//     setTransactions(data);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search transactions..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* Render data */}
//       {transactions.map((t) => (
//         <div key={t.id}>{t.amount}</div>
//       ))}
//     </div>
//   );
// }
// export default function Transactions() {
//   const [txs,     setTxs]     = useState([])
//   const [count,   setCount]   = useState(0)
//   const [page,    setPage]    = useState(1)
//   const [risk,    setRisk]    = useState('')
//   const [fraud,   setFraud]   = useState('')
//   const [search,  setSearch]  = useState('')
//   const [loading, setLoading] = useState(false)

//   const PAGE_SIZE = 10

//   const load = useCallback(() => {
//     setLoading(true)
//     const params = { page, page_size: PAGE_SIZE }
//     if (risk)   params.risk     = risk
//     if (fraud)  params.is_fraud = fraud
//     if (search) params.search   = search
// const [filters, setFilters] = useState({
//   search: "",
//   risk: "",
//   is_fraud: ""
// });
// const updateFilter = (key, value) => {
//   setFilters(prev => ({
//     ...prev,
//     [key]: value
//   }));
// };

// useEffect(() => {
//   fetchTransactions();
// }, [filters]);

// const fetchTransactions = async () => {
//   const query = new URLSearchParams(filters).toString();

//   const res = await fetch(`/api/fraud/transactions/?${query}`);
//   const data = await res.json();

//   setTransactions(data);
// };
//     getTransactions(params)
//       .then(r => { setTxs(r.data.results || []); setCount(r.data.count || 0) })
//       .finally(() => setLoading(false))
//   }, [page, risk, fraud, search])

//   useEffect(() => { load() }, [load])

//   const totalPages = Math.ceil(count / PAGE_SIZE)

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
//         <p className="text-sm text-slate-500 mt-1">{count.toLocaleString()} total records</p>
//       </div>

//       {/* Filters */}
//       <div className="card flex flex-wrap gap-3 items-end">
//         <div>
//           <label className="block text-xs text-slate-400 mb-1">Search ID</label>
//           <input
//             className="input-field w-44"
//             placeholder="TX-..."
//             value={search}
//             onChange={e => { setSearch(e.target.value); setPage(1) }}
//           />
//         </div>
//         <div>
//           <label className="block text-xs text-slate-400 mb-1">Risk Level</label>
//           <select className="input-field w-36" value={risk}
//             onChange={e => { setRisk(e.target.value); setPage(1) }}>
//             <option value="">All</option>
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-xs text-slate-400 mb-1">Fraud Status</label>
//           <select className="input-field w-36" value={fraud}
//             onChange={e => { setFraud(e.target.value); setPage(1) }}>
//             <option value="">All</option>
//             <option value="true">Fraud Only</option>
//             <option value="false">Legit Only</option>
//           </select>
//         </div>
//         <button onClick={() => { setRisk(''); setFraud(''); setSearch(''); setPage(1) }}
//           className="btn-secondary text-sm">
//           Clear
//         </button>
//       </div>

//       {/* Table */}
//       <div className="card overflow-hidden p-0">
//         {loading
//           ? <div className="flex justify-center py-16">
//               <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
//             </div>
//           : <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50 border-b border-slate-100">
//                   <tr className="text-xs uppercase text-slate-400">
//                     <th className="px-5 py-4 text-left">Transaction ID</th>
//                     <th className="px-5 py-4 text-right">Amount</th>
//                     <th className="px-5 py-4 text-center">Risk</th>
//                     <th className="px-5 py-4 text-center">Fraud Prob.</th>
//                     <th className="px-5 py-4 text-center">Result</th>
//                     <th className="px-5 py-4 text-right">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {txs.map(tx => (
//                     <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
//                       <td className="px-5 py-3 font-mono text-xs text-slate-600">{tx.transaction_id}</td>
//                       <td className="px-5 py-3 text-right font-semibold text-slate-800">
//                         ${Number(tx.amount).toFixed(2)}
//                       </td>
//                       <td className="px-5 py-3 text-center">
//                         <span className={`badge-${tx.risk_level}`}>{tx.risk_level}</span>
//                       </td>
//                       <td className="px-5 py-3 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                             <div
//                               className={`h-full rounded-full ${tx.is_fraud ? 'bg-red-500' : 'bg-emerald-500'}`}
//                               style={{ width: `${(tx.fraud_prob * 100).toFixed(0)}%` }}
//                             />
//                           </div>
//                           <span className="text-xs text-slate-500">{(tx.fraud_prob * 100).toFixed(1)}%</span>
//                         </div>
//                       </td>
//                       <td className="px-5 py-3 text-center">
//                         {tx.is_fraud
//                           ? <span className="badge-fraud">Fraud</span>
//                           : <span className="badge-ok">Legit</span>}
//                       </td>
//                       <td className="px-5 py-3 text-right text-xs text-slate-400">
//                         {new Date(tx.created_at).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {txs.length === 0 && (
//                     <tr>
//                       <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
//                         No transactions found. Use the Predict page to create some.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//         }

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
//             <p className="text-xs text-slate-400">
//               Page {page} of {totalPages} ({count} records)
//             </p>
//             <div className="flex gap-2">
//               <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
//                 className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">← Prev</button>
//               <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
//                 className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next →</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
