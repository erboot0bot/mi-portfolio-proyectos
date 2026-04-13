/*
 * ProjectCard.jsx — project card for the Home grid
 *
 * Light mode: white card, subtle border, orange hover tint.
 * Dark mode:  zinc-900 card, faint border, orange glow on hover.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TechBadge from './TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  wip:       'bg-orange-50 text-orange-700 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  archived:  'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-500 dark:border-zinc-600/30',
}

export default function ProjectCard({ project }) {
  const cover = project.images?.[0]

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Link
        to={`/projects/${project.slug}`}
        className="block h-full rounded-xl overflow-hidden transition-all duration-200
          border border-[var(--border)] bg-[var(--bg-card)]
          hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.08)]
          dark:hover:border-orange-500/30
          dark:hover:shadow-[0_0_32px_rgba(249,115,22,0.10),0_8px_28px_rgba(0,0,0,0.4)]"
      >
        {cover ? (
          <img
            src={cover}
            alt={`Captura de ${project.title}`}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 flex items-center justify-center text-xs
            bg-zinc-50 text-zinc-400
            dark:bg-zinc-800/50 dark:text-zinc-600">
            Sin captura
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-semibold leading-snug text-[var(--text)]">{project.title}</h2>
            <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColor[project.status]}`}>
              {statusLabel[project.status]}
            </span>
          </div>

          <p className="text-sm mb-4 line-clamp-2 leading-relaxed text-[var(--text-muted)]">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 3).map(tech => (
              <TechBadge key={tech} tech={tech} />
            ))}
            {project.technologies.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border
                border-[var(--border)] text-[var(--text-faint)]">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
