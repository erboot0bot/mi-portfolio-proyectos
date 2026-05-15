import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Vehiculos from '../Vehiculos'
vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [{
    id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
    itv_ultima: '2022-11-15', itv_proxima: addDays(180),
    seguro_compania: 'Mapfre', seguro_vencimiento: addDays(20),
    taller: 'Taller García', incidencias: [],
  }],
  demoWrite: vi.fn(),
}))
describe('Vehiculos', () => {
  it('renders vehicle brand and model', () => { render(<Vehiculos />); expect(screen.getByText(/Volkswagen/)).toBeInTheDocument(); expect(screen.getByText(/Golf/)).toBeInTheDocument() })
  it('shows matricula', () => { render(<Vehiculos />); expect(screen.getByText('1234 ABC')).toBeInTheDocument() })
  it('shows red semaphore for insurance expiring in 20 days', () => { render(<Vehiculos />); expect(screen.getByText(/Seguro.*20 d|20 d.*Seguro/i)).toBeInTheDocument() })
  it('shows ITV label', () => { render(<Vehiculos />); expect(screen.getByText(/ITV/i)).toBeInTheDocument() })
})
