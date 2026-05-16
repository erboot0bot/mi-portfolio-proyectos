import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Limpieza from '../Limpieza'

const { demoWrite, demoRead } = vi.hoisted(() => {
  const demoWrite = vi.fn()
  const demoRead  = vi.fn((_t, key) => {
    if (key === 'factory_tasks') return []
    if (key === 'events') return []
    return []
  })
  return { demoWrite, demoRead }
})

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../hooks/data/useEventsData', () => ({
  useEventsData: () => ({ events: [], loading: false, add: vi.fn(), remove: vi.fn() }),
}))
vi.mock('../ModuleShell', () => ({ default: ({ children }) => <div>{children}</div> }))

// Mock data/demo so demoWrite is captured; calendarUtils will use this mock via hoisting
vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Limpieza — Roomba schedule', () => {
  beforeEach(() => demoWrite.mockClear())

  it('shows Roomba section toggle button', () => {
    render(<Limpieza />)
    expect(screen.getByText(/roomba/i)).toBeInTheDocument()
  })

  it('opens Roomba config panel on click', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/roomba/i))
    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
  })

  it('writes a roomba event on save with selected day', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/roomba/i))
    fireEvent.click(screen.getByText('Lun'))
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10' } })
    fireEvent.click(screen.getByText(/guardar horario/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'roomba', recurrence: 'weekly' })
    ]))
  })
})

describe('Limpieza — Personal de limpieza', () => {
  beforeEach(() => demoWrite.mockClear())

  it('shows Personal de limpieza section toggle', () => {
    render(<Limpieza />)
    expect(screen.getByText(/personal de limpieza/i)).toBeInTheDocument()
  })

  it('opens the cleaner visit form on click', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/personal de limpieza/i))
    expect(screen.getByLabelText(/próxima visita/i)).toBeInTheDocument()
  })

  it('writes a cleaner_visit event on add', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/personal de limpieza/i))
    fireEvent.change(screen.getByLabelText(/próxima visita/i), { target: { value: '2026-06-15' } })
    fireEvent.click(screen.getByText(/añadir visita/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'cleaner_visit' })
    ]))
  })
})
