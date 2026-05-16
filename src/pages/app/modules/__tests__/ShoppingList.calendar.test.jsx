import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ShoppingList from '../ShoppingList'

const { demoWrite, demoRead } = vi.hoisted(() => {
  const demoWrite = vi.fn()
  const demoRead  = vi.fn((_t, key) => {
    if (key === 'events')       return []
    if (key === 'default_store') return 'Mercadona'
    return []
  })
  return { demoWrite, demoRead }
})

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../hooks/usePWAManifest', () => ({ usePWAManifest: () => {} }))
vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ then: () => {} }) }) }) }) },
}))
vi.mock('../ModuleShell', () => ({ default: ({ children }) => <div>{children}</div> }))
vi.mock('../ModuleTopNav', () => ({ default: () => <div /> }))
vi.mock('../../../../utils/itemTransformers', () => ({ itemFromDb: i => i, itemToDb: i => i }))
vi.mock('../../../../utils/consumptionUtils', () => ({ computeConsumptionUpdate: () => ({}) }))
vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('ShoppingList — calendar integration', () => {
  beforeEach(() => demoWrite.mockClear())

  it('shows Planificar compra button', () => {
    render(<ShoppingList />)
    expect(screen.getByText(/planificar compra/i)).toBeInTheDocument()
  })

  it('opens the scheduling modal on click', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
  })

  it('writes a shopping_trip event on confirm', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-06-10' } })
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10:00' } })
    fireEvent.click(screen.getByText(/añadir al calendario/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'shopping_trip' })
    ]))
  })

  it('includes the store name in the event title', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-06-10' } })
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10:00' } })
    fireEvent.click(screen.getByText(/añadir al calendario/i))
    const eventsCall = demoWrite.mock.calls.find(c => c[1] === 'events')
    const event = eventsCall[2].find(e => e.event_type === 'shopping_trip')
    expect(event.title).toMatch(/Mercadona/)
  })
})
