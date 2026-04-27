// src/components/ProjectCard.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectCard from './ProjectCard'

const baseProject = {
  slug: 'test-project',
  title: 'Test Project',
  description: 'A test project description that is long enough.',
  status: 'completed',
  technologies: ['React', 'Supabase'],
  gradientFrom: '#ea580c',
  gradientTo: '#7c2d12',
  shortTitle: 'Test',
  github: null,
  demo: null,
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={{ ...baseProject, ...overrides }} />
    </MemoryRouter>
  )
}

describe('ProjectCard', () => {
  it('renders project title and description', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument()
    expect(screen.getByText(/test project description/i)).toBeInTheDocument()
  })

  it('does not render Demo/GitHub links when both are null', () => {
    renderCard()
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
  })

  it('renders GitHub link when github is set', () => {
    renderCard({ github: 'https://github.com/H3nky/repo' })
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('href', 'https://github.com/H3nky/repo')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders Demo link when demo is set', () => {
    renderCard({ demo: 'https://demo.example.com' })
    const link = screen.getByRole('link', { name: /demo/i })
    expect(link).toHaveAttribute('href', 'https://demo.example.com')
  })

  it('renders both links when both are set', () => {
    renderCard({ github: 'https://github.com/H3nky/repo', demo: 'https://demo.example.com' })
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /demo/i })).toBeInTheDocument()
  })
})
