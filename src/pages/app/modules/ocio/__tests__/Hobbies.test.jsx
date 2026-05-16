import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Hobbies from '../Hobbies'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const MOCK = [
  { id: 'h1', nombre: 'Fotografía', categoria: 'Arte', icono: '📷',
    descripcion: 'Fotografía urbana',
    proyectos: [
      { id: 'p1', titulo: 'Retratos del barrio', estado: 'en_proceso', notas: '12 fotos', fecha: '2025-01-01' },
      { id: 'p2', titulo: 'La Boqueria', estado: 'terminado', notas: '', fecha: '2024-12-01' },
    ],
    materiales: [{ id: 'm1', nombre: 'Tarjetas SD', stock: 3, unidad: 'uds' }] },
  { id: 'h2', nombre: 'Pintura', categoria: 'Arte', icono: '🎨',
    descripcion: '', proyectos: [], materiales: [] },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'hobbies' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Hobbies', () => {
  it('renders hobby names', () => {
    render(<Hobbies />)
    expect(screen.getAllByText(/Fotografía/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Pintura/)).toBeInTheDocument()
  })

  it('shows active projects count', () => {
    render(<Hobbies />)
    expect(screen.getByText(/1 activo/)).toBeInTheDocument()
  })

  it('shows detail with projects on click', () => {
    render(<Hobbies />)
    fireEvent.click(screen.getAllByText(/Fotografía/)[0])
    expect(screen.getByText('Retratos del barrio')).toBeInTheDocument()
  })

  it('shows materiales tab', () => {
    render(<Hobbies />)
    fireEvent.click(screen.getAllByText(/Fotografía/)[0])
    fireEvent.click(screen.getByText('Materiales'))
    expect(screen.getByText('Tarjetas SD')).toBeInTheDocument()
  })

  it('back button returns to list', () => {
    render(<Hobbies />)
    fireEvent.click(screen.getAllByText(/Fotografía/)[0])
    fireEvent.click(screen.getByText(/← Hobbies/i))
    expect(screen.getByText(/Pintura/)).toBeInTheDocument()
  })
})
