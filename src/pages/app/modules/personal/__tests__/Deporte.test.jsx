import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Deporte from '../Deporte'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'deporte_rutinas') return [
      { id: 'rut-1', nombre: 'Upper body', dias: ['L', 'X'], ejercicios: [
        { id: 'ej-1', nombre: 'Press banca', series: 4, reps: 8, peso: 70 },
      ]},
    ]
    if (key === 'deporte_rutas') return [
      { id: 'ruta-1', nombre: 'Montserrat', tipo: 'senderismo', distancia_km: 12, desnivel_m: 650, dificultad: 'media', tiempo_h: 4.5, fecha: '2026-05-01', notas: '' },
    ]
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Deporte', () => {
  it('renders rutinas tab with routine name', () => {
    render(<Deporte />)
    expect(screen.getByText('Upper body')).toBeInTheDocument()
  })
  it('switches to rutas tab', () => {
    render(<Deporte />)
    fireEvent.click(screen.getByText(/Rutas/))
    expect(screen.getByText('Montserrat')).toBeInTheDocument()
  })
  it('shows exercise inside routine', () => {
    render(<Deporte />)
    expect(screen.getByText('Press banca')).toBeInTheDocument()
  })
  it('shows dias badges on routine', () => {
    render(<Deporte />)
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
  })
})
