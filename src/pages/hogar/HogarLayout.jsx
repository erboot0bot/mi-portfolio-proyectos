import { NavLink, Outlet } from 'react-router-dom'

const modules = [
  { path: '/hogar/calendario', label: 'Calendario', icon: '📅' },
  { path: '/hogar/lista', label: 'Lista & Menú', icon: '🛒' },
  { path: '/hogar/recetas', label: 'Recetas IA', icon: '🍳' },
]

export default function HogarLayout() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
      <div className="flex gap-8 py-8 min-h-[60vh]">
        <aside className="w-48 shrink-0">
          <h2 className="text-xs font-semibold tracking-widest text-[var(--text-faint)] uppercase mb-4">
            Hogar
          </h2>
          <nav className="flex flex-col gap-1">
            {modules.map(m => (
              <NavLink
                key={m.path}
                to={m.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--accent)] text-white font-semibold'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]'
                  }`
                }
              >
                <span>{m.icon}</span>
                {m.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
