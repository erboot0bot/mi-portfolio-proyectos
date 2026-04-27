import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AppProvider } from '../../contexts/AppContext'

const APP_NAMES = {
  hogar:    'Hogar',
  mascotas: 'Mascotas',
  vehiculo: 'Vehículo',
  finanzas: 'Finanzas',
}

const HOGAR_MODULES = [
  { path: 'calendar',   label: 'Calendario', icon: '📅' },
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
]

const MASCOTAS_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '🐾' },
]

const VEHICULO_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '🚗' },
]

const FINANZAS_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '💰' },
]

const MODULE_MAP = {
  hogar:    HOGAR_MODULES,
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
  finanzas: FINANZAS_MODULES,
}

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'inventario', 'limpieza']

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)

  const appType = location.pathname.split('/').filter(Boolean)[1]

  const currentModule = location.pathname.split('/').pop()
  const isFullLayout = FULL_LAYOUT_MODULES.includes(currentModule)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadOrCreateApp() {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('owner_id', user.id)
        .eq('type', appType)
        .maybeSingle()

      if (cancelled) return

      if (error) { navigate('/apps'); return }

      if (data) {
        setApp(data)
        setLoading(false)
        return
      }

      // Auto-create if no app found for this type
      if (!APP_NAMES[appType]) { navigate('/apps'); return }

      const { data: created, error: createError } = await supabase
        .from('apps')
        .insert({ type: appType, name: APP_NAMES[appType], owner_id: user.id })
        .select()
        .single()

      if (cancelled) return

      if (createError || !created) { navigate('/apps'); return }

      setApp(created)
      setLoading(false)
    }

    loadOrCreateApp()
    return () => { cancelled = true }
  }, [user, navigate, appType])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const modules = MODULE_MAP[app?.type] ?? []

  if (isFullLayout) {
    return (
      <AppProvider app={app}>
        <Outlet context={{ app, modules }} />
      </AppProvider>
    )
  }

  return (
    <AppProvider app={app}>
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[70vh] px-4 py-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 8px' }}>
          <span style={{ fontSize: 36 }}>{app.icon}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{app.name}</h1>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {modules.map(m => (
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
              <div className="text-3xl mb-1">{app.icon}</div>
              <h1 className="font-bold text-[var(--text)]">{app.name}</h1>
            </div>
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
            <Outlet context={{ app, modules }} />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
