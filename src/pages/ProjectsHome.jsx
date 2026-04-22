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
import { Link } from 'react-router-dom'
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
      {/* ── Hero Split ── */}
      <section className="relative mb-16 overflow-hidden">

        {/* Backgrounds */}
        <div className="absolute inset-0 dark:hidden pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(253,186,116,0.22) 0%, rgba(249,115,22,0.08) 25%, transparent 60%)' }} />
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{ background: 'linear-gradient(110deg, #ea580c 0%, #7c2d12 28%, #4c1d95 52%, #0a0a0f 75%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))', zIndex: 5 }} />

        <div className="relative z-10 pt-16 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto
          grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-5
              text-[var(--accent)] flex items-center gap-2">
              <span className="block w-6 h-px bg-[var(--accent)] opacity-60" />
              Portfolio
            </p>

            <h1 className="font-black leading-none mb-5 text-[var(--text)] dark:text-white"
              style={{ fontSize: 'clamp(52px, 7vw, 88px)', letterSpacing: '-0.04em' }}>
              H3nky<span className="text-[var(--accent)]">.</span>
            </h1>

            <p className="text-lg leading-relaxed font-light mb-8 max-w-md
              text-[var(--text-muted)] dark:text-white/70">
              Construyo con IA. Documento el proceso. Aprendo en público.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-8">
              {[
                { num: projects.length, label: 'Proyectos' },
                { num: '100%', label: 'IA-assisted' },
              ].map(({ num, label }, i) => (
                <div key={i}>
                  <div className="text-3xl font-extrabold tracking-tight leading-none
                    text-[var(--text)] dark:text-white">{num}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wider mt-1
                    text-[var(--text-faint)]">{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#proyectos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-[var(--accent)] text-white text-sm font-semibold
                  hover:opacity-90 hover:-translate-y-px transition-all duration-150
                  shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
              >
                Ver proyectos →
              </a>
              <a
                href="https://github.com/H3nky"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  border border-[var(--border)] text-sm font-medium
                  text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]
                  transition-all duration-150"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Right — featured projects mini-list */}
          <div className="hidden lg:flex flex-col gap-3">
            {sorted.filter(p => p.featured).slice(0, 3).map(p => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl
                  border border-[var(--border)] bg-[var(--bg-card)]
                  hover:border-orange-200 dark:hover:border-orange-500/30
                  hover:shadow-[0_2px_12px_rgba(249,115,22,0.08)]
                  transition-all duration-150 group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)] truncate">{p.title}</div>
                  <div className="text-[11px] text-[var(--text-faint)] mt-0.5">
                    {p.technologies.slice(0, 2).join(' · ')}
                  </div>
                </div>
                <span className="text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors text-sm">→</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Projects section ── */}
      <div id="proyectos" className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
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
