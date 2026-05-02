import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🗂️', name: 'Personal', type: 'personal' },
      modules: [],
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Notas from '../Notas'

describe('Notas', () => {
  it('muestra empty state cuando no hay notas', async () => {
    render(<Notas />)
    await waitFor(() =>
      expect(screen.getByText(/sin notas/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva nota', async () => {
    render(<Notas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva nota/i)).toBeInTheDocument()
    )
  })

  it('abre modal al pulsar nueva nota', async () => {
    render(<Notas />)
    await waitFor(() => screen.getByText(/\+ nueva nota/i))
    fireEvent.click(screen.getByText(/\+ nueva nota/i))
    expect(screen.getByPlaceholderText(/título de la nota/i)).toBeInTheDocument()
  })

  it('muestra notas cargadas desde supabase', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'n1', title: 'Mi nota', content: 'Contenido', color: '#f59e0b', pinned: false, updated_at: new Date().toISOString() }],
        error: null,
      })),
    })
    render(<Notas />)
    await waitFor(() => expect(screen.getByText('Mi nota')).toBeInTheDocument())
  })
})
