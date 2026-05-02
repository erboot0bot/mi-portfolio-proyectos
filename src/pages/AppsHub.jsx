import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apps } from '../data/apps'

export default function AppsHub() {
  const { user, signOut } = useAuth()

  return (
    <div className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
      <header className="mb-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">My Apps</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Bienvenido, <strong>{user?.user_metadata?.full_name ?? user?.email}</strong>
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm border border-[var(--border)] px-3 py-1.5 rounded-lg
            text-[var(--text-faint)] hover:text-[var(--text)] transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
      >
        {apps.map(app => <AppCard key={app.slug} app={app} />)}
      </motion.div>
    </div>
  )
}

function AppCard({ app }) {
  const isActive = app.status === 'active'
  const inner = (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className={`
        h-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        overflow-hidden flex flex-col transition-all duration-200
        ${isActive ? 'hover:border-[var(--accent)] hover:shadow-md' : 'opacity-60'}
      `}
    >
      <div className={`h-1.5 bg-gradient-to-r ${app.color}`} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl">{app.icon}</span>
          {app.status === 'coming_soon' ? (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
              Próximamente
            </span>
          ) : (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full
              text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10
              border border-emerald-200 dark:border-emerald-500/30">
              Activo
            </span>
          )}
        </div>
        <div>
          <h2 className="font-bold text-[var(--text)]">{app.title}</h2>
          {app.version && (
            <span className="text-xs font-mono text-[var(--text-faint)]">v{app.version}</span>
          )}
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{app.description}</p>
        {app.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {app.features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full
                bg-[var(--border)] text-[var(--text-faint)]">{f}</span>
            ))}
          </div>
        )}
        {isActive && (
          <span className="text-sm font-semibold mt-1" style={{ color: 'var(--accent)' }}>
            Abrir →
          </span>
        )}
      </div>
    </motion.div>
  )
  return isActive ? <Link to={app.href} className="h-full block">{inner}</Link> : <div className="h-full">{inner}</div>
}
