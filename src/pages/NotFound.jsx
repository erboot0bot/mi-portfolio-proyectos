import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <title>404 | H3nky</title>
      <p className="text-6xl font-bold text-[var(--text-faint)] mb-4">404</p>
      <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Página no encontrada</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        La URL que buscas no existe o el proyecto fue eliminado.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-[var(--surface)] hover:opacity-80 border border-[var(--border)] text-sm font-medium text-[var(--text)] transition-colors"
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}
