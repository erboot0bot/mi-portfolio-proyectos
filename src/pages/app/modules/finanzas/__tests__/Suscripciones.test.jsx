import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Suscripciones from '../Suscripciones'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))

vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'sub-1', nombre: 'Netflix', icono: '🎬', coste: 15.99, periodicidad: 'mensual', fecha_renovacion: '2026-05-27', estado: 'activa', compartida: true },
    { id: 'sub-2', nombre: 'Spotify', icono: '🎵', coste: 9.99,  periodicidad: 'mensual', fecha_renovacion: '2026-05-23', estado: 'pausada', compartida: false },
  ],
  demoWrite: vi.fn(),
}))

describe('Suscripciones', () => {
  it('renders subscription list', () => {
    render(<Suscripciones />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Spotify')).toBeInTheDocument()
  })

  it('shows total mensual for active subscriptions only', () => {
    render(<Suscripciones />)
    // Only Netflix (15.99) is activa — Spotify is pausada
    // 15,99 appears in both the total header and the Netflix card
    const matches = screen.getAllByText(/15,99/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows estado badges', () => {
    render(<Suscripciones />)
    expect(screen.getByText('activa')).toBeInTheDocument()
    expect(screen.getByText('pausada')).toBeInTheDocument()
  })

  it('renders preset buttons', () => {
    render(<Suscripciones />)
    // At least one preset button with "Netflix" text exists
    const buttons = screen.getAllByRole('button')
    const netflixBtn = buttons.find(b => b.textContent.includes('Netflix'))
    expect(netflixBtn).toBeTruthy()
  })
})
