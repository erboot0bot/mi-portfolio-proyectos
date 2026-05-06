import { Link } from 'react-router-dom'

export default function DemoBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
        <span>🔍</span> Modo demo
      </span>
      <span className="text-amber-600 dark:text-amber-400 hidden sm:inline">
        Los datos no se guardan al cerrar la sesión.
      </span>
      <Link
        to="/login"
        className="ml-auto text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:no-underline text-xs font-medium whitespace-nowrap"
      >
        Crear cuenta →
      </Link>
    </div>
  )
}
