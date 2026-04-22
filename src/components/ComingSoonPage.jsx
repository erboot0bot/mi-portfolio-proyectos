import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ComingSoonPage({ title, icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]
      text-center px-6 gap-5">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-6xl">
        {icon}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">{title}</h1>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
          En desarrollo
        </span>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-sm text-[var(--text-muted)] max-w-sm">
        Esta sección está en construcción. Las cosas buenas tardan un poco.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Link to="/" className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]
          underline underline-offset-4 transition-colors">
          ← Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
