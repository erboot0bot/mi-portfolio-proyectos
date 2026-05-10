import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import NotFound from './NotFound'

function renderDetail(slug) {
  return render(
    <MemoryRouter initialEntries={[`/documentacion/${slug}`]}>
      <Routes>
        <Route path="/documentacion/:slug" element={<ProjectDetail />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectDetail', () => {
  it('renders project title for a valid slug', () => {
    renderDetail('portfolio-personal')
    expect(screen.getAllByRole('heading', { name: /portfolio personal/i }).length).toBeGreaterThan(0)
  })

  it('renders the back link', () => {
    renderDetail('portfolio-personal')
    expect(screen.getByRole('link', { name: /todos los proyectos/i })).toBeInTheDocument()
  })

  it('renders tech badges', () => {
    renderDetail('portfolio-personal')
    expect(screen.getAllByText('React').length).toBeGreaterThan(0)
  })

  it('renders GitHub button when github is set', () => {
    renderDetail('portfolio-personal')
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
  })

  it('does not render demo button when demo is null', () => {
    renderDetail('portfolio-personal')
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument()
  })

  it('redirects to /404 for an invalid slug', () => {
    renderDetail('slug-que-no-existe')
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
