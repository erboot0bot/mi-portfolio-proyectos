import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Regalos from '../Regalos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const MOCK = [
  { id: 'r1', persona: 'María', relacion: 'pareja', ocasion: 'cumpleanos',
    fecha: '2025-06-15', presupuesto_max: 150, coste_real: 0, estado: 'pendiente',
    ideas: [
      { id: 'i1', descripcion: 'Auriculares Sony', precio_aprox: 350, url: '' },
      { id: 'i2', descripcion: 'Perfume', precio_aprox: 120, url: '' },
    ] },
  { id: 'r2', persona: 'Papá', relacion: 'familia', ocasion: 'navidad',
    fecha: '2025-12-25', presupuesto_max: 80, coste_real: 75, estado: 'comprado',
    ideas: [{ id: 'i3', descripcion: 'Libro Historia', precio_aprox: 25, url: '' }] },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'regalos' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Regalos', () => {
  it('renders person names', () => {
    render(<Regalos />)
    expect(screen.getByText('María')).toBeInTheDocument()
    expect(screen.getByText('Papá')).toBeInTheDocument()
  })

  it('shows ideas count in list', () => {
    render(<Regalos />)
    expect(screen.getByText(/2 idea/)).toBeInTheDocument()
  })

  it('shows estado badge', () => {
    render(<Regalos />)
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument()
    expect(screen.getByText(/comprado/i)).toBeInTheDocument()
  })

  it('shows ideas in detail view', () => {
    render(<Regalos />)
    fireEvent.click(screen.getByText('María'))
    expect(screen.getByText('Auriculares Sony')).toBeInTheDocument()
    expect(screen.getByText('Perfume')).toBeInTheDocument()
  })

  it('back button returns to list', () => {
    render(<Regalos />)
    fireEvent.click(screen.getByText('María'))
    fireEvent.click(screen.getByText(/← Regalos/i))
    expect(screen.getByText('Papá')).toBeInTheDocument()
  })
})
