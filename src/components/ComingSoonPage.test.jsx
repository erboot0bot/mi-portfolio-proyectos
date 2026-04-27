// src/components/ComingSoonPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComingSoonPage from './ComingSoonPage'

function renderPage(props = {}) {
  return render(
    <MemoryRouter>
      <ComingSoonPage title="Cursos" icon="📚" {...props} />
    </MemoryRouter>
  )
}

describe('ComingSoonPage', () => {
  it('renders title and coming-soon badge', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cursos' })).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('does not show email input when waitlistKey is not provided', () => {
    renderPage()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows email input and Notificarme button when waitlistKey is provided', () => {
    renderPage({ waitlistKey: 'cursos' })
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notificarme/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', () => {
    renderPage({ waitlistKey: 'cursos' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'not-valid' } })
    fireEvent.click(screen.getByRole('button', { name: /notificarme/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows success message after valid email submit', () => {
    renderPage({ waitlistKey: 'cursos' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /notificarme/i }))
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/te avisamos/i)).toBeInTheDocument()
  })
})
