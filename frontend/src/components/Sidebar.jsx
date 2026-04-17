import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',           icon: '⬡', label: 'Dashboard'    },
  { to: '/predict',    icon: '⚡', label: 'Predict'      },
  { to: '/transactions', icon: '⇄', label: 'Transactions' },
  { to: '/alerts',     icon: '🔔', label: 'Alerts'       },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">
            F
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">FraudGuard</p>
            <p className="text-xs text-slate-400">ML Detection System</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        © 2026 Satyam Kushwaha. All rights reserved.❤️❤️
      </div>
    </aside>
  )
}
