/**
 * Edge case tests for ProjectsHome with controlled mock data.
 *
 * vi.mock is hoisted, so this must live in its own file
 * to avoid affecting the main ProjectsHome.test.jsx.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Single project with only React tech — allows testing "no results" for other techs
vi.mock('../data/projects', () => ({
  projects: [
    {
      slug: 'solo-react',
      title: 'Solo React Project',
      description: 'Only React, nothing else.',
      longDescription: null,
      status: 'completed',
      date: '2024-01',
      featured: false,
      technologies: ['React'],
      images: [],
      github: 'https://github.com/test',
      demo: null,
      gradientFrom: '#f97316',
      gradientTo: '#ea580c',
    },
  ],
}))

import ProjectsHome from './ProjectsHome'

function renderHome() {
  return render(<MemoryRouter><ProjectsHome /></MemoryRouter>)
}

describe('ProjectsHome — edge cases', () => {
  it('renderiza correctamente sin proyectos featured', () => {
    renderHome()
    // Page heading still renders even when no project is featured
    expect(screen.getByRole('heading', { name: /proyectos/i })).toBeInTheDocument()
  })

  it('muestra los proyectos que coinciden con el filtro activo', async () => {
    const user = userEvent.setup()
    renderHome()
    const reactBtn = screen.getByRole('button', { name: 'React' })
    await user.click(reactBtn)
    // ProjectCard renders the title twice (image overlay + text section)
    expect(screen.getAllByText('Solo React Project').length).toBeGreaterThan(0)
  })

  it('muestra los proyectos sin filtro y no muestra mensaje de vacío', () => {
    renderHome()
    // The project card should appear with no filter active
    expect(screen.getAllByText('Solo React Project').length).toBeGreaterThan(0)
    // No empty-state message expected (we have 1 matching project)
    expect(screen.queryByText(/no hay proyectos con/i)).not.toBeInTheDocument()
  })
})
