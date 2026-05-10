import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../contexts/LanguageContext'
import ProjectsHome from './ProjectsHome'

beforeAll(() => {
  vi.stubGlobal('scrollTo', vi.fn())
})

function renderHome() {
  return render(<MemoryRouter><LanguageProvider><ProjectsHome /></LanguageProvider></MemoryRouter>)
}

describe('Home', () => {
  it('renders the page heading', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /documentaci/i })).toBeInTheDocument()
  })

  it('renders project cards', () => {
    renderHome()
    expect(screen.getAllByText('Portfolio Personal').length).toBeGreaterThan(0)
  })

  it('shows all projects when no filter is active', () => {
    renderHome()
    const allBtn = screen.getByRole('button', { name: /todos/i })
    expect(allBtn).toHaveClass('active')
  })

  it('filters by technology', async () => {
    const user = userEvent.setup()
    renderHome()
    const reactBtn = screen.queryByRole('button', { name: 'React' })
    if (!reactBtn) return // skip if no React projects
    await user.click(reactBtn)
    expect(screen.getAllByText('Portfolio Personal').length).toBeGreaterThan(0)
  })

  it('clicking a tech filter twice deselects it (shows all)', async () => {
    const user = userEvent.setup()
    renderHome()
    const reactBtn = screen.queryByRole('button', { name: 'React' })
    if (!reactBtn) return
    await user.click(reactBtn)
    await user.click(reactBtn)
    const allBtn = screen.getByRole('button', { name: /todos/i })
    expect(allBtn).toHaveClass('active')
  })
})
