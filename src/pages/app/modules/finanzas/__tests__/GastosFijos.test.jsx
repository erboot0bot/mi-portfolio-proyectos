import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import GastosFijos from '../GastosFijos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'gf-1', nombre: 'Alquiler',   icono: '🏠', categoria: 'vivienda',    importe: 850, dia_cobro: 1  },
    { id: 'gf-2', nombre: 'Luz',        icono: '💡', categoria: 'suministros', importe: 94,  dia_cobro: 15 },
    { id: 'gf-3', nombre: 'Internet',   icono: '📡', categoria: 'conectividad',importe: 55,  dia_cobro: 5  },
  ],
  demoWrite: vi.fn(),
}))

describe('GastosFijos', () => {
  it('renders expense names', () => {
    render(<GastosFijos />)
    expect(screen.getByText('Alquiler')).toBeInTheDocument()
    expect(screen.getByText('Luz')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
  })

  it('shows category group headers', () => {
    render(<GastosFijos />)
    expect(screen.getByText(/Vivienda/i)).toBeInTheDocument()
    expect(screen.getByText(/Suministros/i)).toBeInTheDocument()
    expect(screen.getByText(/Conectividad/i)).toBeInTheDocument()
  })

  it('shows grand total', () => {
    render(<GastosFijos />)
    // 850 + 94 + 55 = 999
    expect(screen.getByText(/999/)).toBeInTheDocument()
  })
})
