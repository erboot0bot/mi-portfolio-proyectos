/*
 * FilterBar.jsx — filter projects by technology
 *
 * Light mode: zinc-100 pills, orange active.
 * Dark mode:  zinc-800 pills, orange active.
 */

export default function FilterBar({ techs, active, onChange }) {
  if (techs.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tecnología">
      <button
        onClick={() => onChange(null)}
        className={`h3nky-filter${active === null ? ' active' : ''}`}
      >
        Todos
      </button>

      {techs.map(tech => (
        <button
          key={tech}
          onClick={() => onChange(active === tech ? null : tech)}
          className={`h3nky-filter${active === tech ? ' active' : ''}`}
        >
          {tech}
        </button>
      ))}
    </div>
  )
}
