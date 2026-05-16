import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Deportes from '../Deportes'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const future = new Date(); future.setDate(future.getDate() + 15)
const past   = new Date(); past.setDate(past.getDate() - 7)
const fmt    = d => d.toISOString().slice(0, 10)

const MOCK = [
  { id: 'd1', deporte: 'Fútbol', equipo: 'FC Barcelona', competicion: 'La Liga',
    partidos: [
      { id: 'p1', rival: 'Real Madrid', es_local: true, fecha: fmt(future), goles_local: null, goles_visitante: null },
      { id: 'p2', rival: 'Atlético', es_local: false, fecha: fmt(past), goles_local: 2, goles_visitante: 1 },
    ] },
  { id: 'd2', deporte: 'Baloncesto', equipo: 'FC Barcelona Basket', competicion: 'ACB',
    partidos: [] },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'deportes_seguimiento' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Deportes', () => {
  it('renders team names', () => {
    render(<Deportes />)
    expect(screen.getAllByText(/FC Barcelona/).length).toBeGreaterThan(0)
    expect(screen.getByText(/FC Barcelona Basket/)).toBeInTheDocument()
  })

  it('shows deporte and competicion', () => {
    render(<Deportes />)
    expect(screen.getByText(/La Liga/)).toBeInTheDocument()
    expect(screen.getByText(/ACB/)).toBeInTheDocument()
  })

  it('shows próximo partido in detail', () => {
    render(<Deportes />)
    // click the first FC Barcelona element (the card, not the basket one)
    const cards = screen.getAllByText(/FC Barcelona/)
    fireEvent.click(cards[0])
    expect(screen.getByText(/Real Madrid/)).toBeInTheDocument()
  })

  it('shows result for past match', () => {
    render(<Deportes />)
    const cards = screen.getAllByText(/FC Barcelona/)
    fireEvent.click(cards[0])
    expect(screen.getByText(/2 - 1/)).toBeInTheDocument()
  })

  it('back button returns to list', () => {
    render(<Deportes />)
    const cards = screen.getAllByText(/FC Barcelona/)
    fireEvent.click(cards[0])
    fireEvent.click(screen.getByText(/← Deportes/i))
    expect(screen.getByText(/FC Barcelona Basket/)).toBeInTheDocument()
  })
})
