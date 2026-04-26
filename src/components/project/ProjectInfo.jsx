import TechBadge from '../TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }

export default function ProjectInfo({ project }) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{project.title}</h2>
      <p className="text-base leading-relaxed text-[var(--text-muted)] mb-4">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map(tech => (
          <TechBadge key={tech} tech={tech} />
        ))}
      </div>

      <div className="flex gap-6 text-sm text-[var(--text-muted)] mb-6">
        <span>{statusLabel[project.status]}</span>
        <span>{project.date}</span>
      </div>

      {project.product && (
        <div className="flex flex-col gap-4">
          {project.product.tagline && (
            <p className="text-lg font-semibold text-[var(--accent)]">{project.product.tagline}</p>
          )}
          {project.product.description && (
            <p className="text-base leading-relaxed text-[var(--text-muted)]">{project.product.description}</p>
          )}
          {project.product.features && project.product.features.length > 0 && (
            <ul className="flex flex-col gap-2">
              {project.product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--accent)] mt-0.5">·</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
