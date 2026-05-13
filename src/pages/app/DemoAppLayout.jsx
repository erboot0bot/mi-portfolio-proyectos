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

const HOGAR_GROUPS = [
  { key: 'cocina',   label: 'Cocina',   icon: '🍳' },
  { key: 'limpieza', label: 'Limpieza', icon: '🧹' },
  { key: 'espacios', label: 'Espacios', icon: '📦' },
  { key: 'casa',     label: 'Casa',     icon: '🔧' },
]

const HOGAR_MODULES = [
  // ── Cocina ──────────────────────────────────
  { path: 'menu',      label: 'Menú',     icon: '🍽️', group: 'cocina' },
  { path: 'recipes',   label: 'Recetas',  icon: '👨‍🍳', group: 'cocina' },
  { path: 'despensa',  label: 'Despensa', icon: '🥫',  group: 'cocina' },
  { path: 'shopping',  label: 'Lista',    icon: '🛒',  group: 'cocina' },
  // ── Limpieza ─────────────────────────────────
  { path: 'limpieza',  label: 'Tareas',   icon: '🧹',  group: 'limpieza' },
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

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'despensa', 'limpieza']

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
        <div className="demo-full-wrap">
          <div className="demo-full-content">
            <Outlet context={{ app, modules }} />
          </div>
          <footer className="hidden md:block border-t" style={{ borderColor: 'var(--border)', padding: '28px 64px', flexShrink: 0 }}>
            <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
                © {new Date().getFullYear()} <span style={{ color: 'var(--accent)' }}>H3nky</span> · Construido con IA · Open source
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
                <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
                  className="hover:text-[var(--accent)] transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </AppProvider>
    )
  }

  return (
    <AppProvider app={app}>
      <DemoBanner />

      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[70vh] px-4 py-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0 8px' }}>
          <span style={{ fontSize: 36 }}>{app.icon}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{app.name}</h1>
        </div>
        {modules.length > 1 && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {appType === 'hogar' ? (
              HOGAR_GROUPS.map(group => {
                const items = modules.filter(m => m.group === group.key)
                return (
                  <div key={group.key}>
                    {/* Group label */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 4px 3px',
                      fontSize: 10,
                      fontFamily: 'var(--font-tech)',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                    }}>
                      <span style={{ fontSize: 12 }}>{group.icon}</span>
                      {group.label}
                    </div>
                    {/* Items */}
                    {items.length > 0 ? items.map(m => (
                      <NavLink
                        key={m.path}
                        to={m.path}
                        className={({ isActive }) => isActive ? 'module-card active' : 'module-card'}
                        style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: 12,
                          height: 52, padding: '0 16px', borderRadius: 10,
                          background: 'var(--bg-card)',
                          border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderLeft: isActive ? '3px solid var(--accent)' : '1px solid var(--border)',
                          textDecoration: 'none', transition: 'all var(--transition)',
                          marginBottom: 3,
                        })}
                      >
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
                        <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>›</span>
                      </NavLink>
                    )) : (
                      <div style={{
                        height: 40, display: 'flex', alignItems: 'center',
                        padding: '0 16px', marginBottom: 3,
                        border: '1px dashed var(--border)', borderRadius: 10,
                        fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic',
                      }}>
                        Próximamente
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              modules.map(m => (
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
              ))
            )}
          </nav>
        )}
        <Outlet context={{ app, modules }} />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-col min-h-[calc(100vh-48px)]">
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 flex-1">
        <div className="flex gap-8 py-8 min-h-[70vh]">
          <aside className="w-52 shrink-0 flex flex-col">
            <div className="mb-6">
              <div className="text-3xl mb-1">{app.icon}</div>
              <h1 className="font-bold text-[var(--text)]">{app.name}</h1>
            </div>
            <nav className="flex flex-col gap-0">
              {appType === 'hogar' ? (
                HOGAR_GROUPS.map(group => {
                  const items = modules.filter(m => m.group === group.key)
                  return (
                    <div key={group.key} style={{ marginBottom: 4 }}>
                      {/* Group header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 12px 3px',
                        fontSize: 10,
                        fontFamily: 'var(--font-tech)',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--text-faint)',
                      }}>
                        <span style={{ fontSize: 12 }}>{group.icon}</span>
                        {group.label}
                      </div>
                      {/* Items */}
                      {items.length > 0 ? items.map(m => (
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
                      )) : (
                        <div style={{
                          padding: '4px 12px 6px 32px',
                          fontSize: 11,
                          color: 'var(--text-faint)',
                          fontStyle: 'italic',
                          fontFamily: 'var(--font-body)',
                        }}>
                          Próximamente
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                modules.map(m => (
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
                ))
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-faint)] leading-relaxed mb-3">
                Modo demo — los datos no se guardan al cerrar la sesión.
              </p>
              <a
                href="/login"
                className="block text-center text-xs font-semibold py-2 px-3 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                Crear cuenta gratis
              </a>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <Outlet context={{ app, modules }} />
          </main>
        </div>
      </div>
      <footer className="hidden md:block border-t" style={{ borderColor: 'var(--border)', padding: '28px 64px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} <span style={{ color: 'var(--accent)' }}>H3nky</span> · Construido con IA · Open source
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
            <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
              className="hover:text-[var(--accent)] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
      </div>
    </AppProvider>
  )
}
