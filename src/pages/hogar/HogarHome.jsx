import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const modules = [
  { path: '/hogar/calendario', label: 'Calendario', icon: '📅', desc: 'Organiza tus eventos y citas' },
  { path: '/hogar/lista', label: 'Lista & Menú Semanal', icon: '🛒', desc: 'Lista de la compra y planifica la semana' },
  { path: '/hogar/recetas', label: 'Recetas con IA', icon: '🍳', desc: 'Genera y guarda recetas personalizadas' },
]

export default function HogarHome() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-2">Hogar</h1>
      <p className="text-[var(--text-muted)] mb-8 text-sm">Tu espacio personal para el día a día.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => (
          <motion.div
            key={m.path}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={m.path}
              className="block p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                hover:border-[var(--accent)] hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <h2 className="font-semibold text-[var(--text)] mb-1">{m.label}</h2>
              <p className="text-sm text-[var(--text-muted)]">{m.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
