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
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Proyectos</h1>
        <p className="text-zinc-400">Una colección de cosas que he construido.</p>
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
