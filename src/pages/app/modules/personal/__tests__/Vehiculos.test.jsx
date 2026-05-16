import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Vehiculos from '../Vehiculos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const subDays = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

const MOCK_VEHICULOS = [{
  id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
  itv_ultima: '2022-11-15', itv_proxima: addDays(180),
  seguro_compania: 'Mapfre', seguro_vencimiento: addDays(20),
  taller: 'Taller García', incidencias: [],
}]
const MOCK_MANT = [{
  id: 'mant-1', vehicle_id: 'veh-1', type: 'aceite', date: subDays(180),
  km: 45000, description: 'Cambio aceite', cost: 85,
  next_km: 50000, next_date: addDays(90), created_at: today.toISOString(),
}]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_appType, key) => {
    if (key === 'vehiculos') return MOCK_VEHICULOS
    if (key === 'vehiculos_mantenimiento') return MOCK_MANT
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Vehiculos', () => {
  it('renders vehicle brand and model in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/Volkswagen/)).toBeInTheDocument()
    expect(screen.getByText(/Golf/)).toBeInTheDocument()
  })

  it('shows matricula in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText('1234 ABC')).toBeInTheDocument()
  })

  it('shows ITV label in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/ITV/i)).toBeInTheDocument()
  })

  it('shows red semaphore for insurance expiring soon', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/Seguro.*\d+ d/i)).toBeInTheDocument()
  })

  it('shows Mantenimiento tab in detail view', () => {
    render(<Vehiculos />)
    fireEvent.click(screen.getByText(/Volkswagen/))
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
  })

  it('shows maintenance log after clicking Mantenimiento tab', () => {
    render(<Vehiculos />)
    fireEvent.click(screen.getByText(/Volkswagen/))
    fireEvent.click(screen.getByText('Mantenimiento'))
    expect(screen.getByText('Aceite')).toBeInTheDocument()
  })
})
