import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Restaurantes from '../Restaurantes'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const MOCK = [
  { id: 'r1', nombre: 'La Pepita', tipo_cocina: 'Mediterránea', ciudad: 'BCN',
    valoracion: 5, repetirias: true, wishlist: false,
    visitas: [{ id: 'v1', fecha: '2024-01-10', con_quien: 'Pareja', importe: 68, nota: 'Rico', valoracion: 5 }],
    tags: ['romántico'] },
  { id: 'r2', nombre: 'Sushi Bar', tipo_cocina: 'Japonesa', ciudad: 'BCN',
    valoracion: 0, repetirias: null, wishlist: true,
    visitas: [], tags: [] },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'restaurantes' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Restaurantes', () => {
  it('renders restaurant names in list', () => {
    render(<Restaurantes />)
    expect(screen.getByText('La Pepita')).toBeInTheDocument()
    expect(screen.getByText('Sushi Bar')).toBeInTheDocument()
  })

  it('shows wishlist badge for wishlist restaurant', () => {
    render(<Restaurantes />)
    expect(screen.getAllByText(/Wishlist/i).length).toBeGreaterThan(0)
  })

  it('shows visit count', () => {
    render(<Restaurantes />)
    expect(screen.getByText(/1 visita/)).toBeInTheDocument()
  })

  it('shows detail view when clicking a restaurant', () => {
    render(<Restaurantes />)
    fireEvent.click(screen.getByText('La Pepita'))
    expect(screen.getByText(/Historial de visitas/i)).toBeInTheDocument()
  })

  it('shows visit history in detail view', () => {
    render(<Restaurantes />)
    fireEvent.click(screen.getByText('La Pepita'))
    expect(screen.getByText(/Pareja/)).toBeInTheDocument()
  })

  it('back button returns to list', () => {
    render(<Restaurantes />)
    fireEvent.click(screen.getByText('La Pepita'))
    fireEvent.click(screen.getByText(/← Restaurantes/i))
    expect(screen.getByText('Sushi Bar')).toBeInTheDocument()
  })
})
