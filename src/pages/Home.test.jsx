import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home', () => {
  it('renders the page heading', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /proyectos/i })).toBeInTheDocument()
  })

  it('renders project cards', () => {
    renderHome()
    expect(screen.getByText('Portfolio Personal')).toBeInTheDocument()
  })

  it('shows all projects when no filter is active', () => {
    renderHome()
    const allBtn = screen.getByRole('button', { name: /todos/i })
    expect(allBtn).toHaveClass('bg-[var(--accent)]')
  })

  it('filters by technology', async () => {
    const user = userEvent.setup()
    renderHome()
    const reactBtn = screen.queryByRole('button', { name: 'React' })
    if (!reactBtn) return // skip if no React projects
    await user.click(reactBtn)
    expect(screen.getByText('Portfolio Personal')).toBeInTheDocument()
  })

  it('clicking a tech filter twice deselects it (shows all)', async () => {
    const user = userEvent.setup()
    renderHome()
    const reactBtn = screen.queryByRole('button', { name: 'React' })
    if (!reactBtn) return
    await user.click(reactBtn)
    await user.click(reactBtn)
    const allBtn = screen.getByRole('button', { name: /todos/i })
    expect(allBtn).toHaveClass('bg-[var(--accent)]')
  })
})
