import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }],
    }),
    useNavigate: () => mockNavigate,
  }
})

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  order:  vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

import MisMascotas from '../MisMascotas'

describe('MisMascotas', () => {
  it('muestra empty state cuando no hay mascotas', async () => {
    render(<MisMascotas />)
    await waitFor(() =>
      expect(screen.getByText(/añade tu primera mascota/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva mascota', async () => {
    render(<MisMascotas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva mascota/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar nueva mascota', async () => {
    render(<MisMascotas />)
    await waitFor(() => screen.getByText(/\+ nueva mascota/i))
    fireEvent.click(screen.getByText(/\+ nueva mascota/i))
    expect(screen.getByPlaceholderText('Nombre *')).toBeInTheDocument()
  })

  it('muestra la lista de mascotas cuando hay datos', async () => {
    const mockQueryWithData = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [
          { id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕', birth_date: '2020-01-01', notes: null, metadata: {} },
        ],
        error: null,
      }),
    }
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue(mockQueryWithData)

    render(<MisMascotas />)
    await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument())
    expect(screen.getByText('Perro')).toBeInTheDocument()
  })
})
