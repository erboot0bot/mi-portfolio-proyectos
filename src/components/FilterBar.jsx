/*
 * FilterBar.jsx — filter projects by technology
 *
 * Light mode: zinc-100 pills, orange active.
 * Dark mode:  zinc-800 pills, orange active.
 */

export default function FilterBar({ techs, active, onChange }) {
  if (techs.length === 0) return null

  const base = 'px-3 py-1 rounded-full text-xs font-medium border transition-colors'
  const inactive = 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-orange-300 hover:text-[var(--accent)] dark:hover:border-orange-500/40'
  const activeClass = 'bg-[var(--accent)] text-white border-[var(--accent)]'

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tecnología">
      <button
        onClick={() => onChange(null)}
        className={`${base} ${active === null ? activeClass : inactive}`}
      >
        Todos
      </button>

      {techs.map(tech => (
        <button
          key={tech}
          onClick={() => onChange(active === tech ? null : tech)}
          className={`${base} ${active === tech ? activeClass : inactive}`}
        >
          {tech}
        </button>
      ))}
    </div>
  )
}
