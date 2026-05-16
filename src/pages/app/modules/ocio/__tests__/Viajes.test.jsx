import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Viajes from '../Viajes'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const MOCK = [
  { id: 'v1', destino: 'Lisboa', pais: 'Portugal', estado: 'completado',
    fecha_inicio: '2024-06-01', fecha_fin: '2024-06-07',
    alojamiento: { nombre: 'Hotel Sol', tipo: 'hotel', confirmacion: 'ABC123', direccion: 'Rua 1' },
    transporte: [{ id: 't1', tipo: 'vuelo', referencia: 'VY001', origen: 'BCN', destino: 'LIS', fecha: '2024-06-01' }],
    presupuesto: 600, gasto_real: 550, notas: 'Viaje genial' },
  { id: 'v2', destino: 'Tokio', pais: 'Japón', estado: 'planificado',
    fecha_inicio: '2025-03-01', fecha_fin: '2025-03-15',
    alojamiento: { nombre: '', tipo: 'hotel', confirmacion: '', direccion: '' },
    transporte: [], presupuesto: 2500, gasto_real: 0, notas: '' },
]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => key === 'viajes' ? MOCK : [],
  demoWrite: vi.fn(),
}))

describe('Viajes', () => {
  it('renders trip destinations', () => {
    render(<Viajes />)
    expect(screen.getByText('Lisboa')).toBeInTheDocument()
    expect(screen.getByText('Tokio')).toBeInTheDocument()
  })

  it('shows estado badge', () => {
    render(<Viajes />)
    expect(screen.getByText(/completado/i)).toBeInTheDocument()
    expect(screen.getByText(/planificado/i)).toBeInTheDocument()
  })

  it('shows detail with alojamiento on click', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Lisboa'))
    expect(screen.getByText('Hotel Sol')).toBeInTheDocument()
  })

  it('shows presupuesto in detail', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Lisboa'))
    expect(screen.getByText(/600/)).toBeInTheDocument()
  })

  it('back button returns to list', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Lisboa'))
    fireEvent.click(screen.getByText(/← Viajes/i))
    expect(screen.getByText('Tokio')).toBeInTheDocument()
  })
})
