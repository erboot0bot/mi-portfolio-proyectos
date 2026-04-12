/*
 * Home.jsx — project grid with technology filter
 *
 * Sorting: featured=true first, then by date descending (YYYY-MM string
 * comparison works correctly when months are zero-padded).
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
      <section className="mb-16 pt-2">
        <p className="text-zinc-500 text-sm font-mono mb-3">Hola, soy</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">H3nky</h1>
        <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
          Desarrollador apasionado por construir cosas útiles y bien hechas. Aquí documento los proyectos que me han enseñado algo.
        </p>
      </section>

      <header className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Proyectos</h2>
        <p className="text-zinc-500">Lo que he estado construyendo.</p>
      </header>

      {techs.length > 0 && (
        <div className="mb-8">
          <FilterBar techs={techs} active={activeTech} onChange={setActiveTech} />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No hay proyectos con &quot;{activeTech}&quot; todavía.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
