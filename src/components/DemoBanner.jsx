import { Link, NavLink, useLocation } from 'react-router-dom'

const APPS = [
  { slug: 'hogar',    label: 'Hogar',    icon: '🏠' },
  { slug: 'finanzas', label: 'Finanzas', icon: '💰' },
  { slug: 'mascotas', label: 'Mascotas', icon: '🐾' },
  { slug: 'vehiculo', label: 'Vehículo', icon: '🚗' },
  { slug: 'personal', label: 'Personal', icon: '🗂️' },
]

export default function DemoBanner() {
  const { pathname } = useLocation()
  const activeApp = APPS.find(a => pathname.startsWith(`/demo/${a.slug}`))

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      height: 48,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)',
      paddingInline: 16,
      flexShrink: 0,
      position: 'sticky',
      top: 60,
      zIndex: 39,
    }}>
      {/* Logo / home */}
      <Link
        to="/demo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          textDecoration: 'none',
          marginRight: 16,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.03em',
        }}>
          Demo
        </span>
      </Link>

      {/* App switcher */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: 1,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {APPS.map(app => {
          const isActive = activeApp?.slug === app.slug
          return (
            <NavLink
              key={app.slug}
              to={`/demo/${app.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 15 }}>{app.icon}</span>
              <span className="demo-nav-label">{app.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* CTA */}
      <Link
        to="/login"
        style={{
          flexShrink: 0,
          marginLeft: 12,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--accent)',
          textDecoration: 'none',
          padding: '5px 10px',
          borderRadius: 7,
          border: '1px solid var(--accent)',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--accent)'
        }}
      >
        Crear cuenta
      </Link>

      <style>{`
        @media (max-width: 500px) {
          .demo-nav-label { display: none; }
        }
      `}</style>
    </header>
  )
}
