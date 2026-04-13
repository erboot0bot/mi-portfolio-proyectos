/*
 * Home.jsx — project grid with technology filter
 *
 * Light mode: clean white hero, generous Inter typography (E style).
 * Dark mode: cosmic mesh gradient hero orange→violet→black (D style).
 *
 * Sorting: featured=true first, then by date descending.
 * Filter: null = show all, string = show matching projects only.
 */

import { useState, useMemo } from 'react'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import FilterBar from '../components/FilterBar'

function sortProjects(list) {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.date.localeCompare(a.date)
  })
}

function extractTechs(list) {
  const all = list.flatMap(p => p.technologies)
  return [...new Set(all)].sort()
}

export default function Home() {
  const [activeTech, setActiveTech] = useState(null)

  const sorted = useMemo(() => sortProjects(projects), [])
  const techs = useMemo(() => extractTechs(projects), [])

  const filtered = activeTech
    ? sorted.filter(p => p.technologies.includes(activeTech))
    : sorted

  return (
    <div>
      {/* ── Hero ── */}
      {/* Light: clean left-aligned layout with orange accent line */}
      {/* Dark:  full-bleed cosmic mesh gradient (D style) */}
      <section className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 mb-16 overflow-hidden">

        {/* Dark mode: cosmic gradient background */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{background: 'linear-gradient(110deg, #ea580c 0%, #c2410c 12%, #7c2d12 24%, #4c1d95 44%, #1e1b4b 62%, #0a0a0f 80%)'}} />
        {/* Dark mode: radial warmth */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{background: 'radial-gradient(ellipse at 25% 60%, rgba(249,115,22,0.2) 0%, transparent 55%)'}} />
        {/* Dark mode: fade to page bg at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 hidden dark:block pointer-events-none"
          style={{background: 'linear-gradient(to bottom, transparent, #0a0a0f)'}} />

        {/* Light mode: very subtle orange ambient top-left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 dark:hidden pointer-events-none rounded-full"
          style={{background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)'}} />

        <div className="relative z-10 pt-12 pb-14 dark:pb-20 dark:pt-16">
          <p className="font-mono text-xs tracking-widest uppercase mb-4
            text-[var(--text-faint)] dark:text-orange-300/60">
            Hola, soy
          </p>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-5
            text-[var(--text)] dark:text-white">
            H3nky
          </h1>
          {/* Accent line — visible in light mode */}
          <div className="w-12 h-[3px] rounded-full mb-5 dark:hidden"
            style={{background: 'var(--accent)'}} />
          <p className="text-lg leading-relaxed font-light max-w-xl
            text-[var(--text-muted)] dark:text-white/70">
            Desarrollador apasionado por construir cosas útiles y bien hechas.
            Aquí documento los proyectos que me han enseñado algo.
          </p>
        </div>
      </section>

      {/* ── Projects section ── */}
      <header className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-1 text-[var(--text)]">Proyectos</h2>
        <p className="text-sm text-[var(--text-faint)]">Lo que he estado construyendo.</p>
      </header>

      {techs.length > 0 && (
        <div className="mb-8">
          <FilterBar techs={techs} active={activeTech} onChange={setActiveTech} />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-faint)]">
          No hay proyectos con &quot;{activeTech}&quot; todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
