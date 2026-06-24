import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: '📊 Dashboard', end: true },
  { to: '/stock/PTT', label: '🔍 วิเคราะห์หุ้น' },
  { to: '/watchlist', label: '⭐ Watchlist' },
  { to: '/portfolio', label: '💼 Portfolio' },
  { to: '/alerts', label: '🔔 Price Alerts' },
  { to: '/news', label: '📰 ข่าว & Sentiment' },
  { to: '/fundflow', label: '💰 Fund Flow' },
  { to: '/screener', label: '🔎 Smart Screener' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-700 min-h-screen p-4 flex flex-col gap-1">
      <div className="text-white font-bold text-lg mb-4 px-2">
        📈 SET Analysis
      </div>
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
