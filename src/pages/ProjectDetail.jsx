import { useState, useRef } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import ProjectTabs from '../components/project/ProjectTabs'
import ProjectInfo from '../components/project/ProjectInfo'
import ProjectTechDocs from '../components/project/ProjectTechDocs'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  wip:       'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  archived:  'text-[var(--text-faint)] bg-[var(--bg-card)] border-[var(--border)]',
}

const TABS = [
  { label: 'Información', value: 'info' },
  { label: 'Documentación técnica', value: 'tech' },
]

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)
  const heroRef = useRef(null)
  const coverRef = useRef(null)

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('view') === 'tech' ? 'tech' : 'info'
  })

  useGSAP(() => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('[data-pd-back]',  { opacity: 1, x: 0, duration: 0.4 })
      .to('[data-pd-badge]', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('[data-pd-title]', { opacity: 1, y: 0, duration: 0.55 }, '-=0.25')
      .to('[data-pd-desc]',  { opacity: 1, y: 0, duration: 0.45 }, '-=0.3')

    if (coverRef.current) {
      gsap.to(coverRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }
  }, { scope: heroRef })

  if (!project) return <Navigate to="/404" replace />

  const cover = project.images?.[0]

  function handleTabChange(tab) {
    setActiveTab(tab)
    const params = new URLSearchParams(window.location.search)
    params.set('view', tab)
    history.replaceState({}, '', `${window.location.pathname}?${params}`)
  }

  return (
    <article>
      <title>{project.title} | H3nky</title>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative overflow-hidden -mt-10 mb-0"
        style={{ minHeight: '52vh' }}>

        {/* Background: image or gradient fallback */}
        {cover ? (
          <img ref={coverRef} src={cover} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div ref={coverRef} className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #533483 100%)' }} />
        )}

        {/* Warm glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(249,115,22,0.18) 0%, transparent 55%)' }} />

        {/* Overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)' }} />

        {/* Fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />

        {/* Hero content */}
        <div
          className="relative z-10 flex flex-col justify-end px-6 sm:px-10 lg:px-16"
          style={{ minHeight: '52vh', paddingBottom: '2.5rem' }}
        >
          <div data-pd-back style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateX(-12px)' }}>
            <Link to="/"
              className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >
              ← Todos los proyectos
            </Link>
          </div>

          <div data-pd-badge
            style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(12px)' }}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit mb-4 ${statusColor[project.status]}`}>
            {project.status === 'completed' && '✓ '}
            {statusLabel[project.status]}
          </div>

          <h1 data-pd-title
            style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(24px)' }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-3 text-white max-w-3xl">
            {project.title}
          </h1>

          <p data-pd-desc
            style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(16px)' }}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            {project.description}
          </p>
        </div>
      </section>

      {/* ── Body: 2-column ── */}
      <div className="px-6 sm:px-10 lg:px-16 pt-10 pb-20
        grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]
        gap-x-12 gap-y-10 max-w-[1440px] mx-auto">

        {/* ── Main content ── */}
        <motion.main
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <ProjectTabs tabs={TABS} active={activeTab} onChange={handleTabChange} />

          {activeTab === 'info'
            ? <ProjectInfo project={project} />
            : <ProjectTechDocs project={project} />
          }
        </motion.main>

        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
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
