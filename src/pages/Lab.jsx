// src/pages/Lab.jsx
import { experiments } from '../data/experiments'

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  },
  wip: {
    label: 'En progreso',
    color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  },
  paused: {
    label: 'Pausado',
    color: 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-700/40 dark:border-zinc-600/30',
  },
}

export default function Lab() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16">
      <title>Lab | H3nky</title>

      <div className="max-w-2xl mb-12">
        <p className="font-mono text-xs tracking-widest uppercase mb-3 text-[var(--text-faint)]">
          Experimentos
        </p>
        <h1 className="text-4xl font-extrabold text-[var(--text)] mb-4">Lab</h1>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Prototipo, experimenta, descarta. Lo que sobrevive se convierte en una app o en documentación.
          Esto es el proceso sin filtrar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {experiments.map(exp => {
          const { label, color } = statusConfig[exp.status] ?? statusConfig.paused
          return (
            <article
              key={exp.slug}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                p-6 flex flex-col gap-4
                hover:border-[var(--accent)] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl" aria-hidden="true">{exp.icon}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${color}`}>
                  {label}
                </span>
              </div>

              <div>
                <h2 className="font-bold text-[var(--text)] mb-1">{exp.title}</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{exp.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {exp.tags.map(tag => (
                  <span key={tag}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                      border border-[var(--border)] text-[var(--text-faint)]">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[var(--text-faint)]">{exp.date}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
