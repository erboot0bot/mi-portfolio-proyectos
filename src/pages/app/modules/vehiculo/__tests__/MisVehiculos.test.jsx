import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🚗', name: 'Vehículo', type: 'vehiculo' },
      modules: [{ path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' }],
    }),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import MisVehiculos from '../MisVehiculos'

describe('MisVehiculos', () => {
  it('muestra empty state cuando no hay vehículos', async () => {
    render(<MisVehiculos />)
    await waitFor(() =>
      expect(screen.getByText(/sin vehículos/i)).toBeInTheDocument()
    )
  })

  it('muestra botón añadir vehículo', async () => {
    render(<MisVehiculos />)
    await waitFor(() =>
      expect(screen.getByText(/\+ añadir vehículo/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar añadir', async () => {
    render(<MisVehiculos />)
    await waitFor(() => screen.getByText(/\+ añadir vehículo/i))
    fireEvent.click(screen.getByText(/\+ añadir vehículo/i))
    expect(screen.getByPlaceholderText(/nombre o alias/i)).toBeInTheDocument()
  })

  it('muestra vehículos cargados', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'v1', name: 'Mi Golf', type: 'coche', brand: 'Volkswagen', model: 'Golf', year: 2019, plate: '1234ABC', fuel_type: 'gasolina', initial_km: 0, notes: null }],
        error: null,
      })),
    })
    render(<MisVehiculos />)
    await waitFor(() => expect(screen.getByText('Mi Golf')).toBeInTheDocument())
    expect(screen.getByText('1234ABC')).toBeInTheDocument()
  })
})
