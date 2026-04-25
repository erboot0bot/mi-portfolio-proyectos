import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProjectProvider } from '../../contexts/ProjectContext'

const MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'shopping', label: 'Lista',       icon: '🛒' },
  { path: 'menu',     label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',  label: 'Recetas',     icon: '👨‍🍳' },
]

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes']

export default function HogarLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const currentModule = location.pathname.split('/').pop()
  const isFullLayout = FULL_LAYOUT_MODULES.includes(currentModule)

  useEffect(() => {
    if (!user) return
    supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/apps'); return }
        setProject(data)
        setLoading(false)
      })
      .catch(() => navigate('/apps'))
  }, [user, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isFullLayout) {
    return (
      <ProjectProvider project={project}>
        <Outlet context={{ project, modules: MODULES }} />
      </ProjectProvider>
    )
  }

  return (
    <ProjectProvider project={project}>
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[70vh] px-4 py-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 8px' }}>
          <span style={{ fontSize: 36 }}>{project.icon}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{project.name}</h1>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {MODULES.map(m => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) => isActive ? 'module-card active' : 'module-card'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                height: 56, padding: '0 16px', borderRadius: 12,
                background: 'var(--bg-card)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderLeft: isActive ? '3px solid var(--accent)' : '1px solid var(--border)',
                textDecoration: 'none', transition: 'all var(--transition)',
              })}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
              <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>›</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex gap-8 py-8 min-h-[70vh]">
          <aside className="w-52 shrink-0">
            <div className="mb-6">
              <div className="text-3xl mb-1">{project.icon}</div>
              <h1 className="font-bold text-[var(--text)]">{project.name}</h1>
            </div>
            <nav className="flex flex-col gap-1">
              {MODULES.map(m => (
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
            <Outlet context={{ project }} />
          </main>
        </div>
      </div>
    </ProjectProvider>
  )
}
