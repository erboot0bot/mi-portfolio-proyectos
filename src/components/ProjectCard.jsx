import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TechBadge from './TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  wip:       'bg-orange-50 text-orange-700 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  archived:  'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-500 dark:border-zinc-600/30',
}

function CardCover({ project }) {
  const { gradientFrom, gradientVia, gradientTo, shortTitle, title, technologies } = project

  if (gradientFrom) {
    return (
      <div
        className="w-full h-44 relative overflow-hidden flex items-end"
        style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientVia} 50%, ${gradientTo} 100%)` }}
      >
        <div
          className="absolute top-3 right-3 z-10 font-mono text-[10px] tracking-wide"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {technologies.slice(0, 2).join(' · ')}
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
        />
        <div
          className="relative z-10 px-5 pb-4 text-xl font-extrabold tracking-tight leading-tight text-white"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        >
          {shortTitle || title}
        </div>
      </div>
    )
  }

  const cover = project.images?.[0]
  if (cover) {
    return (
      <img
        src={cover}
        alt={`Captura de ${title}`}
        className="w-full h-44 object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <div className="w-full h-44 flex items-center justify-center text-xs
      bg-zinc-50 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600">
      Sin captura
    </div>
  )
}

export default function ProjectCard({ project }) {
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
        <CardCover project={project} />

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
