import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Hipoteca from '../Hipoteca'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => ({
    banco: 'BBVA', gestor: 'Ana García',
    cuota_mensual: 750, dia_cobro: 1,
    capital_inicial: 180000, capital_pendiente: 142500,
    fecha_inicio: '2019-03-01', fecha_fin: '2049-03-01',
    tipo_interes: 'variable', diferencial: 0.75,
  }),
  demoWrite: vi.fn(),
}))

describe('Hipoteca', () => {
  it('renders bank name', () => {
    render(<Hipoteca />)
    expect(screen.getAllByText(/BBVA/).length).toBeGreaterThan(0)
  })

  it('shows manager name', () => {
    render(<Hipoteca />)
    expect(screen.getByText(/Ana García/)).toBeInTheDocument()
  })

  it('shows monthly payment', () => {
    render(<Hipoteca />)
    expect(screen.getByText(/750/)).toBeInTheDocument()
  })

  it('shows amortizado percentage approx 20%', () => {
    render(<Hipoteca />)
    // (180000 - 142500) / 180000 * 100 = 20.833...%
    // Rendered as "20.8%" or "20,8%" depending on locale
    expect(screen.getByText(/20[,.]8/)).toBeInTheDocument()
  })

  it('shows capital pendiente', () => {
    render(<Hipoteca />)
    // 142500 formatted as "142.500" in es-ES
    expect(screen.getByText(/142[.,]500|142500/)).toBeInTheDocument()
  })
})
