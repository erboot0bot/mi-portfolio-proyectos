/*
 * FilterBar.jsx — filter projects by technology
 *
 * Props:
 *   techs      — string[] of unique technology names (sorted alphabetically)
 *   active     — currently selected tech or null (null = show all)
 *   onChange   — (tech | null) => void
 */

export default function FilterBar({ techs, active, onChange }) {
  if (techs.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tecnología">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          active === null
            ? 'bg-white text-zinc-900 border-white'
            : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
        }`}
      >
        Todos
      </button>

      {techs.map(tech => (
        <button
          key={tech}
          onClick={() => onChange(active === tech ? null : tech)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            active === tech
              ? 'bg-white text-zinc-900 border-white'
              : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          {tech}
        </button>
      ))}
    </div>
  )
}
