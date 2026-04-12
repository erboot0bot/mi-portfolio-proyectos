/*
 * ProjectCard.jsx — project card for the Home grid
 * Hover lift via Framer Motion.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TechBadge from './TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  wip: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  archived: 'bg-zinc-700/40 text-zinc-500 border-zinc-600/30',
}

export default function ProjectCard({ project }) {
  const cover = project.images?.[0]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link
        to={`/projects/${project.slug}`}
        className="block h-full rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors overflow-hidden"
      >
        {cover ? (
          <img
            src={cover}
            alt={`Captura de ${project.title}`}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
            Sin captura
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-semibold text-white leading-snug">{project.title}</h2>
            <span
              className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor[project.status]}`}
            >
              {statusLabel[project.status]}
            </span>
          </div>

          <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{project.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 3).map(tech => (
              <TechBadge key={tech} tech={tech} />
            ))}
            {project.technologies.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-zinc-700 text-zinc-500">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
