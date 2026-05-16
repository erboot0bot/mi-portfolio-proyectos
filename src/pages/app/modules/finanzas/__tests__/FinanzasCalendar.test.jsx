import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-finanzas', type: 'finanzas' } }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))

const MOCK_SUBS = [
  { id: 's1', nombre: 'Netflix', icono: '📺', coste: 17.99, periodicidad: 'mensual', fecha_renovacion: '2026-07-01', categoria: 'entretenimiento', estado: 'activa' },
  { id: 's2', nombre: 'Spotify', icono: '🎵', coste: 10.99, periodicidad: 'mensual', fecha_renovacion: '2026-07-05', categoria: 'musica', estado: 'activa' },
]
const MOCK_SEGUROS = [
  { id: 'sg1', tipo: 'hogar', nombre: 'Mutua Hogar', coste_anual: 450, vencimiento: '2027-03-01', compania: 'Mutua Madrileña', estado: 'activo' },
]

const demoWrite = vi.fn()
const demoRead = vi.fn((_t, key) => {
  if (key === 'suscripciones') return MOCK_SUBS
  if (key === 'seguros')       return MOCK_SEGUROS
  if (key === 'events')        return []
  return []
})

// Mock the path as used by the components (Suscripciones, Seguros)
vi.mock('../../../../data/demo', () => ({ demoRead, demoWrite }))

// Mock the path used by calendarUtils (imported as '../data/demo/index.js' from src/utils)
vi.mock('../../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Suscripciones → calendar', () => {
  let Suscripciones
  beforeAll(async () => { ({ default: Suscripciones } = await import('../Suscripciones')) })
  beforeEach(() => demoWrite.mockClear())

  it('shows 📅 button per subscription', () => {
    render(<Suscripciones />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThanOrEqual(2)
  })

  it('writes subscription_renewal event with monthly recurrence', () => {
    render(<Suscripciones />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('finanzas', 'events', expect.arrayContaining([
      expect.objectContaining({
        event_type: 'subscription_renewal',
        recurrence: 'monthly',
        title: expect.stringContaining('Netflix'),
      })
    ]))
  })
})

describe('Seguros → calendar', () => {
  let Seguros
  beforeAll(async () => { ({ default: Seguros } = await import('../Seguros')) })
  beforeEach(() => demoWrite.mockClear())

  it('shows 📅 button per insurance policy', () => {
    render(<Seguros />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThanOrEqual(1)
  })

  it('writes insurance_expiry event on vencimiento date', () => {
    render(<Seguros />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('finanzas', 'events', expect.arrayContaining([
      expect.objectContaining({
        event_type: 'insurance_expiry',
        title: expect.stringContaining('Mutua Hogar'),
      })
    ]))
  })
})
