import { Link } from 'react-router-dom'
import { apps } from '../data/apps'

export default function DemoHub() {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Demo</h1>
        <p className="text-[var(--text-muted)]">
          Prueba las apps sin necesidad de crear una cuenta. Los datos no se guardan al cerrar la sesión.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.filter(a => a.status === 'active').map(app => (
          <Link
            key={app.slug}
            to={`/demo/${app.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-2xl border border-[var(--border)]
              bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all duration-200
              hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{app.icon}</span>
              <div>
                <h2 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {app.title}
                </h2>
                <span className="text-xs text-[var(--text-faint)]">v{app.version}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{app.description}</p>
            <span className="mt-auto self-start text-xs font-semibold text-[var(--accent)]
              group-hover:underline underline-offset-2">
              Probar →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-center text-[var(--text-faint)]">
        ¿Te gusta lo que ves?{' '}
        <Link to="/login" className="underline hover:text-[var(--text)] transition-colors">
          Crea tu cuenta gratis
        </Link>
        {' '}para guardar tus datos.
      </p>
    </div>
  )
}
