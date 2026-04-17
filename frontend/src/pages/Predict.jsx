import { useState } from 'react'
import { predictFraud } from '../api/fraud'

const defaultForm = {
  amount: '',
  time:   '',
  v1: '', v2: '', v3: '', v4: '', v5: '', v6: '', v7: '',
  v8: '', v9: '', v10: '', v11: '', v12: '', v13: '', v14: '',
}

const SAMPLE_LEGIT = {
  amount: 149.62, time: 0,
  v1: -1.3598, v2: -0.0728, v3: 2.5363, v4: 1.3782, v5: -0.3383,
  v6: 0.4624,  v7: 0.2396,  v8: 0.0987, v9: 0.3638, v10: 0.0908,
  v11: -0.5516, v12: -0.6178, v13: -0.9913, v14: -0.3111,
}

const SAMPLE_FRAUD = {
  amount: 2125.87, time: 406,
  v1: -2.3122, v2: 1.9519,  v3: -1.6099, v4: 3.9979, v5: -0.5222,
  v6: -1.4265, v7: -2.5374, v8: 1.3918,  v9: -2.7706, v10: -2.7717,
  v11: 3.2020, v12: -2.8997, v13: -0.5955, v14: -4.2895,
}

export default function Predict() {
  const [form, setForm]     = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const fillSample = (sample) => {
    const filled = { ...defaultForm }
    Object.keys(sample).forEach(k => { filled[k] = sample[k] })
    setForm(filled)
    setResult(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload = {}
      Object.entries(form).forEach(([k, v]) => {
        payload[k] = v === '' ? 0 : parseFloat(v)
      })
      const res = await predictFraud(payload)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Is Django running?')
    } finally {
      setLoading(false)
    }
  }

  const fields14 = Array.from({ length: 14 }, (_, i) => `v${i + 1}`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Predict Transaction</h1>
        <p className="text-sm text-slate-500 mt-1">Enter transaction features to run fraud analysis</p>
      </div>

      {/* Quick fill buttons */}
      <div className="flex gap-3">
        <button onClick={() => fillSample(SAMPLE_LEGIT)} className="btn-secondary text-sm">
          ✓ Load Legitimate Sample
        </button>
        <button onClick={() => fillSample(SAMPLE_FRAUD)} className="btn-secondary text-sm text-red-600">
          ⚠ Load Fraud Sample
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core fields */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-700">Core Transaction Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($) *</label>
              <input
                name="amount" type="number" step="0.01" required
                value={form.amount} onChange={handleChange}
                placeholder="e.g. 149.62"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Time (seconds)</label>
              <input
                name="time" type="number"
                value={form.time} onChange={handleChange}
                placeholder="Elapsed seconds"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* V1–V14 PCA features */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">PCA Features (V1–V14)</h2>
            <span className="text-xs text-slate-400">Anonymised principal components</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {fields14.map(f => (
              <div key={f}>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{f}</label>
                <input
                  name={f} type="number" step="0.0001"
                  value={form[f]} onChange={handleChange}
                  placeholder="0.0"
                  className="input-field text-xs"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">V15–V28 default to 0.0 if not provided (you can add them to the form if needed)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                Analysing…
              </span>
            : '⚡ Run Fraud Analysis'}
        </button>
      </form>

      {/* Result panel */}
      {result && (
        <div className={`card border-2 ${result.is_fraud ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
          <div className="flex items-start gap-4">
            <div className={`text-4xl w-14 h-14 flex items-center justify-center rounded-2xl ${result.is_fraud ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {result.is_fraud ? '🚨' : '✅'}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${result.is_fraud ? 'text-red-700' : 'text-emerald-700'}`}>
                {result.is_fraud ? 'FRAUD DETECTED' : 'Transaction Legitimate'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{result.message}</p>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="font-mono text-xs font-bold text-slate-700 mt-1">{result.transaction_id}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-400">Fraud Probability</p>
                  <p className={`text-2xl font-bold mt-1 ${result.is_fraud ? 'text-red-600' : 'text-emerald-600'}`}>
                    {result.fraud_probability}%
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-400">Risk Level</p>
                  <span className={`badge-${result.risk_level} mt-1 inline-block`}>{result.risk_level}</span>
                </div>
              </div>

              {/* Probability bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>0%</span>
                  <span>Fraud Probability</span>
                  <span>100%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.is_fraud ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.fraud_probability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
