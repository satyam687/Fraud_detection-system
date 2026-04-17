export default function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:    'bg-blue-50   text-blue-600   border-blue-100',
    red:     'bg-red-50    text-red-600    border-red-100',
    green:   'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50  text-amber-600  border-amber-100',
  }
  return (
    <div className={`card flex items-start gap-4 border ${colors[color]}`}>
      {icon && (
        <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
