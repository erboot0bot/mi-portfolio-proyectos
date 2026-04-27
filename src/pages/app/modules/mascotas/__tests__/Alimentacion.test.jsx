import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockPet = {
  id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕',
  birth_date: null, notes: null,
  metadata: { feeding_schedule: [] },
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      pet: mockPet,
      app: { id: 'app-1' },
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select:   vi.fn().mockReturnThis(),
      eq:       vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order:    vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

import Alimentacion from '../Alimentacion'

describe('Alimentacion', () => {
  it('muestra sección stock de alimento', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/stock de alimento/i)).toBeInTheDocument()
    )
  })

  it('muestra sección horario de tomas', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/horario de tomas/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay alimentos', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/sin alimentos registrados/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay tomas', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/sin tomas programadas/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario stock al pulsar añadir', async () => {
    render(<Alimentacion />)
    await waitFor(() => screen.getByText(/stock de alimento/i))
    const buttons = screen.getAllByText(/\+ añadir/i)
    fireEvent.click(buttons[0])
    expect(screen.getByPlaceholderText(/nombre del alimento/i)).toBeInTheDocument()
  })

  it('muestra formulario toma al pulsar añadir toma', async () => {
    render(<Alimentacion />)
    await waitFor(() => screen.getByText(/horario de tomas/i))
    const buttons = screen.getAllByText(/\+ añadir/i)
    fireEvent.click(buttons[1])
    expect(screen.getByPlaceholderText('200g')).toBeInTheDocument()
  })
})
