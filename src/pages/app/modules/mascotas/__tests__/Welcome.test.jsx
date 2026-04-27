import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'abc', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'welcome', label: 'Inicio', icon: '🐾' }],
    }),
  }
})

import MascotasWelcome from '../Welcome'

describe('Mascotas Welcome', () => {
  it('muestra el nombre de la app', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText('Mascotas')).toBeInTheDocument()
  })

  it('muestra el icono de la app', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText('🐾')).toBeInTheDocument()
  })

  it('muestra mensaje de próximamente', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText(/próximamente/i)).toBeInTheDocument()
  })
})
