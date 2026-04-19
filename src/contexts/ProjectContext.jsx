import { createContext, useContext, useState } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ project, children }) {
  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be inside ProjectProvider')
  return ctx
}
