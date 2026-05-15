import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Mascotas from '../Mascotas'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const subDays = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

const MOCK_MASCOTAS = [{
  id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
  veterinario: { nombre: 'VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
  vacunas: [{ id: 'vac-1', nombre: 'Rabia', fecha_ultima: subDays(90), proxima: addDays(275) }],
  medicacion: [], notas: 'Alérgica al pollo.',
  alimentacion_stock: [{ id: 'st-1', nombre: 'Pienso adulto', current_stock: 3000, min_stock: 500, unit: 'g' }],
  alimentacion_schedule: [{ time: '08:00', amount: '200g', label: 'Mañana' }],
}]
const MOCK_EVENTOS = [{
  id: 'ev-1', pet_id: 'mas-1', tipo: 'vet_visit', titulo: 'Revisión anual',
  start_time: addDays(15) + 'T09:00:00.000Z', all_day: true,
  metadata: { notes: 'Revisar oídos', interval_days: null, duration_minutes: null },
  created_at: today.toISOString(),
}]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_appType, key) => {
    if (key === 'mascotas') return MOCK_MASCOTAS
    if (key === 'mascotas_eventos') return MOCK_EVENTOS
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Mascotas', () => {
  it('renders pet name in list view', () => {
    render(<Mascotas />)
    expect(screen.getByText('Luna')).toBeInTheDocument()
  })

  it('shows raza in list view', () => {
    render(<Mascotas />)
    expect(screen.getByText(/Labrador/)).toBeInTheDocument()
  })

  it('shows vet name after clicking pet', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    expect(screen.getByText(/VetCare/)).toBeInTheDocument()
  })

  it('shows vaccine name in ficha tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    expect(screen.getByText('Rabia')).toBeInTheDocument()
  })

  it('shows alimentacion tab with stock item after clicking tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    fireEvent.click(screen.getByText('Alimentación'))
    expect(screen.getByText(/Pienso adulto/)).toBeInTheDocument()
  })

  it('shows salud tab with event after clicking tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    fireEvent.click(screen.getByText('Salud'))
    expect(screen.getByText(/Revisión anual/)).toBeInTheDocument()
  })
})
