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
      <section className="relative mb-16 overflow-hidden">

        {/* Dark mode: cosmic gradient background */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{background: 'linear-gradient(110deg, #ea580c 0%, #c2410c 12%, #7c2d12 24%, #4c1d95 44%, #1e1b4b 62%, #0a0a0f 80%)'}} />
        {/* Dark mode: radial warmth */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{background: 'radial-gradient(ellipse at 25% 60%, rgba(249,115,22,0.2) 0%, transparent 55%)'}} />
        {/* Dark mode: fade to page bg at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 hidden dark:block pointer-events-none"
          style={{background: 'linear-gradient(to bottom, transparent, #0a0a0f)'}} />

        {/* Light mode: warm gradient wash top-left → center */}
        <div className="absolute inset-0 dark:hidden pointer-events-none"
          style={{background: 'linear-gradient(135deg, rgba(253,186,116,0.22) 0%, rgba(249,115,22,0.08) 25%, transparent 60%)'}} />
        {/* Light mode: large primary glow top-left */}
        <div className="absolute -top-24 -left-24 w-[480px] h-[380px] dark:hidden pointer-events-none"
          style={{background: 'radial-gradient(ellipse at top left, rgba(249,115,22,0.18) 0%, rgba(251,146,60,0.07) 45%, transparent 70%)'}} />
        {/* Light mode: secondary cooler glow top-right (depth) */}
        <div className="absolute -top-8 right-0 w-72 h-72 dark:hidden pointer-events-none"
          style={{background: 'radial-gradient(ellipse at top right, rgba(234,179,8,0.07) 0%, transparent 65%)'}} />
        {/* Light mode: bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-20 dark:hidden pointer-events-none"
          style={{background: 'linear-gradient(to bottom, transparent, var(--bg))'}} />

        <div className="relative z-10 pt-14 pb-16 dark:pb-20 dark:pt-16 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
          <p className="font-mono text-xs tracking-widest uppercase mb-4
            text-[var(--text-faint)] dark:text-orange-300/60 flex items-center gap-2">
            <span className="inline-block w-6 h-px" style={{background: 'var(--accent)', opacity: 0.6}} />
            Hola, soy
          </p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-5
            text-[var(--text)] dark:text-white" style={{letterSpacing: '-0.04em'}}>
            H3nky<span style={{color: 'var(--accent)'}}>.</span>
          </h1>
          {/* Accent line — visible in light mode */}
          <div className="w-12 h-[3px] rounded-full mb-5 dark:hidden"
            style={{background: 'var(--accent)'}} />
          <p className="text-lg leading-relaxed font-light max-w-xl mb-8
            text-[var(--text-muted)] dark:text-white/70">
            Documentación viva de mis proyectos: lo que construyo, cómo lo construyo y lo que aprendo en el proceso con IA.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-8 mb-10">
            {[
              { num: projects.length, label: 'Proyectos' },
              { num: 3, label: 'Stacks' },
              { num: '100%', label: 'IA-assisted' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-8">
                {i > 0 && <div className="w-px h-8 bg-[var(--border)]" />}
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--text)] leading-none" style={{letterSpacing: '-0.03em'}}>{s.num}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wider mt-1 text-[var(--text-faint)]">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="#projects-section"
              onClick={e => { e.preventDefault(); document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px"
              style={{background: 'var(--accent)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)'}}
            >
              Ver proyectos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                border border-[var(--border)] text-[var(--text-muted)]
                hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Projects section ── */}
      <div id="projects-section" className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(project => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
