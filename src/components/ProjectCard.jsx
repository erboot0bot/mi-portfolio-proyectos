import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TechBadge from './TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusStyle = {
  completed: { background: 'var(--status-done-bg)', color: 'var(--status-done-text)', border: '1px solid var(--status-done-border)' },
  wip:       { background: 'var(--status-wip-bg)',  color: 'var(--status-wip-text)',  border: '1px solid var(--status-wip-border)' },
  archived:  { background: 'var(--status-archived-bg)', color: 'var(--status-archived-text)', border: '1px solid var(--status-archived-border)' },
}

function CardCover({ project }) {
  const { gradientFrom, gradientTo, shortTitle, title, technologies } = project

  if (gradientFrom) {
    return (
      <div
        className="w-full h-44 relative overflow-hidden flex items-end"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}20, ${gradientTo}40)`,
          borderBottom: `1px solid ${gradientFrom}30`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', opacity: 0.18,
            background: `radial-gradient(circle, ${gradientFrom}, transparent)`,
          }} />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${gradientTo}cc, transparent)` }}
        />
        <span
          className="absolute top-3 right-3 z-10"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}
        >
          {technologies.slice(0, 2).join(' · ')}
        </span>
        <span
          className="relative z-10 px-5 pb-4 text-2xl font-black text-white tracking-tight leading-none"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
        >
          {shortTitle || title}
        </span>
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
  const hasLinks = project.demo || project.github

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="h3nky-card flex flex-col h-full">

        {/* Clickable area → project detail */}
        <Link to={`/projects/${project.slug}`} className="block flex-1">
          <CardCover project={project} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.3, margin: 0 }}>
                {project.title}
              </h2>
              <span style={{ ...statusStyle[project.status], flexShrink: 0, fontSize: '0.625rem', fontWeight: 600, padding: '2px 6px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)' }}>
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

        {/* Demo / GitHub links — outside the Link to avoid nested anchors */}
        {hasLinks && (
          <div className="px-5 pb-4 pt-3 flex gap-2 border-t border-[var(--border)]">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg
                  bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                Demo <span aria-hidden="true">→</span>
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg
                  border border-[var(--border)] text-[var(--text-muted)]
                  hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
              >
                GitHub <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
