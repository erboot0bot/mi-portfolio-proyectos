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

import Tareas from '../Tareas'

describe('Tareas', () => {
  it('muestra empty state cuando no hay tareas', async () => {
    render(<Tareas />)
    await waitFor(() =>
      expect(screen.getByText(/sin tareas pendientes/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva tarea', async () => {
    render(<Tareas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva tarea/i)).toBeInTheDocument()
    )
  })

  it('abre formulario al pulsar nueva tarea', async () => {
    render(<Tareas />)
    await waitFor(() => screen.getByText(/\+ nueva tarea/i))
    fireEvent.click(screen.getByText(/\+ nueva tarea/i))
    expect(screen.getByPlaceholderText(/título de la tarea/i)).toBeInTheDocument()
  })

  it('muestra tareas con prioridad', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 't1', title: 'Llamar al médico', status: 'pending', priority: 'high', due_date: null, description: null, completed_at: null }],
        error: null,
      })),
    })
    render(<Tareas />)
    await waitFor(() => expect(screen.getByText('Llamar al médico')).toBeInTheDocument())
  })
})
