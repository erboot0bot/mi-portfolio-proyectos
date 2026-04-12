/*
 * ProjectDetail.jsx — single project page
 *
 * Slug lookup: direct find (no decodeURIComponent — slugs are kebab-case
 * and React Router passes them as-is with no encoding).
 * Invalid slug → redirect to /404.
 */

import { useParams, Navigate, Link } from 'react-router-dom'
import { projects } from '../data/projects'
import TechBadge from '../components/TechBadge'
import ImageGallery from '../components/ImageGallery'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'text-emerald-400',
  wip: 'text-amber-400',
  archived: 'text-zinc-500',
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) return <Navigate to="/404" replace />

  return (
    <article className="max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
      >
        ← Todos los proyectos
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">{project.title}</h1>
          <span className={`text-sm font-medium ${statusColor[project.status]}`}>
            {statusLabel[project.status]}
          </span>
        </div>

        <p className="text-zinc-400 text-base leading-relaxed mb-4">
          {project.longDescription || project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map(tech => (
            <TechBadge key={tech} tech={tech} />
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium text-white transition-colors"
            >
              Ver en GitHub →
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium transition-colors"
            >
              Ver demo →
            </a>
          )}
        </div>
      </header>

      {project.images && project.images.length > 0 && (
        <section aria-label="Capturas de pantalla">
          <h2 className="text-lg font-semibold text-white mb-4">Capturas</h2>
          <ImageGallery images={project.images} />
        </section>
      )}

      <footer className="mt-10 pt-8 border-t border-zinc-800 text-xs text-zinc-600">
        {project.date}
      </footer>
    </article>
  )
}
