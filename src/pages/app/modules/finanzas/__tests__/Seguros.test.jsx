import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Seguros from '../Seguros'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))

const today = new Date()
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().slice(0, 10) }

vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'seg-1', tipo: 'coche', nombre: 'Seguro Coche', compania: 'Mutua', poliza: 'MM-001', vencimiento: addDays(today, 20), coste_anual: 650 },
    { id: 'seg-2', tipo: 'vida',  nombre: 'Seguro Vida',  compania: 'Generali', poliza: 'GN-002', vencimiento: addDays(today, 200), coste_anual: 520 },
  ],
  demoWrite: vi.fn(),
}))

describe('Seguros', () => {
  it('renders insurance list', () => {
    render(<Seguros />)
    expect(screen.getByText('Seguro Coche')).toBeInTheDocument()
    expect(screen.getByText('Seguro Vida')).toBeInTheDocument()
  })

  it('shows total anual', () => {
    render(<Seguros />)
    // 650 + 520 = 1170 — formatted as "1.170" in es-ES locale
    expect(screen.getByText(/1[.,]170|1170/)).toBeInTheDocument()
  })

  it('shows red semaphore label for policy expiring in 20 days', () => {
    render(<Seguros />)
    // seg-1 expires in 20 days — should show "Vence en 20 días"
    expect(screen.getByText(/Vence en 20 d/i)).toBeInTheDocument()
  })

  it('shows green/neutral label for policy expiring far away', () => {
    render(<Seguros />)
    // seg-2 expires in 200 days — "Válido 200 días"
    expect(screen.getByText(/V.lido 200 d/i)).toBeInTheDocument()
  })
})
