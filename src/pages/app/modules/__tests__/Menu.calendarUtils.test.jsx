import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Menu from '../Menu'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../hooks/usePWAManifest', () => ({ usePWAManifest: () => {} }))
vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ gte: () => ({ lte: () => ({ then: () => {} }) }) }) }) }) },
}))
vi.mock('../../../../utils/menuTransformers', () => ({
  menuEventFromDb: e => e,
  menuEventToDb:   e => e,
}))
vi.mock('../ModuleShell', () => ({ default: ({ children }) => <div>{children}</div> }))
vi.mock('../ModuleTopNav', () => ({ default: ({ title }) => <div>{title}</div> }))
vi.mock('../../../../components/BottomSheet', () => ({ default: ({ children }) => <div>{children}</div> }))

const { demoWrite, demoRead } = vi.hoisted(() => {
  const demoWrite = vi.fn()
  const demoRead  = vi.fn((_t, key) => {
    if (key === 'meal_prefs') return { desayuno: 7, almuerzo: 10, comida: 13, cena: 20 }
    if (key === 'events')  return []
    if (key === 'recipes') return []
    return {}
  })
  return { demoWrite, demoRead }
})

vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Menu — meal prefs', () => {
  it('reads meal_prefs from demo store on mount', () => {
    render(<Menu />)
    expect(demoRead).toHaveBeenCalledWith('hogar', 'meal_prefs')
  })

  it('shows ⚙️ Horarios button', () => {
    render(<Menu />)
    expect(screen.getByTitle(/horarios/i)).toBeInTheDocument()
  })

  it('opens horarios modal with hour inputs on click', () => {
    render(<Menu />)
    fireEvent.click(screen.getByTitle(/horarios/i))
    expect(screen.getByLabelText(/desayuno/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comida/i)).toBeInTheDocument()
  })

  it('saves updated hours to demo store on Guardar', () => {
    render(<Menu />)
    fireEvent.click(screen.getByTitle(/horarios/i))
    const input = screen.getByLabelText(/comida/i)
    fireEvent.change(input, { target: { value: '14' } })
    fireEvent.click(screen.getByText(/guardar/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'meal_prefs', expect.objectContaining({ comida: 14 }))
  })
})
