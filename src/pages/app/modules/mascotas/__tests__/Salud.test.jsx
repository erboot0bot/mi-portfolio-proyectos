import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      pet: { id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕', metadata: {} },
      app: { id: 'app-1' },
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select:   vi.fn().mockReturnThis(),
      eq:       vi.fn().mockReturnThis(),
      in:       vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order:    vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

import Salud from '../Salud'

describe('Salud', () => {
  it('muestra el encabezado de salud', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/salud/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay eventos', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/sin eventos de salud/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nuevo evento', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nuevo evento/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar nuevo evento', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    expect(screen.getByPlaceholderText('Título *')).toBeInTheDocument()
  })

  it('no muestra campo de repetición para tipo vaccination', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    // Default type is 'vaccination' — interval_days field should NOT appear
    expect(screen.queryByPlaceholderText(/repetir cada/i)).not.toBeInTheDocument()
  })

  it('muestra campo de repetición al seleccionar medicación', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'medication' } })
    expect(screen.getByPlaceholderText(/repetir cada/i)).toBeInTheDocument()
  })
})
