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
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Ideas from '../Ideas'

describe('Ideas', () => {
  it('muestra empty state cuando no hay ideas', async () => {
    render(<Ideas />)
    await waitFor(() =>
      expect(screen.getByText(/sin ideas/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva idea', async () => {
    render(<Ideas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva idea/i)).toBeInTheDocument()
    )
  })

  it('abre modal al pulsar nueva idea', async () => {
    render(<Ideas />)
    await waitFor(() => screen.getByText(/\+ nueva idea/i))
    fireEvent.click(screen.getByText(/\+ nueva idea/i))
    expect(screen.getByPlaceholderText(/título de la idea/i)).toBeInTheDocument()
  })

  it('muestra ideas cargadas', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'i1', title: 'App de recetas con IA', description: 'Usar GPT-4 para sugerencias', tags: ['IA', 'recetas'], created_at: new Date().toISOString() }],
        error: null,
      })),
    })
    render(<Ideas />)
    await waitFor(() => expect(screen.getByText('App de recetas con IA')).toBeInTheDocument())
    expect(screen.getByText('IA')).toBeInTheDocument()
  })
})
