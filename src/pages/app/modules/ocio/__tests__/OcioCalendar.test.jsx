import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const future = new Date(); future.setDate(future.getDate() + 15)
const fmt = d => d.toISOString().slice(0, 10)

const MOCK_EVENTOS = [
  { id: 'e1', tipo: 'concierto', titulo: 'Vetusta Morla', artista: 'Vetusta Morla', recinto: 'WiZink', ciudad: 'Madrid', fecha: fmt(future), precio: 45, estado: 'confirmado', notas: '', valoracion: 0 },
]
const MOCK_VIAJES = [
  { id: 'v1', destino: 'Tokio', pais: 'Japón', estado: 'planificado', fecha_inicio: fmt(future), fecha_fin: fmt(future),
    presupuesto: 3000, gasto_real: 0, notas: '',
    alojamiento: { nombre: 'Hotel Shinjuku', tipo: 'hotel', confirmacion: '', direccion: '' },
    transporte: [] },
]
const MOCK_DEPORTES = [
  { id: 'd1', deporte: 'Fútbol', equipo: 'FC Barcelona', competicion: 'La Liga',
    partidos: [
      { id: 'p1', rival: 'Real Madrid', es_local: true, fecha: fmt(future), goles_local: null, goles_visitante: null },
    ] },
]

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'eventos')  return MOCK_EVENTOS
  if (key === 'viajes')   return MOCK_VIAJES
  if (key === 'deportes_seguimiento') return MOCK_DEPORTES
  if (key === 'events')   return []
  return []
})
vi.mock('../../../../../data/demo', () => ({ demoRead, demoWrite }))

// ── Eventos ─────────────────────────────────────────────────────
describe('Eventos → calendar', () => {
  let Eventos
  beforeAll(async () => { ({ default: Eventos } = await import('../Eventos')) })
  beforeEach(() => demoWrite.mockClear())

  it('shows 📅 button per event', () => {
    render(<Eventos />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThan(0)
  })

  it('writes an ocio_event on 📅 click', () => {
    render(<Eventos />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'ocio_event', title: expect.stringContaining('Vetusta Morla') })
    ]))
  })
})

// ── Viajes ───────────────────────────────────────────────────────
describe('Viajes → calendar', () => {
  let Viajes
  beforeAll(async () => { ({ default: Viajes } = await import('../Viajes')) })
  beforeEach(() => demoWrite.mockClear())

  it('shows Fechas al calendario button in detail view', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Tokio'))
    expect(screen.getByText(/fechas al calendario/i)).toBeInTheDocument()
  })

  it('writes travel_checkin and travel_checkout events', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Tokio'))
    fireEvent.click(screen.getByText(/fechas al calendario/i))
    const eventsCall = demoWrite.mock.calls.find(c => c[1] === 'events')
    expect(eventsCall).toBeTruthy()
    const events = eventsCall[2]
    expect(events.some(e => e.event_type === 'travel_checkin')).toBe(true)
  })
})

// ── Deportes ─────────────────────────────────────────────────────
describe('Deportes → calendar', () => {
  let Deportes
  beforeAll(async () => { ({ default: Deportes } = await import('../Deportes')) })
  beforeEach(() => demoWrite.mockClear())

  it('shows 📅 button per upcoming match in detail view', () => {
    render(<Deportes />)
    fireEvent.click(screen.getAllByText(/FC Barcelona/)[0])
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThan(0)
  })

  it('writes a match event on 📅 click', () => {
    render(<Deportes />)
    fireEvent.click(screen.getAllByText(/FC Barcelona/)[0])
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'match', title: expect.stringContaining('Real Madrid') })
    ]))
  })
})
