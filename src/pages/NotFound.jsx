import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <p className="text-6xl font-bold text-zinc-700 mb-4">404</p>
      <h1 className="text-xl font-semibold text-white mb-2">Página no encontrada</h1>
      <p className="text-zinc-400 text-sm mb-8">
        La URL que buscas no existe o el proyecto fue eliminado.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium text-white transition-colors"
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}
