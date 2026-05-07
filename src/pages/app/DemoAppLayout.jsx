import { useEffect } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { AppProvider } from '../../contexts/AppContext'
import { useMode } from '../../contexts/ModeContext'
import { initDemoData } from '../../data/demo/index.js'
import DemoBanner from '../../components/DemoBanner'

const APP_META = {
  hogar:    { name: 'Hogar',    icon: '🏠' },
  mascotas: { name: 'Mascotas', icon: '🐾' },
  vehiculo: { name: 'Vehículo', icon: '🚗' },
  finanzas: { name: 'Finanzas', icon: '💰' },
  personal: { name: 'Personal', icon: '🗂️' },
}

const HOGAR_MODULES = [
  { path: 'calendar',   label: 'Calendario', icon: '📅' },
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
]
const MASCOTAS_MODULES = [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }]
const VEHICULO_MODULES = [{ path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' }]
const FINANZAS_MODULES = [
  { path: 'resumen',       label: 'Resumen',       icon: '📊' },
  { path: 'transacciones', label: 'Transacciones', icon: '💳' },
  { path: 'categorias',    label: 'Categorías',    icon: '🏷️' },
  { path: 'presupuestos',  label: 'Presupuestos',  icon: '🎯' },
]
const PERSONAL_MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'notas',    label: 'Notas',      icon: '📝' },
  { path: 'tareas',   label: 'Tareas',     icon: '✅' },
  { path: 'ideas',    label: 'Ideas',      icon: '💡' },
]

const MODULE_MAP = {
  hogar:    HOGAR_MODULES,
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
  finanzas: FINANZAS_MODULES,
  personal: PERSONAL_MODULES,
}

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'inventario', 'limpieza']

export default function DemoAppLayout() {
  const { appType } = useParams()
  const location    = useLocation()
  const { setMode } = useMode()

  useEffect(() => {
    setMode('demo')
    initDemoData(appType)
    return () => setMode('app')
  }, [appType, setMode])

  if (!APP_META[appType]) return <Navigate to="/demo" replace />

  const meta    = APP_META[appType]
  const app     = { id: `demo-${appType}`, name: meta.name, icon: meta.icon, type: appType, slug: `demo-${appType}` }
  const modules = MODULE_MAP[appType] ?? []

  const currentModule = location.pathname.split('/').pop()
  const isFullLayout  = FULL_LAYOUT_MODULES.includes(currentModule)

  if (isFullLayout) {
    return (
      <AppProvider app={app}>
        <DemoBanner />
        <Outlet context={{ app, modules }} />
      </AppProvider>
    )
  }

  return (
    <AppProvider app={app}>
      <DemoBanner />

      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[70vh] px-4 py-0">
        <NavLink to="/demo" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
          padding: '12px 0 0', lineHeight: 1,
        }}>
          ← Demo
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0 8px' }}>
          <span style={{ fontSize: 36 }}>{app.icon}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{app.name}</h1>
        </div>
        {modules.length > 1 && (
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
        )}
        <Outlet context={{ app, modules }} />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex gap-8 py-8 min-h-[70vh]">
          <aside className="w-52 shrink-0">
            <NavLink
              to="/demo"
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-4 transition-colors"
            >
              ← Demo
            </NavLink>
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
