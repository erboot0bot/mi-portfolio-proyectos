import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🚗', name: 'Vehículo', type: 'vehiculo' },
      vehicle: { id: 'v1', name: 'Mi Golf', type: 'coche', fuel_type: 'gasolina' },
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Repostajes from '../Repostajes'

describe('Repostajes', () => {
  it('muestra empty state cuando no hay repostajes', async () => {
    render(<Repostajes />)
    await waitFor(() =>
      expect(screen.getByText(/sin repostajes/i)).toBeInTheDocument()
    )
  })

  it('muestra botón añadir repostaje', async () => {
    render(<Repostajes />)
    await waitFor(() =>
      expect(screen.getByText(/\+ repostaje/i)).toBeInTheDocument()
    )
  })

  it('muestra repostajes con litros y coste', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'f1', date: '2026-04-27', liters: 45.2, price_per_liter: 1.65, total_cost: 74.58, km_at_fill: 52000, full_tank: true, notes: null }],
        error: null,
      })),
    })
    render(<Repostajes />)
    await waitFor(() => expect(screen.getAllByText(/45\.2/).length).toBeGreaterThan(0))
    expect(screen.getAllByText(/74\.58/).length).toBeGreaterThan(0)
  })
})
