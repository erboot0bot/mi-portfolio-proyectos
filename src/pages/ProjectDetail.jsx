/*
 * ProjectDetail.jsx — single project page
 *
 * Layout: Variant A "Cinematic Hero"
 * - Full-bleed hero with gradient overlay, title overlaid bottom-left
 * - Below hero: wide 2-column layout (prose left, metadata sidebar right)
 * - Theme-aware: uses CSS custom properties only (no hardcoded zinc/white)
 *
 * Slug lookup: direct find (no decodeURIComponent — slugs are kebab-case
 * and React Router passes them as-is with no encoding).
 * Invalid slug → redirect to /404.
 */

import { useParams, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import TechBadge from '../components/TechBadge'
import ImageGallery from '../components/ImageGallery'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  wip:       'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  archived:  'text-[var(--text-faint)] bg-[var(--bg-card)] border-[var(--border)]',
}

const fadein = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) return <Navigate to="/404" replace />

  const cover = project.images?.[0]

  return (
    <article>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden -mt-10 mb-0"
        style={{ minHeight: '52vh' }}>

        {/* Background: image or gradient fallback */}
        {cover ? (
          <img src={cover} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #533483 100%)' }} />
        )}

        {/* Warm glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(249,115,22,0.18) 0%, transparent 55%)' }} />

        {/* Overlay: transparent top → dark bottom */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)' }} />

        {/* Fade to page bg at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />

        {/* Hero content */}
        <motion.div
          className="relative z-10 flex flex-col justify-end px-6 sm:px-10 lg:px-16"
          style={{ minHeight: '52vh', paddingBottom: '2.5rem' }}
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadein}>
            <Link to="/"
              className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >
              ← Todos los proyectos
            </Link>
          </motion.div>

          <motion.div variants={fadein}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit mb-4 ${statusColor[project.status]}`}>
            {project.status === 'completed' && '✓ '}
            {statusLabel[project.status]}
          </motion.div>

          <motion.h1 variants={fadein}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-3 text-white max-w-3xl">
            {project.title}
          </motion.h1>

          <motion.p variants={fadein}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            {project.description}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Body: 2-column ── */}
      <div className="px-6 sm:px-10 lg:px-16 pt-10 pb-20
        grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]
        gap-x-12 gap-y-10 max-w-[1440px] mx-auto">

        {/* ── Main content ── */}
        <motion.main
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {/* Tech badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.map(tech => (
              <TechBadge key={tech} tech={tech} />
            ))}
          </div>

          {/* Long description */}
          <p className="text-sm uppercase tracking-widest font-semibold mb-3 text-[var(--text-faint)]">
            Descripción
          </p>
          <p className="text-base leading-relaxed text-[var(--text-muted)] mb-10 max-w-2xl">
            {project.longDescription || project.description}
          </p>

          {/* Gallery */}
          {project.images && project.images.length > 0 && (
            <section>
              <p className="text-sm uppercase tracking-widest font-semibold mb-4 text-[var(--text-faint)]">
                Capturas
              </p>
              <ImageGallery images={project.images} />
            </section>
          )}
        </motion.main>

        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:border-l lg:border-[var(--border)] lg:pl-10"
        >
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-[var(--text-faint)]">Estado</p>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full border ${statusColor[project.status]}`}>
                {project.status === 'completed' && '✓ '}
                {statusLabel[project.status]}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-[var(--text-faint)]">Fecha</p>
              <p className="text-sm font-medium text-[var(--text)]">{project.date}</p>
            </div>

            <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-semibold transition-all duration-150
                    bg-[var(--accent)] text-white hover:opacity-90 hover:-translate-y-px
                    shadow-[0_4px_14px_rgba(249,115,22,0.3)]">
                  Ver en GitHub →
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-semibold transition-all duration-150
                    border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)]
                    hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  Ver demo →
                </a>
              )}
              {!project.github && !project.demo && (
                <p className="text-xs text-[var(--text-faint)]">Sin enlaces disponibles.</p>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </article>
  )
}
