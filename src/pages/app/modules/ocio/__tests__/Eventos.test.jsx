import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Eventos from '../Eventos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const future = new Date(); future.setDate(future.getDate() + 30)
const past = new Date(); past.setDate(past.getDate() - 10)
const fmt = d => d.toISOString().slice(0, 10)

const MOCK = [
  { id: 'e1', tipo: 'concierto', titulo: 'Vetusta Morla en Palau', artista: 'Vetusta Morla',
    recinto: 'Palau Sant Jordi', ciudad: 'Barcelona', fecha: fmt(future),
    precio: 55, estado: 'confirmado', valoracion: 0, notas: '' },
  { id: 'e2', tipo: 'teatro', titulo: 'El método Grönholm', artista: 'TNC',
    recinto: 'TNC', ciudad: 'Barcelona', fecha: fmt(past),
    precio: 28, estado: 'asistido', valoracion: 5, notas: 'Genial' },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'eventos' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Eventos', () => {
  it('renders event titles', () => {
    render(<Eventos />)
    expect(screen.getByText('Vetusta Morla en Palau')).toBeInTheDocument()
    expect(screen.getByText('El método Grönholm')).toBeInTheDocument()
  })

  it('shows tipo badge', () => {
    render(<Eventos />)
    expect(screen.getByText(/concierto/i)).toBeInTheDocument()
    expect(screen.getByText(/teatro/i)).toBeInTheDocument()
  })

  it('shows precio', () => {
    render(<Eventos />)
    expect(screen.getByText(/55€/)).toBeInTheDocument()
  })

  it('filters to próximos only', () => {
    render(<Eventos />)
    fireEvent.click(screen.getByText('Próximos'))
    expect(screen.getByText('Vetusta Morla en Palau')).toBeInTheDocument()
    expect(screen.queryByText('El método Grönholm')).not.toBeInTheDocument()
  })

  it('filters to pasados only', () => {
    render(<Eventos />)
    fireEvent.click(screen.getByText('Pasados'))
    expect(screen.queryByText('Vetusta Morla en Palau')).not.toBeInTheDocument()
    expect(screen.getByText('El método Grönholm')).toBeInTheDocument()
  })
})
